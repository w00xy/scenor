# Scenor - Complete Codebase Overview & Reference Guide

**Last Updated:** April 29, 2026
**Project Type:** Diploma Project - Workflow Automation Platform
**Status:** MVP with core features implemented

---

## QUICK START REFERENCE

### Backend Setup
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables Required
```
DATABASE_URL=postgresql://user:password@localhost:5432/scenor
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-secret-key-min-32-chars
CREDENTIALS_ENCRYPTION_KEY=64-character-hex-string-for-aes256
PORT=3000
HOSTNAME=0.0.0.0
```

---

## MODULE DEPENDENCY GRAPH

```
AppModule
├── ConfigModule (global)
├── DatabaseModule
│   └── PrismaClient
├── UsersModule
│   ├── AuthTokenService
│   └── DatabaseService
├── ProfilesModule
│   └── DatabaseService
├── ProjectsModule
│   └── DatabaseService
├── WorkflowsModule
│   ├── DatabaseService
│   └── Zod Validation
├── NodeTypesModule
│   └── DatabaseService
├── ExecutionsModule
│   ├── DatabaseService
│   └── Node Handlers
├── CredentialsModule
│   ├── DatabaseService
│   └── Crypto (AES-256-GCM)
├── WorkflowSharesModule
│   └── DatabaseService
└── InitializationModule
    ├── UsersService
    ├── NodeTypesService
    └── DatabaseService
```

---

## DATABASE RELATIONSHIPS

```
User (1) ──────────────────────── (N) UserProfile
  │
  ├─ (1) ──────────────────────── (N) Project (as owner)
  │
  ├─ (1) ──────────────────────── (N) ProjectMember
  │
  ├─ (1) ──────────────────────── (N) Workflow (as creator)
  │
  ├─ (1) ──────────────────────── (N) WorkflowShare (as creator)
  │
  └─ (1) ──────────────────────── (N) WorkflowExecution (as starter)

Project (1) ──────────────────────── (N) ProjectMember
  │
  ├─ (1) ──────────────────────── (N) Workflow
  │
  ├─ (1) ──────────────────────── (N) Credential
  │
  └─ (1) ──────────────────────── (N) ProjectMember

Workflow (1) ──────────────────────── (N) WorkflowNode
  │
  ├─ (1) ──────────────────────── (N) WorkflowEdge
  │
  ├─ (1) ──────────────────────── (N) WorkflowShare
  │
  └─ (1) ──────────────────────── (N) WorkflowExecution

WorkflowNode (1) ──────────────────────── (N) WorkflowEdge (as source)
  │
  ├─ (1) ──────────────────────── (N) WorkflowEdge (as target)
  │
  ├─ (N) ──────────────────────── (1) NodeType
  │
  └─ (N) ──────────────────────── (1) Credential

WorkflowExecution (1) ──────────────────────── (N) ExecutionNodeLog
```

---

## API AUTHENTICATION FLOW

```
1. User Registration/Login
   POST /users/register or POST /users/login
   ↓
   Response: { accessToken, refreshToken, user }
   ↓
   Frontend stores in cookies (httpOnly recommended)

2. Authenticated Request
   GET /workflows/:workflowId
   Header: Authorization: Bearer <accessToken>
   ↓
   AuthGuard validates token
   ↓
   Request proceeds or 401 Unauthorized

3. Token Refresh
   POST /users/refresh
   Body: { refreshToken }
   ↓
   Response: { accessToken, refreshToken }
   ↓
   Frontend updates cookies
```

---

## WORKFLOW EXECUTION STATE MACHINE

```
                    ┌─────────────────────────────────┐
                    │   WorkflowExecution States      │
                    └─────────────────────────────────┘

                              queued
                                │
                                ↓
                            running ←─────────────┐
                            │   │                 │
                    ┌───────┘   └──────────┐      │
                    ↓                      ↓      │
                 success              failed ─────┘
                    │                      │
                    └──────────┬───────────┘
                               ↓
                           cancelled

                    ┌─────────────────────────────────┐
                    │   NodeExecutionStatus States    │
                    └─────────────────────────────────┘

                    pending → running → success
                                  ↓
                                failed
                                  ↓
                               skipped
```

