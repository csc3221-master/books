# Books Project — Phase 1 (tag: `phase-1-express-boot`)

Phase-1 goal: **get an Express API booting inside Docker** and expose a simple **health endpoint** so we can verify container wiring early, before adding Mongo/Mongoose and CRUD.

**Source-of-truth tag:** `phase-1-express-boot`  
**Repo:** `https://github.com/csc3221-master/books`  
**Tags page:** `https://github.com/csc3221-master/books/tags`

---

## 1) What changed from Phase-0 → Phase-1

Phase 1 adds:

- A real backend Node/Express project (`backend/package.json` + `backend/src/`)
- A Dockerfile to run the backend in a container
- A docker-compose service for the API (no Mongo yet in this phase)
- A working endpoint: `GET /health` returns `{ ok: true }`

Phase 1 does **not** add:

- MongoDB container / mongoose connection
- Book model, controllers, routes, CRUD
- A populated Makefile (the file exists but is empty in this tag)

---

## 2) Repo structure at Phase-1

At tag `phase-1-express-boot`, the repo contains:

```text
books/
  backend/
    Dockerfile
    package.json
    src/
      app.js
      server.js
  .gitignore
  LICENSE
  README.md
  docker-compose.yml
  makefile
  structure.txt
```

Notes:

- `README.md` is still minimal (`# books`) at this phase.
- `makefile` exists but is empty at this phase.
- `structure.txt` is a planning artifact describing the intended future architecture.

---

## 3) Backend: Node + Express boot

### 3.1 `backend/package.json`

- Name: `books-api`
- Main: `src/server.js`
- Scripts:
  - `npm start` → `node src/server.js`
  - `npm run dev` → `nodemon src/server.js`
- Dependencies:
  - `express`
- Dev dependencies:
  - `nodemon`

Exact content:

```json
{
  "name": "books-api",
  "version": "0.1.0",
  "private": true,
  "type": "commonjs",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

---

### 3.2 App factory: `backend/src/app.js`

We separated:
- `createApp()` (build the Express app)
- `server.js` (boot + listen)

Features in Phase-1:
- JSON body parsing
- `GET /health` endpoint
- Basic JSON 404 handler

Exact content:

```js
const express = require("express");

function createApp() {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());

  // Health check (Phase-1)
  app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
  });

  // Basic 404 (nice to have)
  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  return app;
}

module.exports = { createApp };
```

---

### 3.3 Server boot: `backend/src/server.js`

- Reads `PORT` from environment (defaults to 3000)
- Binds to `0.0.0.0` so it works in Docker port publishing
- Logs the listening URL

Exact content:

```js
const { createApp } = require("./app");
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

function main() {
  const app = createApp();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API listening on http://0.0.0.0:${PORT}`);
  });
}

main();
```

---

## 4) Containerization

### 4.1 `backend/Dockerfile`

Key decisions:

- Base image: `node:20-alpine`
- `WORKDIR /app`
- Copy package files first (better Docker caching), install prod deps only
- Copy `src` only
- `NODE_ENV=production`
- Expose 3000
- Run `npm start`

Exact content:

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Install deps first (better Docker layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY src ./src

# Runtime env + port
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

---

### 4.2 `docker-compose.yml` (root)

Phase-1 compose runs **only the API container** (still no mongo).

- Service name: `api`
- Build context: `./backend`
- Publishes port 3000
- Sets `PORT=3000`

Exact content:

```yaml
services:
  api:
    build:
      context: ./backend
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
```

---

## 5) Run / Verify Phase-1

From repo root:

```bash
docker compose up --build
```

Verify health endpoint from your host:

```bash
curl http://localhost:3000/health
```

Expected JSON:

```json
{ "ok": true }
```

Stop containers:

```bash
docker compose down
```

---

## 6) Notes about `structure.txt` (planning artifact)

`structure.txt` in this tag is a planning note describing the **future intended layout** (config/, models/, controllers/, routes/, middleware/, etc.). It is **not yet implemented** in Phase-1, but it documents the direction we planned to move toward.

---

## 7) Phase-1 Definition of Done

Phase-1 is done when:

1. `docker compose up --build` successfully builds and runs the API container.
2. `GET /health` returns HTTP 200 with `{ ok: true }`.
3. Unknown routes return a JSON 404 response.

---

## 8) Phase-1 tag

This phase is tagged as:

- `phase-1-express-boot`

## 9) Commit + Tag

```bash
git add .
git commit -m "Phase-1: Express boot"
git tag -a "phase-1-express-boot" -m "Express boot"
git push origin main --tags
```

---

END OF PHASE-1 DOCUMENTATION