import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

const conditionSchema = z.object({
  left: z.string(),
  operator: z.string(),
  right: z.unknown(),
});

const webhookTriggerConfigSchema = z.object({
  path: z.string().min(1),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('POST'),
});

const ifConfigSchema = z.object({
  mode: z.enum(['all', 'any']).default('all'),
  conditions: z.array(conditionSchema).default([]),
});

const switchConfigSchema = z.object({
  expression: z.string().default('{{input.value}}'),
  cases: z.array(z.unknown()).default([]),
});

const setConfigSchema = z.object({
  values: z.record(z.string(), z.unknown()).default({}),
});

const transformConfigSchema = z.object({
  script: z.string().default('return input;'),
});

const httpRequestConfigSchema = z.object({
  url: z.string().url(),
  method: z.enum(httpMethods).default('GET'),
  headers: z.record(z.string(), z.string()).default({}),
  query: z.record(z.string(), z.unknown()).default({}),
  body: z.unknown().nullable().optional(),
  timeout: z.number().int().positive().max(120000).default(10000),
});

const codeConfigSchema = z.object({
  language: z.enum(['javascript']).default('javascript'),
  source: z.string().min(1),
});

const delayConfigSchema = z.object({
  durationMs: z.number().int().min(1).max(86400000).default(1000),
});

const dbSelectConfigSchema = z.object({
  table: z.string().min(1),
  where: z.record(z.string(), z.unknown()).default({}),
});

const dbInsertConfigSchema = z.object({
  table: z.string().min(1),
  values: z.record(z.string(), z.unknown()),
});

const emptyConfigSchema = z.object({});

const NODE_CONFIG_SCHEMAS = {
  manual_trigger: emptyConfigSchema,
  webhook_trigger: webhookTriggerConfigSchema,
  if: ifConfigSchema,
  switch: switchConfigSchema,
  set: setConfigSchema,
  transform: transformConfigSchema,
  http_request: httpRequestConfigSchema,
  code: codeConfigSchema,
  delay: delayConfigSchema,
  db_select: dbSelectConfigSchema,
  db_insert: dbInsertConfigSchema,
} as const;

export function validateNodeConfigByType(type: string, config: unknown) {
  const schema =
    NODE_CONFIG_SCHEMAS[type as keyof typeof NODE_CONFIG_SCHEMAS] ??
    emptyConfigSchema;

  const result = schema.safeParse(config ?? {});
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'config'}: ${issue.message}`)
      .join('; ');
    throw new BadRequestException(`Invalid config for node "${type}": ${message}`);
  }

  return result.data as Record<string, unknown>;
}