---

## NODE EXECUTION HANDLERS REFERENCE

### Manual Trigger
```typescript
Input: any
Config: {}
Output: input (pass-through)
Branches: none
```

### Set Node
```typescript
Input: any
Config: { values: Record<string, unknown> }
Output: { ...input, ...values }
Branches: none
```

### Transform Node
```typescript
Input: any
Config: { script: string }
Output: result of executing script
Branches: none
```

### If Node
```typescript
Input: any
Config: { mode: 'all' | 'any', conditions: Condition[] }
Output: input (pass-through)
Branches: ['true'] or ['false']
```

### Switch Node
```typescript
Input: any
Config: { expression: string, cases: Case[] }
Output: input (pass-through)
Branches: [matchingCaseKey] or ['default']
```

### HTTP Request Node
```typescript
Input: any
Config: { url, method, headers, query, body, timeout }
Output: { status, ok, headers, body, input }
Branches: none
```

### Code Node
```typescript
Input: any
Config: { language: 'javascript', source: string }
Output: result of executing source
Branches: none
```

### Delay Node
```typescript
Input: any
Config: { durationMs: number }
Output: input (pass-through)
Branches: none
```

---

## VALIDATION SCHEMAS QUICK REFERENCE

### User Registration
```typescript
{
  username: string (3-20 chars, alphanumeric + underscore)
  email: string (valid email format)
  password: string (min 8 chars, uppercase, lowercase, number, special)
}
```

### Create Workflow
```typescript
{
  name: string (required, trimmed)
  description?: string (optional)
  status?: 'draft' | 'active' | 'inactive' | 'archived' (default: draft)
  isPublic?: boolean (default: false)
}
```

### Create Node
```typescript
{
  type: string (must match registered node type)
  name?: string
  label?: string
  posX: number (x coordinate)
  posY: number (y coordinate)
  configJson?: Record<string, unknown> (validated by node type schema)
  credentialsId?: string (must belong to same project)
  notes?: string
  isDisabled?: boolean (default: false)
}
```

### Create Credential
```typescript
{
  type: string (e.g., 'api_key', 'oauth', 'basic_auth')
  name: string (display name)
  data: Record<string, unknown> (encrypted before storage)
}
```

---

## COMMON API PATTERNS

### List with Pagination
```
GET /resource?limit=50&offset=0

Response:
[
  { id, ...fields },
  ...
]
```

### Create Resource
```
POST /resource
Body: { ...fields }

Response:
{ id, ...fields, createdAt, updatedAt }
```

### Update Resource
```
PUT /resource/:id
Body: { field1, field2, ... }

Response:
{ id, ...updatedFields, updatedAt }
```

### Delete Resource
```
DELETE /resource/:id

Response:
{ id, message: "Resource deleted" }
```

---

## PERMISSION MATRIX

### User Roles
| Role | Capabilities |
|------|--------------|
| USER | Create projects, workflows, manage own resources |
| SUPER_ADMIN | Seed node types, manage all users |

### Project Member Roles
| Role | Workflows | Nodes | Edges | Executions | Credentials | Shares |
|------|-----------|-------|-------|-----------|-------------|--------|
| OWNER | CRUD | CRUD | CRUD | RX | CRUD | CRUD |
| EDITOR | CRUD | CRUD | CRUD | RX | CRUD | R |
| VIEWER | R | R | R | R | R | R |

Legend: C=Create, R=Read, U=Update, D=Delete, X=Execute

---

## ERROR CODES & MEANINGS

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email/username |
| 500 | Server Error | Unexpected error |

---

## PERFORMANCE BENCHMARKS

### Expected Response Times
- User login: < 100ms
- List workflows: < 200ms
- Create node: < 150ms
- Execute simple workflow: < 500ms
- Execute HTTP request node: 1-30s (depends on external API)

### Database Query Optimization
- All access checks use indexed queries
- Membership lookups limited to 1 result
- Pagination with offset/limit
- Eager loading for related data

