# Book CRUD

# Node + Express + Mongo (Docker) — Phases 0–3 Summary

---

# Phase-0 — Structure (Repository Scaffolding)

## Goal
Create a clean project structure that supports:
- 2 containers (API + Mongo)
- Clear separation of concerns
- Future scalability

## What Was Done
- Created repository
- Created folder layout:
  - Root:
    - docker-compose.yml
    - .gitignore
    - README.md
    - (optional) Makefile
  - backend/
    - Dockerfile
    - .dockerignore
    - package.json
    - src/
      - app.js
      - server.js
      - config/
      - models/
      - controllers/
      - routes/
      - middleware/

No application logic yet — just scaffolding.

## Commands Used

git clone <repo-url>
- Clones repository locally.

git add .
- Stages all created files.

git commit -m "phase-0-structure"
- Saves the initial structure snapshot.

git tag -a phase-0-structure -m "Initial project structure"
- Creates a named checkpoint.

git push origin main --tags
- Pushes code and tags to remote.

---

# Phase-1 — Express Boot in Docker (No Mongo Yet)

## Goal
Run Express inside a Docker container.
Expose a health endpoint.

GET /health → { ok: true }

## What Was Done
- Implemented minimal Express server.
- Added JSON parsing middleware.
- Added /health route.
- Created Dockerfile for backend.
- Used container-first approach (no local Node installation).
- Used npm install --omit=dev inside container.
- Configured docker-compose to run API service.
- Exposed port 3000.

## Commands Used

docker compose up --build
- Builds image (if needed).
- Creates container.
- Starts container.
- Streams logs.

docker compose build --no-cache
- Forces clean rebuild (useful after Dockerfile changes).

docker compose up
- Starts containers without rebuilding.

curl http://localhost:3000/health
- Verifies API is reachable and working.

Git tagging:

git add .
git commit -m "phase-1-express-boot"
git tag -a phase-1-express-boot -m "Express boot in Docker"
git push origin main --tags

---

# Phase-2 — Mongo Container + Mongoose + Readiness

## Goal
Run two containers:
- api
- mongo

Connect API to MongoDB using Mongoose.

Add readiness endpoint:
GET /ready → indicates DB connection status.

## What Was Done
- Added mongo service to docker-compose.yml.
- Added named volume for DB persistence.
- Added Mongo healthcheck.
- Added depends_on with health condition.
- Installed mongoose in backend.
- Implemented DB connection logic.
- API connects using environment variable:
  MONGO_URL=mongodb://mongo:27017/books_db
- Added readiness endpoint (/ready).
- Confirmed connection works.

Note:
Mongo logs showing "Connection ended" are normal.
They usually come from the healthcheck ping.

## Commands Used

docker compose build --no-cache
- Rebuild API image after adding mongoose.

docker compose up
- Starts both containers.

curl http://localhost:3000/ready
- Confirms database readiness.

Optional lifecycle commands:

docker compose down
- Stops and removes containers.
- Keeps volumes (DB persists).

docker compose down -v
- Stops containers AND deletes volumes.
- Wipes database.

Git tagging:

git add .
git commit -m "phase-2-mongo-mongoose"
git tag -a phase-2-mongo-mongoose -m "Mongo container + Mongoose connection"
git push origin main --tags

---

# Phase-3 — Book Model + Full CRUD API

## Goal
Implement real functionality backed by MongoDB.

Book structure:
- name
- authors[]
- isbn (unique)
- year
- language
- tags[]

Implement CRUD endpoints:
- POST   /api/books
- GET    /api/books
- GET    /api/books/:id
- PUT    /api/books/:id
- DELETE /api/books/:id

Add centralized error handling.

## What Was Done
- Created Book Mongoose schema.
- Enforced unique ISBN.
- Added validation rules.
- Implemented controller layer.
- Implemented routes layer.
- Added centralized error middleware:
  - Validation errors → 400
  - Duplicate ISBN → 409
  - Unexpected errors → 500
- Mounted routes in app.js.

## Commands Used

docker compose build --no-cache
- Rebuild image with new model/routes/controllers.

docker compose up
- Run full stack.

curl commands used to test:
- Create book (POST)
- List books (GET)
- Retrieve by id
- Update
- Delete

Git tagging:

git add .
git commit -m "phase-3-book-crud"
git tag -a phase-3-book-crud -m "Book model + CRUD endpoints"
git push origin main --tags

---

# Mental Model Summary

docker image   = built artifact
docker container = running instance
volume         = persistent storage
docker compose = orchestration definition

Each phase was a controlled checkpoint:
- Phase-0 → Structure
- Phase-1 → Running API
- Phase-2 → Database integration
- Phase-3 → Functional CRUD system


## Phase 4 and 5 --> Front End

Create/updates the containers and install vita
```bash
docker run --rm -it -v "$PWD":/work -w /work node:20-alpine sh -lc \
  "npm create vite@latest frontend -- --template react && cd frontend && npm install"
```

:done: 