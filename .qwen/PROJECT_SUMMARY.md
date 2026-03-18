The user wants me to create a comprehensive project summary in markdown format based on the conversation history. I need to extract key information about the project, its architecture, current state, and development plan. Let me organize this information following the specified markdown format.# Project Summary

## Overall Goal
Develop a backend for ai.scenor.ru — a SaaS platform that enables marketers, producers, and content creators to generate and edit video scripts using AI assistance.

---

## Key Knowledge

### Technology Stack
- **Backend Framework:** FastAPI (Python 3.12+)
- **Database:** PostgreSQL 15 (async SQLAlchemy 2.0)
- **Authentication:** JWT tokens (access + refresh) with PyJWT
- **Password Hashing:** Argon2 via `pwdlib`
- **Containerization:** Docker + Docker Compose
- **Package Manager:** `uv` (with `pyproject.toml`)
- **Testing:** pytest + pytest-asyncio

### Architecture
- **Current:** Monolithic structure designed for future microservices migration
- **Pattern:** Repository pattern for data access, dependency injection for services
- **API Versioning:** `/api/v1/` prefix with modular endpoints
- **Planned Microservices:** Auth Service, Scenario Service, AI Service, Notification Service

### Project Structure
```
backend/
├── app/
│   ├── api/v1/endpoints/    # Route handlers (auth, users, scenarios, etc.)
│   ├── core/                # Config, JWT, security, dependencies
│   ├── database/            # Models, schemas, engine
│   ├── repositories/        # Data access layer
│   ├── schemas/             # Pydantic models
│   └── tests/               # Test files
├── migrations/              # Alembic migrations
└── tests/                   # Integration tests
```

### Key Commands
- **Run tests:** `cd backend && uv run pytest`
- **Run server:** `python main.py` or `docker-compose up -d`
- **Run migrations:** `docker-compose exec backend alembic upgrade head`
- **API Docs:** `/docs` (Swagger UI), `/redoc` (ReDoc)

### User Preferences
- Output language: **English** (mandatory)
- Code style: Follow existing conventions (async/await, repository pattern, type hints)
- Minimal comments in code; focus on *why* not *what*
- Tests required for all new features

---

## Recent Actions

### Analysis Completed
- Reviewed entire codebase structure and existing implementations
- Identified current capabilities vs. missing features per project requirements
- Mapped existing endpoints: `/auth/*`, `/users/*`, `/hello`
- Documented database models: `User` (base auth model only)
- Analyzed JWT authentication flow (access + refresh token rotation)

### Current State Assessment
| Component | Status |
|-----------|--------|
| User Authentication | ✅ Implemented (register, login, refresh, me) |
| User Management | ✅ Implemented (CRUD with JWT protection) |
| Scenario Management | ❌ Not started |
| AI Generation (OpenAI) | ❌ Not started |
| Templates System | ❌ Not started |
| Tags System | ❌ Not started |
| Comments System | ❌ Not started |
| Scenario Sharing | ❌ Not started |
| Background Tasks (Celery) | ❌ Not started |
| File Storage (S3) | ❌ Not started |

---

## Current Plan

### Phase 1: Core Scenario Management [IN PROGRESS]
1. [TODO] Create `Scenario` model in `/backend/app/database/models.py`
2. [TODO] Create Pydantic schemas in `/backend/app/schemas/scenario.py`
3. [TODO] Create scenario repository in `/backend/app/repositories/scenario_service.py`
4. [TODO] Create scenario endpoints in `/backend/app/api/v1/endpoints/scenarios.py`
5. [TODO] Register routes in `/backend/app/api/v1/api.py`
6. [TODO] Write tests for scenario CRUD operations

### Phase 2: AI Integration [TODO]
1. [TODO] Add `openai` dependency to `pyproject.toml`
2. [TODO] Create AI service layer for OpenAI API
3. [TODO] Implement `POST /ai/generate/` endpoint
4. [TODO] Implement `POST /ai/generate/title` endpoint
5. [TODO] Add Redis + Celery for async generation tasks

### Phase 3: Templates System [TODO]
1. [TODO] Create `Template` model with tone/duration/CTA settings
2. [TODO] Create template schemas and repository
3. [TODO] Implement template CRUD endpoints

### Phase 4: Tags & Organization [TODO]
1. [TODO] Create `Tag` model + many-to-many relationship
2. [TODO] Implement tag management endpoints
3. [TODO] Add filtering by tags to scenario list

### Phase 5: Comments System [TODO]
1. [TODO] Create `Comment` model with threading support
2. [TODO] Implement comment CRUD endpoints
3. [TODO] Add permission checks for comments

### Phase 6: Collaboration & Sharing [TODO]
1. [TODO] Create `ScenarioShare` model for access control
2. [TODO] Implement sharing endpoints
3. [TODO] Add WebSocket support for real-time collaboration

### Phase 7: Infrastructure [TODO]
1. [TODO] Complete `.env` template with all required variables
2. [TODO] Set up Alembic migrations for all new models
3. [TODO] Add S3 storage integration (boto3)
4. [TODO] Implement structured logging
5. [TODO] Set up GitHub Actions CI/CD pipeline

### Phase 8: Microservices Migration [FUTURE]
1. [TODO] Extract Auth Service as independent microservice
2. [TODO] Extract Scenario Service
3. [TODO] Extract AI Service
4. [TODO] Set up message broker (RabbitMQ/Kafka)
5. [TODO] Implement API Gateway

---

## Open Questions / Decisions Needed
- **AI Provider:** Confirm OpenAI as primary provider or support alternatives (Anthropic, local models)
- **Frontend Integration:** Coordinate API contracts with frontend team (React)
- **Deployment Target:** Confirm production infrastructure (Kubernetes, VM, serverless)
- **Rate Limiting:** Define limits for AI generation endpoints

---

## Summary Metadata
**Update time**: 2026-03-18T20:44:57.085Z 
