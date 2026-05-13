import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Injectable, Logger } from '@nestjs/common';
import { AuthTokenService } from '../../auth/auth-token.service.js';
import { DatabaseService } from '../../database/database.service.js';
import { ProjectMemberRole } from '@prisma/client';
import { IncomingMessage } from 'http';
import { parse } from 'url';

type AuthenticatedWebSocket = WebSocket & {
  userId?: string;
  isAlive?: boolean;
  subscriptions?: Set<string>;
  subscriptionCount?: number;
  lastSubscribeTime?: number;
};

@WebSocketGateway({
  path: '/executions',
})
@Injectable()
export class ExecutionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ExecutionGateway.name);
  private executionSubscribers: Map<string, Set<AuthenticatedWebSocket>> =
    new Map();
  private heartbeatInterval?: NodeJS.Timeout;

  // Rate limiting configuration
  private readonly MAX_SUBSCRIPTIONS_PER_CLIENT = 10;
  private readonly RATE_LIMIT_WINDOW_MS = 1000; // 1 second
  private readonly MAX_SUBSCRIBES_PER_WINDOW = 5;

  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly prisma: DatabaseService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
    this.startHeartbeat();
  }

  async handleConnection(
    client: AuthenticatedWebSocket,
    request: IncomingMessage,
  ) {
    try {
      // Extract token from query string or headers
      const token = this.extractToken(request);

      if (!token) {
        this.logger.warn('Connection rejected: No token provided');
        client.send(
          JSON.stringify({
            type: 'error',
            message: 'Authentication required',
          }),
        );
        client.close(1008, 'Authentication required');
        return;
      }

      // Verify JWT token
      const payload = await this.authTokenService.verifyAccessToken(token);

      // Attach user info to client
      client.userId = payload.sub;
      client.isAlive = true;
      client.subscriptions = new Set();
      client.subscriptionCount = 0;
      client.lastSubscribeTime = 0;

      this.logger.log(`Client connected: userId=${payload.sub}`);

      // Send connection success
      client.send(
        JSON.stringify({
          type: 'connected',
          userId: payload.sub,
        }),
      );

      // Setup pong handler
      client.on('pong', () => {
        client.isAlive = true;
      });

      // Setup message handler for incoming messages
      client.on('message', (data: Buffer) => {
        this.handleMessage(client, data);
      });
    } catch (error) {
      this.logger.warn(
        `Connection rejected: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      client.send(
        JSON.stringify({
          type: 'error',
          message: 'Invalid or expired token',
        }),
      );
      client.close(1008, 'Invalid token');
    }
  }

  handleDisconnect(client: AuthenticatedWebSocket) {
    this.logger.log(`Client disconnected: userId=${client.userId}`);

    // Clean up subscriptions
    for (const subscribers of this.executionSubscribers.values()) {
      subscribers.delete(client);
    }
  }

  private handleMessage(client: AuthenticatedWebSocket, data: Buffer) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message: { event?: string; data?: unknown } = JSON.parse(
        data.toString(),
      );

      switch (message.event) {
        case 'subscribe-execution':
          void this.handleSubscribeExecution(
            client,
            message.data as { executionId: string },
          );
          break;
        case 'unsubscribe-execution':
          this.handleUnsubscribeExecution(
            client,
            message.data as { executionId: string },
          );
          break;
        case 'ping':
          this.handlePing(client);
          break;
        default:
          this.sendError(client, `Unknown event: ${String(message.event)}`);
      }
    } catch (error) {
      this.logger.error(
        `Message handling error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.sendError(client, 'Invalid message format');
    }
  }

  @SubscribeMessage('subscribe-execution')
  async handleSubscribeExecution(
    client: AuthenticatedWebSocket,
    data: { executionId: string },
  ) {
    try {
      // Check authentication
      if (!client.userId) {
        this.sendError(client, 'Not authenticated');
        return;
      }

      const { executionId } = data;

      if (!executionId || typeof executionId !== 'string') {
        this.sendError(client, 'Invalid execution ID');
        return;
      }

      // Rate limiting check
      if (!this.checkRateLimit(client)) {
        this.sendError(client, 'Rate limit exceeded. Please slow down.');
        return;
      }

      // Check max subscriptions per client
      if (
        (client.subscriptionCount || 0) >= this.MAX_SUBSCRIPTIONS_PER_CLIENT
      ) {
        this.sendError(
          client,
          `Maximum ${this.MAX_SUBSCRIPTIONS_PER_CLIENT} subscriptions per client`,
        );
        return;
      }

      // Check if already subscribed
      if (client.subscriptions?.has(executionId)) {
        this.sendError(client, 'Already subscribed to this execution');
        return;
      }

      // Verify access rights to execution
      const hasAccess = await this.verifyExecutionAccess(
        client.userId,
        executionId,
      );

      if (!hasAccess) {
        this.sendError(client, 'Access denied to this execution');
        return;
      }

      // Add subscription
      if (!this.executionSubscribers.has(executionId)) {
        this.executionSubscribers.set(executionId, new Set());
      }

      const subscribers = this.executionSubscribers.get(executionId);
      if (subscribers) {
        subscribers.add(client);
        client.subscriptions?.add(executionId);
        client.subscriptionCount = (client.subscriptionCount || 0) + 1;
      }

      this.logger.log(
        `User ${client.userId} subscribed to execution ${executionId}`,
      );

      client.send(JSON.stringify({ type: 'subscribed', executionId }));
    } catch (error) {
      this.logger.error(
        `Subscribe error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.sendError(client, 'Failed to subscribe');
    }
  }

  @SubscribeMessage('unsubscribe-execution')
  handleUnsubscribeExecution(
    client: AuthenticatedWebSocket,
    data: { executionId: string },
  ) {
    try {
      const { executionId } = data;

      if (!executionId || typeof executionId !== 'string') {
        this.sendError(client, 'Invalid execution ID');
        return;
      }

      const subscribers = this.executionSubscribers.get(executionId);
      if (subscribers) {
        subscribers.delete(client);
        client.subscriptions?.delete(executionId);
        client.subscriptionCount = Math.max(
          0,
          (client.subscriptionCount || 0) - 1,
        );
      }

      this.logger.log(
        `User ${client.userId} unsubscribed from execution ${executionId}`,
      );

      client.send(JSON.stringify({ type: 'unsubscribed', executionId }));
    } catch (error) {
      this.logger.error(
        `Unsubscribe error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.sendError(client, 'Failed to unsubscribe');
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: AuthenticatedWebSocket) {
    client.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
  }

  broadcastExecutionUpdate(executionId: string, data: unknown) {
    const subscribers = this.executionSubscribers.get(executionId);
    if (subscribers) {
      const message = JSON.stringify({
        type: 'execution-update',
        executionId,
        data,
      });
      subscribers.forEach((client) => {
        if (client.readyState === 1) {
          // WebSocket.OPEN
          client.send(message);
        }
      });
    }
  }

  broadcastNodeLog(executionId: string, nodeLog: unknown) {
    const subscribers = this.executionSubscribers.get(executionId);
    if (subscribers) {
      const message = JSON.stringify({
        type: 'node-log',
        executionId,
        nodeLog,
      });
      subscribers.forEach((client) => {
        if (client.readyState === 1) {
          client.send(message);
        }
      });
    }
  }

  private extractToken(request: IncomingMessage): string | null {
    // Try to get token from query string
    const { query } = parse(request.url || '', true);
    if (query.token && typeof query.token === 'string') {
      return query.token;
    }

    // Try to get token from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  private async verifyExecutionAccess(
    userId: string,
    executionId: string,
  ): Promise<boolean> {
    try {
      // Load execution with workflow and project
      const execution = await this.prisma.workflowExecution.findUnique({
        where: { id: executionId },
        include: {
          workflow: {
            include: {
              project: {
                include: {
                  members: {
                    where: { userId },
                    select: { role: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      if (!execution) {
        return false;
      }

      const project = execution.workflow.project;

      // Check if user is project owner
      if (project.ownerId === userId) {
        return true;
      }

      // Check if user is project member with appropriate role
      const member = project.members[0];
      if (
        member &&
        [
          ProjectMemberRole.OWNER,
          ProjectMemberRole.EDITOR,
          ProjectMemberRole.VIEWER,
        ].includes(member.role)
      ) {
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Access verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  private checkRateLimit(client: AuthenticatedWebSocket): boolean {
    const now = Date.now();
    const lastTime = client.lastSubscribeTime || 0;

    // Reset counter if window has passed
    if (now - lastTime > this.RATE_LIMIT_WINDOW_MS) {
      client.lastSubscribeTime = now;
      return true;
    }

    // Within window, check if limit exceeded
    // This is a simple implementation; for production, use a proper rate limiter
    return true; // Allow for now, can be enhanced with counter
  }

  private sendError(client: AuthenticatedWebSocket, message: string) {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'error', message }));
    }
  }

  private startHeartbeat() {
    // Send ping every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (!this.server || !this.server.clients) {
        return;
      }

      this.server.clients.forEach((client: WebSocket) => {
        const authClient = client as AuthenticatedWebSocket;

        if (authClient.isAlive === false) {
          this.logger.warn(
            `Terminating inactive client: userId=${authClient.userId}`,
          );
          return authClient.terminate();
        }

        authClient.isAlive = false;
        authClient.ping();
      });
    }, 30000); // 30 seconds

    this.logger.log('Heartbeat started (30s interval)');
  }

  onModuleDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.logger.log('Heartbeat stopped');
    }
  }
}
