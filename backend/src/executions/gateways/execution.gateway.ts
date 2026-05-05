import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'executions',
  transports: ['websocket'],
})
@Injectable()
export class ExecutionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private executionSubscribers: Map<string, Set<WebSocket>> = new Map();

  handleConnection(client: WebSocket) {
    console.log(`Client connected: ${(client as any).id}`);
  }

  handleDisconnect(client: WebSocket) {
    console.log(`Client disconnected: ${(client as any).id}`);
    // Clean up subscriptions
    for (const subscribers of this.executionSubscribers.values()) {
      subscribers.delete(client);
    }
  }

  @SubscribeMessage('subscribe-execution')
  handleSubscribeExecution(client: WebSocket, data: { executionId: string }) {
    const { executionId } = data;
    if (!this.executionSubscribers.has(executionId)) {
      this.executionSubscribers.set(executionId, new Set());
    }
    const subscribers = this.executionSubscribers.get(executionId);
    if (subscribers) {
      subscribers.add(client);
    }
    client.send(JSON.stringify({ type: 'subscribed', executionId }));
  }

  @SubscribeMessage('unsubscribe-execution')
  handleUnsubscribeExecution(client: WebSocket, data: { executionId: string }) {
    const { executionId } = data;
    const subscribers = this.executionSubscribers.get(executionId);
    if (subscribers) {
      subscribers.delete(client);
    }
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
        if (client.readyState === 1) { // WebSocket.OPEN
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
}
