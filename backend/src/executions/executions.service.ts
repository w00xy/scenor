import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {
  ExecutionStatus,
  NodeExecutionStatus,
  Prisma,
  ProjectMemberRole,
  Role,
  TriggerType,
  WorkflowEdge,
  WorkflowNode,
} from '@prisma/client';
import { DatabaseService } from '../database/database.service.js';
import { ExecutionGateway } from './gateways/execution.gateway.js';

type NodeExecutionResult = {
  output: unknown;
  branches?: string[];
};

type QueueItem = {
  nodeId: string;
  payload: unknown;
};

type WorkflowWithGraph = Awaited<
  ReturnType<ExecutionsService['requireWorkflowGraphAccess']>
>;

type WorkflowGraphMinimal = {
  id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

@Injectable()
export class ExecutionsService implements OnModuleInit {
  private readonly logger = new Logger(ExecutionsService.name);

  /** Maximum concurrent workflow executions */
  private static readonly MAX_CONCURRENT = 10;
  private activeExecutions = 0;
  private pendingQueue: Array<() => void> = [];

  constructor(
    private readonly prisma: DatabaseService,
    private readonly executionGateway: ExecutionGateway,
  ) {}

  async onModuleInit() {
    await this.recoverStaleExecutions();
  }

  /**
   * Marks executions stuck in "running" state as failed.
   * Called on startup — these are executions that were running
   * when the server previously shut down.
   */
  private async recoverStaleExecutions() {
    const stale = await this.prisma.workflowExecution.findMany({
      where: { status: ExecutionStatus.running },
      select: { id: true },
    });

    if (stale.length === 0) {
      return;
    }

    this.logger.warn(
      `Found ${stale.length} stale execution(s) in "running" state — marking as failed`,
    );

    await this.prisma.workflowExecution.updateMany({
      where: { status: ExecutionStatus.running },
      data: {
        status: ExecutionStatus.failed,
        finishedAt: new Date(),
        errorMessage: 'Server restarted during execution',
      },
    });
  }

  /**
   * Acquire an execution slot. If MAX_CONCURRENT slots are taken,
   * the caller is queued until one is released.
   */
  private async acquireExecutionSlot(): Promise<void> {
    if (this.activeExecutions < ExecutionsService.MAX_CONCURRENT) {
      this.activeExecutions++;
      return;
    }

    return new Promise<void>((resolve) => {
      this.pendingQueue.push(resolve);
    });
  }

  /**
   * Release an execution slot, allowing the next queued execution to start.
   */
  private releaseExecutionSlot(): void {
    this.activeExecutions--;
    const next = this.pendingQueue.shift();
    if (next) {
      this.activeExecutions++;
      next();
    }
  }

  async createManualExecution(
    userId: string,
    workflowId: string,
    inputDataJson?: Record<string, unknown>,
  ) {
    const workflow = await this.requireWorkflowGraphAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        startedByUserId: userId,
        triggerType: TriggerType.manual,
        status: ExecutionStatus.queued,
        startedAt: new Date(),
        inputDataJson: this.toNullablePrismaJson(inputDataJson ?? {}),
      },
    });

    // Broadcast queued status — frontend subscribes, will receive progress
    this.executionGateway.broadcastExecutionUpdate(execution.id, {
      id: execution.id,
      status: 'queued',
      workflowId: execution.workflowId,
      startedAt: execution.startedAt,
      finishedAt: null,
      totalNodes: this.countActiveNodes(workflow.nodes),
      completedNodes: 0,
      error: null,
    });

    // Run async — do NOT await, HTTP response returns immediately
    setImmediate(() => {
      this.executeWorkflowAsync(execution.id, workflow, inputDataJson);
    });

    return execution;
  }

  /**
   * @deprecated Use createManualExecution for async two-phase execution.
   * Kept for backward compatibility with tests and internal callers.
   */
  async runManualWorkflow(
    userId: string,
    workflowId: string,
    inputDataJson?: Record<string, unknown>,
  ) {
    const workflow = await this.requireWorkflowGraphAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        startedByUserId: userId,
        triggerType: TriggerType.manual,
        status: ExecutionStatus.running,
        startedAt: new Date(),
        inputDataJson: this.toNullablePrismaJson(inputDataJson ?? {}),
      },
    });

    // Broadcast execution started
    this.executionGateway.broadcastExecutionUpdate(execution.id, {
      id: execution.id,
      status: execution.status,
      workflowId: execution.workflowId,
      startedAt: execution.startedAt,
      finishedAt: null,
      totalNodes: this.countActiveNodes(workflow.nodes),
      completedNodes: 0,
      error: null,
    });

    try {
      const result = await this.executeGraph(
        execution.id,
        workflow.nodes,
        workflow.edges,
        inputDataJson ?? {},
      );

      const finishedExecution = await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.success,
          finishedAt: new Date(),
          outputDataJson: this.toNullablePrismaJson({
            nodeOutputs: result.outputs,
            executedSteps: result.executedSteps,
          }),
          errorMessage: null,
        },
      });

      // Broadcast execution completed successfully
      this.executionGateway.broadcastExecutionUpdate(execution.id, {
        id: execution.id,
        status: finishedExecution.status,
        workflowId: execution.workflowId,
        startedAt: execution.startedAt,
        finishedAt: finishedExecution.finishedAt,
        totalNodes: this.countActiveNodes(workflow.nodes),
        completedNodes: result.executedSteps,
        executedSteps: result.executedSteps,
        outputDataJson: finishedExecution.outputDataJson,
        error: null,
      });

      return finishedExecution;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Workflow execution failed';

      const failedExecution = await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.failed,
          finishedAt: new Date(),
          errorMessage: message,
        },
      });

      // Broadcast execution failed
      this.executionGateway.broadcastExecutionUpdate(execution.id, {
        id: execution.id,
        status: failedExecution.status,
        workflowId: execution.workflowId,
        startedAt: execution.startedAt,
        finishedAt: failedExecution.finishedAt,
        totalNodes: this.countActiveNodes(workflow.nodes),
        completedNodes: 0,
        error: failedExecution.errorMessage,
      });

      return failedExecution;
    }
  }

  private async executeWorkflowAsync(
    executionId: string,
    workflow: WorkflowWithGraph | WorkflowGraphMinimal,
    inputDataJson?: Record<string, unknown>,
  ) {
    await this.acquireExecutionSlot();
    try {
      await this._executeWorkflowUnsafe(executionId, workflow, inputDataJson);
    } finally {
      this.releaseExecutionSlot();
    }
  }

  /**
   * Actual execution logic, called from executeWorkflowAsync
   * after acquiring an execution slot. NOT safe to call directly —
   * does not manage the concurrency limiter.
   */
  private async _executeWorkflowUnsafe(
    executionId: string,
    workflow: WorkflowWithGraph | WorkflowGraphMinimal,
    inputDataJson?: Record<string, unknown>,
  ) {
    // Phase 2: update status → running
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: ExecutionStatus.running },
    });

    this.executionGateway.broadcastExecutionUpdate(executionId, {
      id: executionId,
      status: 'running',
      workflowId: workflow.id,
      startedAt: new Date(),
      finishedAt: null,
      totalNodes: this.countActiveNodes(workflow.nodes),
      completedNodes: 0,
      error: null,
    });

    try {
      const result = await this.executeGraph(
        executionId,
        workflow.nodes,
        workflow.edges,
        inputDataJson ?? {},
      );

      const finishedExecution = await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: ExecutionStatus.success,
          finishedAt: new Date(),
          outputDataJson: this.toNullablePrismaJson({
            nodeOutputs: result.outputs,
            executedSteps: result.executedSteps,
          }),
          errorMessage: null,
        },
      });

      this.executionGateway.broadcastExecutionUpdate(executionId, {
        id: executionId,
        status: 'success',
        workflowId: workflow.id,
        startedAt: finishedExecution.startedAt,
        finishedAt: finishedExecution.finishedAt,
        totalNodes: this.countActiveNodes(workflow.nodes),
        completedNodes: result.executedSteps,
        executedSteps: result.executedSteps,
        outputDataJson: finishedExecution.outputDataJson,
        error: null,
      });
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : 'Workflow execution failed';

      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: ExecutionStatus.failed,
          finishedAt: new Date(),
          errorMessage: message,
        },
      });

      this.executionGateway.broadcastExecutionUpdate(executionId, {
        id: executionId,
        status: 'failed',
        workflowId: workflow.id,
        startedAt: null,
        finishedAt: new Date(),
        totalNodes: this.countActiveNodes(workflow.nodes),
        completedNodes: 0,
        error: message,
      });
    }
  }

  async listWorkflowExecutions(
    userId: string,
    workflowId: string,
    limit = 50,
    offset = 0,
  ) {
    await this.requireWorkflowGraphAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
      ProjectMemberRole.VIEWER,
    ]);

    const safeLimit = this.normalizePaginationLimit(limit);
    const safeOffset = this.normalizePaginationOffset(offset);

    return this.prisma.workflowExecution.findMany({
      where: { workflowId },
      orderBy: { startedAt: 'desc' },
      take: safeLimit,
      skip: safeOffset,
    });
  }

  async getWorkflowExecution(userId: string, workflowId: string, executionId: string) {
    await this.requireWorkflowGraphAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
      ProjectMemberRole.VIEWER,
    ]);

    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id: executionId, workflowId },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    return execution;
  }

  async getExecutionLogs(
    userId: string,
    workflowId: string,
    executionId: string,
    limit = 200,
    offset = 0,
  ) {
    await this.requireWorkflowGraphAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
      ProjectMemberRole.VIEWER,
    ]);

    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id: executionId, workflowId },
      select: { id: true },
    });
    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    const safeLimit = this.normalizePaginationLimit(limit, 500);
    const safeOffset = this.normalizePaginationOffset(offset);

    return this.prisma.executionNodeLog.findMany({
      where: { executionId },
      orderBy: { startedAt: 'asc' },
      take: safeLimit,
      skip: safeOffset,
    });
  }

  private async executeGraph(
    executionId: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    inputPayload: Record<string, unknown>,
  ) {
    if (nodes.length === 0) {
      throw new BadRequestException('Workflow has no nodes');
    }

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const totalActiveNodes = nodes.filter((n) => !n.isDisabled).length;
    let completedNodes = 0;

    const outgoingByNodeId = new Map<string, WorkflowEdge[]>();
    const incomingCountByNodeId = new Map<string, number>();

    for (const node of nodes) {
      outgoingByNodeId.set(node.id, []);
      incomingCountByNodeId.set(node.id, 0);
    }

    for (const edge of edges) {
      const outgoing = outgoingByNodeId.get(edge.sourceNodeId) ?? [];
      outgoing.push(edge);
      outgoingByNodeId.set(edge.sourceNodeId, outgoing);

      incomingCountByNodeId.set(
        edge.targetNodeId,
        (incomingCountByNodeId.get(edge.targetNodeId) ?? 0) + 1,
      );
    }

    const triggerNodes = nodes.filter((node) => node.typeCode === 'manual_trigger');
    const startNodes =
      triggerNodes.length > 0
        ? triggerNodes
        : nodes.filter((node) => (incomingCountByNodeId.get(node.id) ?? 0) === 0);

    if (startNodes.length === 0) {
      throw new BadRequestException(
        'Cannot determine start nodes (graph may be cyclic)',
      );
    }

    const queue: QueueItem[] = startNodes.map((node) => ({
      nodeId: node.id,
      payload: inputPayload,
    }));

    const outputs: Record<string, unknown[]> = {};
    let executedSteps = 0;
    let safetyGuard = 0;
    const maxSteps = Math.max(nodes.length * 100, 1000);

    while (queue.length > 0) {
      safetyGuard += 1;
      if (safetyGuard > maxSteps) {
        throw new BadRequestException(
          `Execution aborted: reached safety limit (${maxSteps} steps)`,
        );
      }

      const item = queue.shift();
      if (!item) {
        continue;
      }

      const node = nodeById.get(item.nodeId);
      if (!node) {
        continue;
      }

      if (node.isDisabled) {
        const skippedLog = await this.prisma.executionNodeLog.create({
          data: {
            executionId,
            nodeId: node.id,
            status: NodeExecutionStatus.skipped,
            startedAt: new Date(),
            finishedAt: new Date(),
            inputJson: this.toNullablePrismaJson(item.payload),
            outputJson: this.toNullablePrismaJson(item.payload),
          },
        });

        // Broadcast skipped node log
        this.executionGateway.broadcastNodeLog(executionId, skippedLog, {
          nodeName: node.label || node.name,
          nodeType: node.typeCode,
        });

        for (const edge of outgoingByNodeId.get(node.id) ?? []) {
          queue.push({
            nodeId: edge.targetNodeId,
            payload: item.payload,
          });
        }
        continue;
      }

      executedSteps += 1;
      const log = await this.prisma.executionNodeLog.create({
        data: {
          executionId,
          nodeId: node.id,
          status: NodeExecutionStatus.running,
          startedAt: new Date(),
          inputJson: this.toNullablePrismaJson(item.payload),
        },
      });

      // Broadcast node started
      this.executionGateway.broadcastNodeLog(executionId, log, {
        nodeName: node.label || node.name,
        nodeType: node.typeCode,
      });

      try {
        const result = await this.executeNode(node, item.payload, executionId);

        const updatedLog = await this.prisma.executionNodeLog.update({
          where: { id: log.id },
          data: {
            status: NodeExecutionStatus.success,
            finishedAt: new Date(),
            outputJson: this.toNullablePrismaJson(result.output),
          },
        });

        // Broadcast node completed successfully
        completedNodes += 1;
        this.executionGateway.broadcastNodeLog(executionId, updatedLog, {
          nodeName: node.label || node.name,
          nodeType: node.typeCode,
        });
        this.executionGateway.broadcastExecutionUpdate(executionId, {
          id: executionId,
          status: 'running',
          totalNodes: totalActiveNodes,
          completedNodes,
        });

        if (!outputs[node.id]) {
          outputs[node.id] = [];
        }
        outputs[node.id].push(result.output);

        const edgesToFollow = this.filterOutgoingEdges(
          outgoingByNodeId.get(node.id) ?? [],
          result.branches,
        );
        for (const edge of edgesToFollow) {
          queue.push({
            nodeId: edge.targetNodeId,
            payload: result.output,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Node execution failed';

        const failedLog = await this.prisma.executionNodeLog.update({
          where: { id: log.id },
          data: {
            status: NodeExecutionStatus.failed,
            finishedAt: new Date(),
            errorMessage: message,
          },
        });

        // Broadcast node failed
        this.executionGateway.broadcastNodeLog(executionId, failedLog, {
          nodeName: node.label || node.name,
          nodeType: node.typeCode,
        });

        throw error;
      }
    }

    return { outputs, executedSteps };
  }

  private async executeNode(
    node: WorkflowNode,
    input: unknown,
    executionId: string,
  ): Promise<NodeExecutionResult> {
    const config = (node.configJson ?? {}) as Record<string, unknown>;

    switch (node.typeCode) {
      case 'manual_trigger':
        return { output: input };
      case 'set':
        return this.executeSetNode(input, config);
      case 'transform':
        return this.executeTransformNode(input, config);
      case 'if':
        return this.executeIfNode(input, config);
      case 'switch':
        return this.executeSwitchNode(input, config);
      case 'delay':
        return this.executeDelayNode(input, config);
      case 'code':
        return this.executeCodeNode(input, config, executionId);
      case 'http_request':
        return this.executeHttpRequestNode(input, config);
      case 'db_select':
      case 'db_insert':
        throw new BadRequestException(
          `Node "${node.typeCode}" execution is not implemented yet`,
        );
      default:
        return { output: input };
    }
  }

  private executeSetNode(
    input: unknown,
    config: Record<string, unknown>,
  ): NodeExecutionResult {
    const values =
      config.values && typeof config.values === 'object'
        ? (config.values as Record<string, unknown>)
        : {};
    const base = this.toObject(input);
    return { output: { ...base, ...values } };
  }

  private executeTransformNode(
    input: unknown,
    config: Record<string, unknown>,
  ): NodeExecutionResult {
    const script =
      typeof config.script === 'string' && config.script.trim().length > 0
        ? config.script
        : 'return input;';
    const fn = new Function('input', script);
    const output = fn(input);
    return { output };
  }

  private executeIfNode(
    input: unknown,
    config: Record<string, unknown>,
  ): NodeExecutionResult {
    const conditions = Array.isArray(config.conditions)
      ? config.conditions
      : [];
    const mode = config.mode === 'any' ? 'any' : 'all';

    if (conditions.length === 0) {
      return { output: input, branches: ['true'] };
    }

    const evaluations = conditions.map((condition) =>
      this.evaluateCondition(condition, input),
    );
    const passed =
      mode === 'all' ? evaluations.every(Boolean) : evaluations.some(Boolean);

    return { output: input, branches: [passed ? 'true' : 'false'] };
  }

  private executeSwitchNode(
    input: unknown,
    config: Record<string, unknown>,
  ): NodeExecutionResult {
    const rawExpression = String(config.expression ?? '{{input}}');
    const expressionValue = this.resolveTemplateValue(rawExpression, input);
    const cases = Array.isArray(config.cases) ? config.cases : [];

    for (let index = 0; index < cases.length; index += 1) {
      const item = cases[index] as Record<string, unknown>;
      const caseValue = item.value;
      if (this.areValuesEqual(expressionValue, caseValue)) {
        const branch =
          (typeof item.key === 'string' && item.key) ||
          (typeof item.label === 'string' && item.label) ||
          String(index);
        return { output: input, branches: [branch] };
      }
    }

    return { output: input, branches: ['default'] };
  }

  private async executeDelayNode(
    input: unknown,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const durationMsRaw = Number(config.durationMs ?? 1000);
    const durationMs = Number.isFinite(durationMsRaw)
      ? Math.max(1, Math.min(60000, Math.floor(durationMsRaw)))
      : 1000;
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    return { output: input };
  }

  private executeCodeNode(
    input: unknown,
    config: Record<string, unknown>,
    executionId: string,
  ): NodeExecutionResult {
    const source = String(config.source ?? 'return input;');
    const fn = new Function('input', 'config', 'context', source);
    const output = fn(input, config, { executionId });
    return { output };
  }

  private async executeHttpRequestNode(
    input: unknown,
    config: Record<string, unknown>,
  ): Promise<NodeExecutionResult> {
    const urlRaw = String(config.url ?? '').trim();
    if (!urlRaw) {
      throw new BadRequestException('HTTP node requires config.url');
    }
    const method = String(config.method ?? 'GET').toUpperCase();
    const headers = this.toStringRecord(config.headers);
    const query = this.toRecord(config.query);
    const timeoutRaw = Number(config.timeout ?? 10000);
    const timeoutMs = Number.isFinite(timeoutRaw)
      ? Math.max(100, Math.min(120000, Math.floor(timeoutRaw)))
      : 10000;

    const url = new URL(urlRaw);
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue;
      }
      url.searchParams.set(key, String(value));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const body =
        config.body === undefined || method === 'GET' || method === 'HEAD'
          ? undefined
          : JSON.stringify(config.body);
      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body,
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') ?? '';
      const responseBody = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      return {
        output: {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody,
          input,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new BadRequestException('HTTP request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private filterOutgoingEdges(edges: WorkflowEdge[], branches?: string[]) {
    if (!branches || branches.length === 0) {
      const plainEdges = edges.filter(
        (edge) => !edge.conditionType && !edge.sourceHandle,
      );
      return plainEdges.length > 0 ? plainEdges : edges;
    }

    const branchSet = new Set(branches.map((branch) => branch.toLowerCase()));
    const matching = edges.filter((edge) => {
      const candidates = [
        edge.conditionType?.toLowerCase(),
        edge.sourceHandle?.toLowerCase(),
        edge.label?.toLowerCase(),
      ].filter(Boolean) as string[];
      return candidates.some((value) => branchSet.has(value));
    });

    if (matching.length > 0) {
      return matching;
    }

    return edges.filter((edge) => !edge.conditionType && !edge.sourceHandle);
  }

  private evaluateCondition(condition: unknown, input: unknown): boolean {
    const item = this.toRecord(condition);
    const left = this.resolveTemplateValue(String(item.left ?? ''), input);
    const right =
      typeof item.right === 'string'
        ? this.resolveTemplateValue(item.right, input)
        : item.right;
    const operator = String(item.operator ?? 'equals').toLowerCase();

    switch (operator) {
      case 'equals':
      case '==':
        return this.areValuesEqual(left, right);
      case 'not_equals':
      case '!=':
        return !this.areValuesEqual(left, right);
      case 'gt':
      case '>':
        return Number(left) > Number(right);
      case 'gte':
      case '>=':
        return Number(left) >= Number(right);
      case 'lt':
      case '<':
        return Number(left) < Number(right);
      case 'lte':
      case '<=':
        return Number(left) <= Number(right);
      case 'contains':
        return String(left).includes(String(right ?? ''));
      case 'not_contains':
        return !String(left).includes(String(right ?? ''));
      case 'in':
        return Array.isArray(right) && right.some((itemValue) => this.areValuesEqual(itemValue, left));
      case 'not_in':
        return Array.isArray(right) && !right.some((itemValue) => this.areValuesEqual(itemValue, left));
      case 'is_empty':
        return left === null || left === undefined || String(left).trim() === '';
      case 'is_not_empty':
        return !(left === null || left === undefined || String(left).trim() === '');
      default:
        return this.areValuesEqual(left, right);
    }
  }

  private resolveTemplateValue(value: string, input: unknown): unknown {
    const trimmed = value.trim();
    const match = trimmed.match(/^{{\s*([^}]+)\s*}}$/);
    if (!match) {
      return value;
    }

    const expression = match[1].trim();
    if (expression === 'input') {
      return input;
    }
    if (expression.startsWith('input.')) {
      const path = expression.slice('input.'.length);
      return this.getByPath(input, path);
    }

    return value;
  }

  private getByPath(input: unknown, path: string): unknown {
    if (!path) {
      return input;
    }
    const source = this.toRecord(input);
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, source);
  }

  private areValuesEqual(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  private toObject(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private toStringRecord(value: unknown): Record<string, string> {
    const source = this.toRecord(value);
    const result: Record<string, string> = {};
    for (const [key, item] of Object.entries(source)) {
      if (item === undefined || item === null) {
        continue;
      }
      result[key] = String(item);
    }
    return result;
  }

  private countActiveNodes(nodes: WorkflowNode[]): number {
    return nodes.filter((n) => !n.isDisabled).length;
  }

  private toNullablePrismaJson(
    value: unknown,
  ): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull {
    if (value === null || value === undefined) {
      return Prisma.JsonNull;
    }

    const normalized = JSON.parse(JSON.stringify(value)) as unknown;
    if (normalized === null) {
      return Prisma.JsonNull;
    }

    return normalized as Prisma.InputJsonValue;
  }

  private normalizePaginationLimit(value: number, max = 100) {
    if (!Number.isInteger(value) || value < 1 || value > max) {
      throw new BadRequestException(
        `limit must be an integer between 1 and ${max}`,
      );
    }
    return value;
  }

  private normalizePaginationOffset(value: number) {
    if (!Number.isInteger(value) || value < 0) {
      throw new BadRequestException(
        'offset must be an integer greater than or equal to 0',
      );
    }
    return value;
  }

  async createWebhookExecution(
    workflowId: string,
    webhookToken: string,
    inputDataJson: Record<string, unknown>,
  ) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        edges: true,
        project: true,
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // Verify webhook token matches workflow's webhook trigger node
    const webhookNode = workflow.nodes.find(
      (node) => node.typeCode === 'webhook_trigger',
    );

    if (!webhookNode) {
      throw new BadRequestException(
        'Workflow does not have a webhook trigger node',
      );
    }

    const config = webhookNode.configJson as Record<string, unknown>;
    const configuredPath = config.path as string | undefined;
    if (configuredPath !== webhookToken) {
      throw new BadRequestException('Invalid webhook token');
    }

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        startedByUserId: null,
        triggerType: TriggerType.webhook,
        status: ExecutionStatus.queued,
        startedAt: new Date(),
        inputDataJson: this.toNullablePrismaJson(inputDataJson),
      },
    });

    // Broadcast queued status
    this.executionGateway.broadcastExecutionUpdate(execution.id, {
      id: execution.id,
      status: 'queued',
      workflowId: execution.workflowId,
      startedAt: execution.startedAt,
      finishedAt: null,
      totalNodes: this.countActiveNodes(workflow.nodes),
      completedNodes: 0,
      error: null,
    });

    // Run async — do NOT await
    setImmediate(() => {
      this.executeWorkflowAsync(execution.id, workflow, inputDataJson);
    });

    return execution;
  }

  /**
   * @deprecated Use createWebhookExecution for async two-phase execution.
   * Kept for backward compatibility.
   */
  async runWebhookWorkflow(
    workflowId: string,
    webhookToken: string,
    inputDataJson: Record<string, unknown>,
  ) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        edges: true,
        project: true,
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // Verify webhook token matches workflow's webhook trigger node
    const webhookNode = workflow.nodes.find(
      (node) => node.typeCode === 'webhook_trigger',
    );

    if (!webhookNode) {
      throw new BadRequestException(
        'Workflow does not have a webhook trigger node',
      );
    }

    const config = webhookNode.configJson as Record<string, unknown>;
    const configuredPath = config.path as string | undefined;
    if (configuredPath !== webhookToken) {
      throw new BadRequestException('Invalid webhook token');
    }

    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        startedByUserId: null,
        triggerType: TriggerType.webhook,
        status: ExecutionStatus.running,
        startedAt: new Date(),
        inputDataJson: this.toNullablePrismaJson(inputDataJson),
      },
    });

    // Broadcast webhook execution started
    this.executionGateway.broadcastExecutionUpdate(execution.id, {
      status: execution.status,
      startedAt: execution.startedAt,
      workflowId: execution.workflowId,
      triggerType: execution.triggerType,
    });

    try {
      const result = await this.executeGraph(
        execution.id,
        workflow.nodes,
        workflow.edges,
        inputDataJson,
      );

      const finishedExecution = await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.success,
          finishedAt: new Date(),
          outputDataJson: this.toNullablePrismaJson({
            nodeOutputs: result.outputs,
            executedSteps: result.executedSteps,
          }),
          errorMessage: null,
        },
      });

      // Broadcast webhook execution completed
      this.executionGateway.broadcastExecutionUpdate(execution.id, {
        status: finishedExecution.status,
        finishedAt: finishedExecution.finishedAt,
        outputDataJson: finishedExecution.outputDataJson,
        executedSteps: result.executedSteps,
      });

      return finishedExecution;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Workflow execution failed';

      const failedExecution = await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.failed,
          finishedAt: new Date(),
          errorMessage: message,
        },
      });

      // Broadcast webhook execution failed
      this.executionGateway.broadcastExecutionUpdate(execution.id, {
        status: failedExecution.status,
        finishedAt: failedExecution.finishedAt,
        errorMessage: failedExecution.errorMessage,
      });

      return failedExecution;
    }
  }

  async deleteWorkflowExecution(
    userId: string,
    workflowId: string,
    executionId: string,
    reason?: string,
  ) {
    // Load user to check global role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Load workflow with access check
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
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
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // Determine user's role in the project
    const projectRole =
      workflow.project.ownerId === userId
        ? ProjectMemberRole.OWNER
        : workflow.project.members[0]?.role;

    if (!projectRole) {
      throw new ForbiddenException('You do not have access to this workflow');
    }

    // Load execution and verify it belongs to this workflow
    const execution = await this.prisma.workflowExecution.findFirst({
      where: { id: executionId, workflowId },
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    // Safety check: prevent deletion of running executions
    if (execution.status === ExecutionStatus.running) {
      throw new BadRequestException(
        'Cannot delete execution that is currently running',
      );
    }

    // Authorization check: determine if user can delete this execution
    const isSuperAdmin = user.role === Role.SUPER_ADMIN;
    const isOwner = projectRole === ProjectMemberRole.OWNER;
    const isExecutionInitiator = execution.startedByUserId === userId;
    const isEditor = projectRole === ProjectMemberRole.EDITOR;

    const canDelete =
      isSuperAdmin ||
      isOwner ||
      (isEditor && isExecutionInitiator);

    if (!canDelete) {
      throw new ForbiddenException(
        'Only project owners or execution initiators can delete executions',
      );
    }

    // Perform deletion in transaction with audit logging
    const result = await this.prisma.$transaction(async (tx) => {
      // Create audit record before deletion
      const auditRecord = await tx.executionDeletionAudit.create({
        data: {
          executionId: execution.id,
          workflowId: workflow.id,
          workflowName: workflow.name,
          deletedByUserId: userId,
          deletedByRole: projectRole,
          executionStatus: execution.status,
          executionStartedAt: execution.startedAt,
          executionFinishedAt: execution.finishedAt,
          nodeLogsCount: execution._count.logs,
          reason: reason?.trim() || null,
        },
      });

      // Delete execution (cascade deletes all logs)
      await tx.workflowExecution.delete({
        where: { id: executionId },
      });

      return {
        success: true,
        message: 'Execution deleted successfully',
        deletedExecutionId: executionId,
        deletedLogsCount: execution._count.logs,
        auditId: auditRecord.id,
      };
    });

    return result;
  }

  private async requireWorkflowGraphAccess(
    userId: string,
    workflowId: string,
    allowedRoles: ProjectMemberRole[],
  ) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        edges: true,
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
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const role =
      workflow.project.ownerId === userId
        ? ProjectMemberRole.OWNER
        : workflow.project.members[0]?.role;

    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenException('Insufficient workflow permissions');
    }

    return workflow;
  }
}