### Execution Engine Limits
- Max workflow nodes: 1000 (practical limit)
- Max execution steps: nodes * 100
- Max HTTP timeout: 120 seconds
- Max delay duration: 24 hours

---

## SECURITY CHECKLIST

- [ ] JWT secrets are strong (32+ characters)
- [ ] Credentials encryption key is 64 hex characters
- [ ] Database has SSL/TLS enabled
- [ ] CORS origins are whitelisted
- [ ] Passwords are hashed with bcrypt
- [ ] Credentials are encrypted with AES-256-GCM
- [ ] Access tokens expire after 15 minutes
- [ ] Refresh tokens expire after 7 days
- [ ] Admin credentials are changed from defaults
- [ ] Environment variables are not committed to git

---

## TESTING CHECKLIST

### Backend Tests
- [ ] User registration validation
- [ ] User login with correct/incorrect credentials
- [ ] Token generation and verification
- [ ] Project access control
- [ ] Workflow CRUD operations
- [ ] Node configuration validation
- [ ] Workflow execution with various node types
- [ ] Credential encryption/decryption
- [ ] Workflow sharing with tokens

### Frontend Tests
- [ ] Login form validation
- [ ] Registration form validation
- [ ] Protected route redirection
- [ ] Token storage in cookies
- [ ] API error handling
- [ ] Form feedback messages

### E2E Tests
- [ ] Complete user registration flow
- [ ] Complete login flow
- [ ] Create project → workflow → nodes → execute
- [ ] Share workflow and access via token
- [ ] Update user profile

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] Node types seeded

### Deployment
- [ ] Backend deployed and running
- [ ] Frontend built and deployed
- [ ] CORS configured correctly
- [ ] SSL/TLS certificates installed
- [ ] Database backups configured
- [ ] Monitoring/logging enabled

### Post-Deployment
- [ ] Health check endpoints responding
- [ ] API endpoints accessible
- [ ] Frontend loads correctly
- [ ] Login flow works
- [ ] Workflow execution works
- [ ] Error tracking configured

---

## TROUBLESHOOTING QUICK GUIDE

### Issue: "Invalid or expired token"
**Solution:**
1. Check JWT_ACCESS_SECRET is set correctly
2. Verify token hasn't expired (15 min)
3. Try refreshing token with refresh endpoint
4. Clear cookies and login again

### Issue: "Insufficient permissions"
**Solution:**
1. Verify user is project owner or member
2. Check project member role (OWNER/EDITOR/VIEWER)
3. Verify workflow belongs to correct project
4. Check resource ownership

### Issue: "Workflow execution hangs"
**Solution:**
1. Check for infinite loops in workflow
2. Verify HTTP request timeouts
3. Check database performance
4. Review node configurations
5. Check execution logs for errors

### Issue: "Credential encryption fails"
**Solution:**
1. Verify CREDENTIALS_ENCRYPTION_KEY is 64 hex chars
2. Check key consistency across instances
3. Verify database can store encrypted data
4. Check IV and auth tag are stored

### Issue: "CORS error on frontend"
**Solution:**
1. Verify frontend origin in CORS config
2. Check credentials: true in fetch options
3. Verify Authorization header is set
4. Check backend is running on correct port

---

## FILE STRUCTURE QUICK REFERENCE

