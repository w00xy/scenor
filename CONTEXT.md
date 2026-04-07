# CONTEXT.md

## Project Overview

I am building a diploma project inspired by n8n.  
This is a workflow automation platform with a visual editor where users can create workflows from nodes connected by edges.

The project is **not a full clone of n8n**, but an **MVP / simplified version** with a custom UI and a smaller feature set.  
The goal is to implement a clean architecture that is scalable, understandable, and suitable for a diploma project.

Tech stack:

- **Backend:** Nest.js
- **Language:** TypeScript
- **ORM:** Prisma 7.6.0
- **Database:** PostgreSQL
- **Frontend:** React + Typescript

---

## Core Product Idea

The system allows users to:

- register and authenticate
- create projects
- create workflows inside projects
- visually build workflows from nodes and edges
- share workflows with other users or by public link
- run workflows
- inspect execution history and node logs

The workflow is represented as a **directed graph**:

- **nodes** = actions / triggers / logic blocks / data blocks
- **edges** = connections between nodes

---

## Architecture Principles

### 1. Workflows are graphs
A workflow is a graph of nodes and edges.

### 2. Nodes are universal entities
Do **not** create a separate database table for each node type.

Correct approach:

- one table for node type definitions
- one table for workflow node instances
- one table for edges
- node-specific settings stored in JSON/JSONB

### 3. Runtime data must be separated from design-time data
Do not store execution results in workflow node records.

Separate:
- workflow structure
- node type definitions
- execution runs
- per-node execution logs

### 4. Secrets must be separated from node config
Credentials must be stored in a dedicated table, not directly inside node config.

---

## Main Domain Entities

### User
A platform user.

Fields:
- id
- username
- email
- passwordHash
- globalRole
- createdAt
- updatedAt

Global roles:
- `super_admin`
- `user`

### Project
Container for workflows.

Fields:
- id
- ownerId
- name
- description
- isArchived
- createdAt
- updatedAt

### ProjectMember
Users with access to a project.

Fields:
- id
- projectId
- userId
- role
- invitedBy
- createdAt

Project roles:
- `owner`
- `editor`
- `viewer`

### Workflow
A workflow inside a project.

Fields:
- id
- projectId
- createdBy
- name
- description
- status
- version
- isPublic
- createdAt
- updatedAt

Workflow statuses:
- `draft`
- `active`
- `inactive`
- `archived`

### NodeType
A catalog/registry of available node types.

Examples:
- `manual_trigger`
- `webhook_trigger`
- `http_request`
- `if`
- `set`
- `code`
- `delay`
- `db_select`
- `db_insert`

Fields:
- id
- code
- displayName
- category
- description
- icon
- isTrigger
- supportsCredentials
- schemaJson
- defaultConfigJson
- isActive
- createdAt
- updatedAt

Node categories:
- `trigger`
- `action`
- `logic`
- `data`
- `integration`

### Credential
Stores secrets / external connections.

Examples:
- API keys
- bot tokens
- database connection credentials

Fields:
- id
- userId
- type
- name
- encryptedData
- createdAt
- updatedAt

### WorkflowNode
A concrete node instance inside a workflow.

Fields:
- id
- workflowId
- nodeTypeId (nullable)
- type
- name
- label
- posX
- posY
- configJson
- credentialsId (nullable)
- notes
- isDisabled
- createdAt
- updatedAt

Important:
- `type` contains node code such as `http_request`
- `configJson` stores node-specific configuration
- `credentialsId` points to secrets if needed

### WorkflowEdge
Connections between nodes.

Fields:
- id
- workflowId
- sourceNodeId
- targetNodeId
- sourceHandle
- targetHandle
- conditionType
- label
- createdAt

Important:
- source/target handles are needed for nodes with multiple outputs, e.g. `true/false`, `success/error`

### WorkflowShare
Public or shared access to a workflow.

Fields:
- id
- workflowId
- token
- accessType
- expiresAt
- createdBy
- createdAt

Access types:
- `view`
- `comment`
- `edit`

### WorkflowExecution
A single execution run of a workflow.

Fields:
- id
- workflowId
- startedByUserId
- triggerType
- status
- startedAt
- finishedAt
- inputDataJson
- outputDataJson
- errorMessage

Trigger types:
- `manual`
- `webhook`
- `schedule`
- `system`

Execution statuses:
- `queued`
- `running`
- `success`
- `failed`
- `cancelled`

### ExecutionNodeLog
Execution log for a node inside a workflow execution.

Fields:
- id
- executionId
- nodeId
- status
- startedAt
- finishedAt
- inputJson
- outputJson
- errorMessage

Node execution statuses:
- `pending`
- `running`
- `success`
- `failed`
- `skipped`

