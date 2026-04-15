export const WORKFLOW_STATUSES = [
  'draft',
  'active',
  'inactive',
  'archived',
] as const;

export type WorkflowStatusValue = (typeof WORKFLOW_STATUSES)[number];

