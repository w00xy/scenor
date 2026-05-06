# Scenor - Implementation Guide & Code Examples

**Purpose:** Detailed guide for developers working on the Scenor codebase
**Last Updated:** April 29, 2026

---

## TABLE OF CONTENTS

1. [Adding New Features](#adding-new-features)
2. [Code Examples](#code-examples)
3. [Best Practices](#best-practices)
4. [Common Patterns](#common-patterns)
5. [Debugging Guide](#debugging-guide)

---

## ADDING NEW FEATURES

### Step 1: Backend - Create DTO

**File:** `backend/src/feature/dto/create-feature.dto.ts`

```typescript
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### Step 2: Backend - Create Service

**File:** `backend/src/feature/feature.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { CreateFeatureDto } from './dto/index.js';

@Injectable()
export class FeatureService {
  constructor(private readonly prisma: DatabaseService) {}

  async createFeature(userId: string, projectId: string, data: CreateFeatureDto) {
    // 1. Verify access
    await this.requireProjectAccess(userId, projectId, ['OWNER', 'EDITOR']);

    // 2. Create resource
    return this.prisma.feature.create({
      data: {
        projectId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      },
    });
  }

  async getFeatureById(userId: string, featureId: string) {
    // 1. Get resource
    const feature = await this.prisma.feature.findUnique({
      where: { id: featureId },
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

    // 2. Check existence
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    // 3. Check access
    const role =
      feature.project.ownerId === userId
        ? 'OWNER'
        : feature.project.members[0]?.role;

    if (!role) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return feature;
  }

  private async requireProjectAccess(
    userId: string,
    projectId: string,
    allowedRoles: string[],
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId },
          select: { role: true },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const role =
      project.ownerId === userId ? 'OWNER' : project.members[0]?.role;

    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenException('Insufficient project permissions');
    }

    return { project, role };
  }
}
```

### Step 3: Backend - Create Controller

**File:** `backend/src/feature/feature.controller.ts`

```typescript
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthTokenPayload } from '../auth/auth-token.service.js';
import { FeatureService } from './feature.service.js';
import { CreateFeatureDto } from './dto/index.js';

type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

@ApiTags('Features')
@Controller('projects/:projectId/features')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Create feature' })
  @ApiResponse({ status: 201, description: 'Feature created' })
  async createFeature(
    @Req() request: AuthenticatedRequest,
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() data: CreateFeatureDto,
  ) {
    const userId = this.requireUserId(request);
    return this.featureService.createFeature(userId, projectId, data);
  }

  @Get(':featureId')
  @ApiOperation({ summary: 'Get feature' })
  @ApiResponse({ status: 200, description: 'Feature retrieved' })
  async getFeature(
    @Req() request: AuthenticatedRequest,
    @Param('featureId', new ParseUUIDPipe()) featureId: string,
  ) {
    const userId = this.requireUserId(request);
    return this.featureService.getFeatureById(userId, featureId);
  }

  private requireUserId(request: AuthenticatedRequest): string {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return userId;
  }
}
```

### Step 4: Backend - Create Module

**File:** `backend/src/feature/feature.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { FeatureService } from './feature.service.js';
import { FeatureController } from './feature.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

### Step 5: Backend - Add to App Module

**File:** `backend/src/app.module.ts`

```typescript
import { FeatureModule } from './feature/feature.module.js';

@Module({
  imports: [
    // ... other modules
    FeatureModule,
  ],
  // ...
})
export class AppModule {}
```

### Step 6: Frontend - Create Hook

**File:** `frontend/src/hooks/useFeature.ts`

```typescript
import { useState } from 'react';
import { useFieldFeedbackContext } from '../context/FieldFeedbackContext';

export function useFeature() {
  const { showFeedback } = useFieldFeedbackContext();
  const [isLoading, setIsLoading] = useState(false);

  const createFeature = async (
    projectId: string,
    name: string,
    description?: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/features`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('accessToken')}`,
          },
          body: JSON.stringify({ name, description }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to create feature');
      }

      const data = await response.json();
      showFeedback('Feature created successfully', 'success');
      return data;
    } catch (error: any) {
      showFeedback(error.message || 'Error creating feature', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createFeature, isLoading };
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}
```

### Step 7: Frontend - Create Component

**File:** `frontend/src/components/feature/FeatureForm.tsx`

```typescript
import React, { useState } from 'react';
import { useFeature } from '../../hooks/useFeature';

interface FeatureFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function FeatureForm({ projectId, onSuccess }: FeatureFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createFeature, isLoading } = useFeature();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      await createFeature(projectId, name, description);
      setName('');
      setDescription('');
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Feature name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isLoading}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Feature'}
      </button>
    </form>
  );
}
```

---

## CODE EXAMPLES

### Example 1: Adding a New Node Type

**Step 1: Define in defaults**

```typescript
// backend/src/node-types/node-types.defaults.ts
{
  code: 'email_send',
  displayName: 'Send Email',
  category: NodeCategory.action,
  description: 'Send email via SMTP',
  icon: 'action-email',
  isTrigger: false,
  supportsCredentials: true,
  schemaJson: {
    type: 'object',
    required: ['to', 'subject', 'body'],
    properties: {
      to: { type: 'string' },
      subject: { type: 'string' },
      body: { type: 'string' },
      cc: { type: 'string' },
      bcc: { type: 'string' },
    },
  },
  defaultConfigJson: {
    to: '',
    subject: '',
    body: '',
    cc: '',
    bcc: '',
  },
}
```

**Step 2: Add validation schema**

```typescript
// backend/src/workflows/node-config.schemas.ts
const emailSendConfigSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  cc: z.string().email().optional(),
  bcc: z.string().email().optional(),
});

const NODE_CONFIG_SCHEMAS = {
  // ... other schemas
  email_send: emailSendConfigSchema,
};
```

**Step 3: Add handler**

```typescript
// backend/src/executions/executions.service.ts
private async executeNode(
  node: WorkflowNode,
  input: unknown,
  executionId: string,
): Promise<NodeExecutionResult> {
  const config = (node.configJson ?? {}) as Record<string, unknown>;

  switch (node.typeCode) {
    // ... other cases
    case 'email_send':
      return this.executeEmailSendNode(input, config, node.credentialsId);
    default:
      return { output: input };
  }
}

private async executeEmailSendNode(
  input: unknown,
  config: Record<string, unknown>,
  credentialsId?: string,
): Promise<NodeExecutionResult> {
  // Get credentials if needed
  let credentials = {};
  if (credentialsId) {
    const cred = await this.prisma.credential.findUnique({
      where: { id: credentialsId },
    });
    credentials = this.decrypt(cred?.encryptedData as Record<string, unknown>);
  }

  // Send email
  const result = await sendEmail({
    to: String(config.to),
    subject: String(config.subject),
    body: String(config.body),
    cc: config.cc ? String(config.cc) : undefined,
    bcc: config.bcc ? String(config.bcc) : undefined,
    credentials,
  });

  return { output: result };
}
```

### Example 2: Implementing Conditional Logic

```typescript
// backend/src/executions/executions.service.ts
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

  // Evaluate all conditions
  const evaluations = conditions.map((condition) =>
    this.evaluateCondition(condition, input),
  );

  // Determine if passed based on mode
  const passed =
    mode === 'all' ? evaluations.every(Boolean) : evaluations.some(Boolean);

  return { output: input, branches: [passed ? 'true' : 'false'] };
}

private evaluateCondition(condition: unknown, input: unknown): boolean {
  const item = this.toRecord(condition);
  const left = this.resolveTemplateValue(String(item.left ?? ''), input);
  const right =
    typeof item.right === 'string'
      ? this.resolveTemplateValue(item.right, input)
      : item.right;
  const operator = String(item.operator ?? 'equals').toLowerCase();

  // Support multiple operators
  switch (operator) {
    case 'equals':
      return this.areValuesEqual(left, right);
    case 'contains':
      return String(left).includes(String(right ?? ''));
    case 'gt':
      return Number(left) > Number(right);
    case 'lt':
      return Number(left) < Number(right);
    default:
      return false;
  }
}
```

### Example 3: Error Handling Pattern

```typescript
// backend/src/workflows/workflows.service.ts
async createNode(
  userId: string,
  workflowId: string,
  data: CreateWorkflowNodeDto,
) {
  try {
    // 1. Verify access
    const { workflow } = await this.requireWorkflowAccess(userId, workflowId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.EDITOR,
    ]);

    // 2. Validate node type
    const normalizedType = data.type.trim();
    const nodeType = await this.resolveNodeType(normalizedType, data.nodeTypeId);

    // 3. Validate credentials scope
    await this.validateCredentialProjectScope(
      workflow.projectId,
      data.credentialsId,
    );

    // 4. Validate configuration
    const rawConfig =
      data.configJson ??
      ((nodeType.defaultConfigJson as Record<string, unknown>) ?? {});
    const validatedConfig = validateNodeConfigByType(normalizedType, rawConfig);

    // 5. Create node
    return this.prisma.workflowNode.create({
      data: {
        workflowId,
        nodeTypeId: nodeType.id,
        typeCode: normalizedType,
        name: data.name?.trim() || null,
        label: data.label?.trim() || null,
        posX: data.posX,
        posY: data.posY,
        configJson: validatedConfig as Prisma.InputJsonValue,
        credentialsId: data.credentialsId ?? null,
        notes: data.notes?.trim() || null,
        isDisabled: data.isDisabled ?? false,
      },
    });
  } catch (error) {
    // Specific error handling
    if (error instanceof BadRequestException) {
      throw error; // Re-throw validation errors
    }
    if (error instanceof NotFoundException) {
      throw error; // Re-throw not found errors
    }
    // Log unexpected errors
    console.error('Unexpected error creating node:', error);
    throw new BadRequestException('Failed to create node');
  }
}
```

---

## BEST PRACTICES

### 1. Access Control

**Always verify access before operations:**

```typescript
// ✅ GOOD
async updateWorkflow(userId: string, workflowId: string, data: UpdateWorkflowDto) {
  // Verify access first
  await this.requireWorkflowAccess(userId, workflowId, [
    ProjectMemberRole.OWNER,
    ProjectMemberRole.EDITOR,
  ]);

  // Then perform operation
  return this.prisma.workflow.update({
    where: { id: workflowId },
    data: updateData,
  });
}

// ❌ BAD
async updateWorkflow(userId: string, workflowId: string, data: UpdateWorkflowDto) {
  // No access check!
  return this.prisma.workflow.update({
    where: { id: workflowId },
    data: updateData,
  });
}
```

### 2. Input Validation

**Always validate and sanitize input:**

```typescript
// ✅ GOOD
const name = data.name.trim();
if (!name) {
  throw new BadRequestException('Name cannot be empty');
}

// ❌ BAD
const name = data.name; // No trimming or validation
```

### 3. Error Messages

**Provide clear, actionable error messages:**

```typescript
// ✅ GOOD
throw new BadRequestException(
  'Invalid config for node "http_request": url: Invalid url',
);

// ❌ BAD
throw new BadRequestException('Invalid config');
```

### 4. Database Queries

**Optimize queries with proper selection:**

```typescript
// ✅ GOOD - Only select needed fields
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, role: true },
});

// ❌ BAD - Selects all fields
const user = await this.prisma.user.findUnique({
  where: { id: userId },
});
```

### 5. Async/Await

**Use async/await consistently:**

```typescript
// ✅ GOOD
async createWorkflow(userId: string, projectId: string, data: CreateWorkflowDto) {
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
  });
  
  if (!project) {
    throw new NotFoundException('Project not found');
  }

  return this.prisma.workflow.create({
    data: { projectId, createdBy: userId, ...data },
  });
}

// ❌ BAD - Mixing promises
createWorkflow(userId: string, projectId: string, data: CreateWorkflowDto) {
  return this.prisma.project.findUnique({
    where: { id: projectId },
  }).then(project => {
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.workflow.create({
      data: { projectId, createdBy: userId, ...data },
    });
  });
}
```

---

## COMMON PATTERNS

### Pattern 1: Resource Access Check

```typescript
private async requireWorkflowAccess(
  userId: string,
  workflowId: string,
  allowedRoles: ProjectMemberRole[],
) {
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

  const role =
    workflow.project.ownerId === userId
      ? ProjectMemberRole.OWNER
      : workflow.project.members[0]?.role;

  if (!role || !allowedRoles.includes(role)) {
    throw new ForbiddenException('Insufficient workflow permissions');
  }

  return { workflow, role };
}
```

### Pattern 2: Conditional Update

```typescript
async updateWorkflow(
  userId: string,
  workflowId: string,
  data: UpdateWorkflowDto,
) {
  await this.requireWorkflowAccess(userId, workflowId, [
    ProjectMemberRole.OWNER,
    ProjectMemberRole.EDITOR,
  ]);

  const updateData: Prisma.WorkflowUncheckedUpdateInput = {};

  // Only include fields that were provided
  if (data.name !== undefined) {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new BadRequestException('Workflow name cannot be empty');
    }
    updateData.name = trimmedName;
  }

  if (data.description !== undefined) {
    updateData.description = data.description.trim() || null;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (Object.keys(updateData).length === 0) {
    throw new BadRequestException('No fields provided for update');
  }

  return this.prisma.workflow.update({
    where: { id: workflowId },
    data: updateData,
  });
}
```

### Pattern 3: Pagination

```typescript
async listWorkflows(
  userId: string,
  projectId: string,
  limit = 50,
  offset = 0,
) {
  // Validate pagination parameters
  const safeLimit = this.normalizePaginationLimit(limit);
  const safeOffset = this.normalizePaginationOffset(offset);

  return this.prisma.workflow.findMany({
    where: { projectId },
    orderBy: { updatedAt: 'desc' },
    take: safeLimit,
    skip: safeOffset,
  });
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
```

---

## DEBUGGING GUIDE

### Backend Debugging

**1. Enable Debug Logging**

```typescript
// Add to service
private readonly logger = new Logger(FeatureService.name);

async createFeature(userId: string, projectId: string, data: CreateFeatureDto) {
  this.logger.debug(`Creating feature for user ${userId} in project ${projectId}`);
  
  try {
    const result = await this.prisma.feature.create({
      data: { projectId, name: data.name },
    });
    
    this.logger.debug(`Feature created: ${result.id}`);
    return result;
  } catch (error) {
    this.logger.error(`Failed to create feature: ${error.message}`, error);
    throw error;
  }
}
```

**2. Use Prisma Studio**

```bash
npm run studio
# Opens http://localhost:5555
```

**3. Check Database Directly**

```bash
psql -U user -d scenor
SELECT * FROM workflows WHERE id = 'workflow-id';
```

### Frontend Debugging

**1. Browser DevTools**

```typescript
// Add console logs
console.log('Creating feature:', { projectId, name, description });

// Check network tab for API calls
// Check Application tab for cookies
```

**2. React DevTools**

```bash
# Install React DevTools browser extension
# Inspect component state and props
```

**3. Check API Responses**

```typescript
const response = await fetch('/api/features');
console.log('Response status:', response.status);
console.log('Response body:', await response.json());
```

---

## SUMMARY

This implementation guide provides:
- Step-by-step feature addition process
- Real code examples for common tasks
- Best practices for security and performance
- Common patterns used throughout the codebase
- Debugging techniques for troubleshooting

For more details, refer to:
- CONTEXT.md - Architecture overview
- CODEBASE_OVERVIEW.md - Quick reference
- Source code comments - Implementation details