---

## Database Design Decisions

### Why `node_types` exists
The system needs a registry of supported node types.

This allows:
- frontend to render a list of available nodes
- backend to know supported node categories
- default node configs
- future schema validation
- easier extensibility

### Why `workflow_nodes` is universal
All concrete nodes are stored in one table.  
Different node behavior is defined by `type` and `configJson`.

This is better than creating tables like:
- `http_request_nodes`
- `if_nodes`
- `code_nodes`

That approach is not scalable.

### Why `configJson` is used
Each node type has different config fields.

Examples:

#### HTTP Request node config
```json
{
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer {{token}}"
  },
  "query": {},
  "body": null,
  "timeout": 10000
}

IF node config
{
  "conditions": [
    {
      "left": "{{input.status}}",
      "operator": "equals",
      "right": "success"
    }
  ],
  "mode": "all"
}
Code node config
{
  "language": "javascript",
  "source": "return { result: input.a + input.b }"
}

Because configs differ by node type, JSON/JSONB is the correct storage approach.

Why credentials are separate

Sensitive values such as:

tokens
passwords
API keys
connection strings

must not be stored directly in node config.

Node config may reference credentialsId, while secret data is stored in credentials.encryptedData.

Why execution data is separate

Workflow structure and runtime state are different concerns.

Design-time:

workflows
nodes
edges

Runtime:

executions
node logs

This separation makes the architecture cleaner and easier to maintain.

Recommended Backend Architecture

Use a registry-based node system.

NodeDefinition

Describes a node type.

Suggested shape:

type
displayName
category
inputs
outputs
defaultConfig
schema
supportsCredentials
isTrigger
NodeHandler

Each node type must have a backend handler that executes it.

Example idea:

ManualTriggerNodeHandler
HttpRequestNodeHandler
IfNodeHandler
CodeNodeHandler
NodeRegistry

A central registry maps node type code to:

node definition
validation schema
execution handler

Example:

http_request -> HTTP handler
if -> IF handler
code -> Code handler

The execution engine should:

load workflow
load nodes and edges
determine execution order
resolve node handler by node.type
execute node
write execution log
Validation Strategy

Use Zod for validating node config before saving or executing.

Each node type should define its own schema.

Example for HTTP request node:

url
method
headers
query
body

Validation should happen:

when node is created
when node config is updated
before execution
Recommended MVP Node Set

For the diploma MVP, do not implement too many nodes.

Recommended initial node types:

Triggers
manual_trigger
webhook_trigger
Logic
if
switch
Data
set
transform
Actions / Integrations
http_request
code
delay
Database / Storage
db_select
db_insert

This is enough for a solid MVP.

Access Model
Global access

Stored in users.globalRole.

Project-level access

Stored in project_members.role.

Public link access

Stored in workflow_shares.

Do not model public guests as normal users if they only use shared links.

Prisma Notes

Prisma version:

6.12.0

Database:

PostgreSQL

UUIDs are used as primary keys.

Preferred approach:

maintain schema in schema.prisma
use migrations
use PostgreSQL JSONB where appropriate
Important Coding Preferences

When generating backend code, follow these rules:

Use TypeScript
Use Express
Use Prisma
Keep code modular
Separate:
routes
controllers
services
repositories/data layer
node handlers
validation schemas
Prefer clean architecture over quick hacks
Keep naming consistent with database schema
Use DTOs and validation where useful
Avoid storing runtime state inside workflow definition entities
Write code in a way that is easy to explain in a diploma defense
Important Naming Conventions

Use clear names matching the domain:

User
Project
ProjectMember
Workflow
NodeType
Credential
WorkflowNode
WorkflowEdge
WorkflowShare
WorkflowExecution
ExecutionNodeLog

Use snake_case in SQL tables and columns.
Use camelCase in TypeScript/Prisma fields where appropriate.

What the AI assistant should help with

When writing code for this project, help with:

Prisma schema
SQL migrations
Express routes/controllers/services
workflow creation/update logic
node creation/update logic
node registry architecture
execution engine design
validation with Zod
access control rules
seed scripts for node types
DTOs and TypeScript types
clean backend folder structure

The assistant should preserve the architectural principles above and avoid suggesting a separate table for every node type.

Summary

This project is a simplified n8n-like workflow automation platform built as a diploma project.

Key architectural decisions:

workflows are directed graphs
node types are stored in a registry
workflow nodes are universal entities
node config is stored as JSONB
secrets are stored separately in credentials
execution state is stored separately from workflow structure
Prisma + PostgreSQL + Express + TypeScript are the core stack

The codebase should be written as a scalable MVP with clean architecture and good explainability