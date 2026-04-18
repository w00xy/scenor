import { NodeCategory, Prisma } from '@prisma/client';

export type DefaultNodeTypeSeed = {
  code: string;
  displayName: string;
  category: NodeCategory;
  description: string;
  icon: string | null;
  isTrigger: boolean;
  supportsCredentials: boolean;
  schemaJson: Prisma.InputJsonValue;
  defaultConfigJson: Prisma.InputJsonValue;
};

export const DEFAULT_NODE_TYPES: DefaultNodeTypeSeed[] = [
  {
    code: 'manual_trigger',
    displayName: 'Manual Trigger',
    category: NodeCategory.trigger,
    description: 'Starts workflow manually',
    icon: 'trigger-manual',
    isTrigger: true,
    supportsCredentials: false,
    schemaJson: { type: 'object' },
    defaultConfigJson: {},
  },
  {
    code: 'webhook_trigger',
    displayName: 'Webhook Trigger',
    category: NodeCategory.trigger,
    description: 'Starts workflow by incoming webhook',
    icon: 'trigger-webhook',
    isTrigger: true,
    supportsCredentials: false,
    schemaJson: {
      type: 'object',
      required: ['path', 'method'],
      properties: { path: { type: 'string' }, method: { type: 'string' } },
    },
    defaultConfigJson: { path: '/hook', method: 'POST' },
  },
  {
    code: 'if',
    displayName: 'IF',
    category: NodeCategory.logic,
    description: 'Branch execution by condition',
    icon: 'logic-if',
    isTrigger: false,
    supportsCredentials: false,
    schemaJson: {
      type: 'object',
      properties: { mode: { type: 'string' }, conditions: { type: 'array' } },
    },
    defaultConfigJson: { mode: 'all', conditions: [] },
  },
  {
    code: 'switch',
    displayName: 'Switch',
    category: NodeCategory.logic,
    description: 'Route data between multiple branches',
    icon: 'logic-switch',
    isTrigger: false,
    supportsCredentials: false,
    schemaJson: {
      type: 'object',
      properties: { expression: { type: 'string' }, cases: { type: 'array' } },
    },
    defaultConfigJson: { expression: '{{input.value}}', cases: [] },
  },
  {
    code: 'set',
    displayName: 'Set',
    category: NodeCategory.data,
    description: 'Create or override data fields',
    icon: 'data-set',
    isTrigger: false,
    supportsCredentials: false,
    schemaJson: {
      type: 'object',
      properties: { values: { type: 'object' } },
    },
    defaultConfigJson: { values: {} },
  },
  {
    code: 'transform',
    displayName: 'Transform',
    category: NodeCategory.data,
    description: 'Transform data payload',
    icon: 'data-transform',
    isTrigger: false,
    supportsCredentials: false,
    schemaJson: { type: 'object', properties: { script: { type: 'string' } } },
    defaultConfigJson: { script: 'return input;' },
  },
  {
    code: 'http_request',
    displayName: 'HTTP Request',
    category: NodeCategory.integration,
    description: 'Perform HTTP request',
    icon: 'integration-http',
    isTrigger: false,
    supportsCredentials: true,
    schemaJson: {
      type: 'object',
      required: ['url', 'method'],
      properties: {
        url: { type: 'string' },
        method: { type: 'string' },
        headers: { type: 'object' },
        body: {},
      },
    },
    defaultConfigJson: {
      url: 'https://api.example.com/resource',
      method: 'GET',
      headers: {},
      query: {},
      body: null,
      timeout: 10000,
    },
  },
  {
    code: 'code',
    displayName: 'Code',
    category: NodeCategory.action,
    description: 'Execute custom JavaScript snippet',
    icon: 'action-code',
    isTrigger: false,
    supportsCredentials: false,
    schemaJson: {
      type: 'object',
      required: ['source'],
      properties: { language: { type: 'string' }, source: { type: 'string' } },
    },
    defaultConfigJson: {
      language: 'javascript',
      source: 'return input;',
    },
  },
  {
    code: 'delay',
    displayName: 'Delay',
    category: NodeCategory.action,
    description: 'Pause workflow execution for a duration',
    icon: 'action-delay',
    isTrigger: false,
    supportsCredentials: false,
    schemaJson: {
      type: 'object',
      required: ['durationMs'],
      properties: { durationMs: { type: 'number' } },
    },
    defaultConfigJson: { durationMs: 1000 },
  },
  {
    code: 'db_select',
    displayName: 'DB Select',
    category: NodeCategory.integration,
    description: 'Read records from database',
    icon: 'integration-db-select',
    isTrigger: false,
    supportsCredentials: true,
    schemaJson: {
      type: 'object',
      properties: { table: { type: 'string' }, where: { type: 'object' } },
    },
    defaultConfigJson: { table: '', where: {} },
  },
  {
    code: 'db_insert',
    displayName: 'DB Insert',
    category: NodeCategory.integration,
    description: 'Insert records into database',
    icon: 'integration-db-insert',
    isTrigger: false,
    supportsCredentials: true,
    schemaJson: {
      type: 'object',
      properties: { table: { type: 'string' }, values: { type: 'object' } },
    },
    defaultConfigJson: { table: '', values: {} },
  },
];