### Backend Key Files
```
backend/
├── src/
│   ├── main.ts                          # App entry point
│   ├── app.module.ts                    # Root module
│   ├── auth/
│   │   ├── auth.guard.ts               # JWT validation
│   │   ├── auth-token.service.ts       # Token generation
│   │   └── roles.guard.ts              # Role validation
│   ├── users/
│   │   ├── users.service.ts            # User logic
│   │   ├── users.controller.ts         # User endpoints
│   │   └── dto/                        # Data transfer objects
│   ├── workflows/
│   │   ├── workflows.service.ts        # Workflow logic
│   │   ├── workflows.controller.ts     # Workflow endpoints
│   │   ├── node-config.schemas.ts      # Zod validation
│   │   └── dto/
│   ├── executions/
│   │   ├── executions.service.ts       # Execution engine
│   │   ├── executions.controller.ts    # Execution endpoints
│   │   └── dto/
│   ├── credentials/
│   │   ├── credentials.service.ts      # Encryption/decryption
│   │   ├── credentials.controller.ts   # Credential endpoints
│   │   └── dto/
│   ├── node-types/
│   │   ├── node-types.service.ts       # Node registry
│   │   ├── node-types.defaults.ts      # Default node types
│   │   └── node-types.controller.ts
│   ├── database/
│   │   └── database.service.ts         # Prisma client
│   └── config/
│       └── env.config.ts               # Environment validation
├── prisma/
│   ├── schema.prisma                   # Main schema
│   ├── user.prisma                     # User models
│   ├── project.prisma                  # Project models
│   ├── workflow.prisma                 # Workflow models
│   └── migrations/                     # Database migrations
└── package.json
```

### Frontend Key Files
```
frontend/
├── src/
│   ├── main.tsx                        # Entry point
│   ├── App.tsx                         # Root component
│   ├── pages/
│   │   ├── authorization/Auth.tsx      # Login page
│   │   ├── registration/Reg.tsx        # Registration page
│   │   ├── overview/Overview.tsx       # Dashboard
│   │   └── settings/SettingsLayout.tsx # Settings
│   ├── components/
│   │   ├── auth_reg/                  # Auth components
│   │   ├── left_nav/                  # Navigation
│   │   ├── overview/                  # Dashboard components
│   │   └── settings/                  # Settings components
│   ├── hooks/
│   │   ├── useLogin.ts                # Login logic
│   │   ├── useRegister.ts             # Registration logic
│   │   ├── useProfile.ts              # Profile logic
│   │   └── useFieldFeedback.ts        # Feedback logic
│   ├── context/
│   │   ├── FieldFeedbackContext.tsx   # Feedback provider
│   │   └── MenuContext.tsx            # Menu provider
│   ├── services/
│   │   └── api.ts                     # API client
│   ├── utils/
│   │   └── validation/                # Validation functions
│   └── styles/                        # SCSS files
└── package.json
```

---

## DEVELOPMENT WORKFLOW

### Adding a New Feature

1. **Backend:**
   ```bash
   # 1. Update Prisma schema if needed
   # 2. Create migration
   npm run prisma:migrate:dev
   
   # 3. Create DTO files
   # 4. Create service with business logic
   # 5. Create controller with endpoints
   # 6. Add to module
   # 7. Test with Swagger UI
   ```

2. **Frontend:**
   ```bash
   # 1. Create hook if needed
   # 2. Create components
   # 3. Add API calls to services/api.ts
   # 4. Add validation if needed
   # 5. Test in browser
   ```

### Adding a New Node Type

1. Add to `DEFAULT_NODE_TYPES` in `node-types.defaults.ts`
2. Add Zod schema to `NODE_CONFIG_SCHEMAS` in `workflows/node-config.schemas.ts`
3. Add handler to `executeNode()` in `executions.service.ts`
4. Test execution with sample workflow

---

## USEFUL COMMANDS

### Backend
```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start:prod       # Run production build
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run prisma:migrate:dev    # Create and apply migration
npm run prisma:generate       # Generate Prisma client
npm run studio                # Open Prisma Studio
```

### Frontend
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
```

---

## RESOURCES & DOCUMENTATION

### External Documentation
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Zod Docs](https://zod.dev)

### API Documentation
- Swagger UI: `http://localhost:3000/api`
- OpenAPI spec: `http://localhost:3000/api-json`

### Database
- Prisma Studio: `npm run studio`
- PostgreSQL: `psql -U user -d scenor`

---

## CONTACT & SUPPORT

**Project:** Scenor - Workflow Automation Platform
**Type:** Diploma Project
**Created:** 2026
**Status:** MVP

For issues or questions, refer to:
1. CONTEXT.md - Project overview and architecture
2. This file - Quick reference and troubleshooting
3. Code comments - Implementation details
4. Swagger UI - API documentation

---

**End of Codebase Overview**
