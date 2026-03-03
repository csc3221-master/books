# Books Project — Phase 2 (tag: `phase-2-mongo-wiring`)

Phase-2 goal: **introduce MongoDB and Mongoose**, wire the API container to a Mongo container using Docker Compose, and establish database connectivity — without yet implementing the Book model or CRUD.

**Source-of-truth tag:** `phase-2-mongo-wiring`  
**Repo:** https://github.com/csc3221-master/books  
**Tags page:** https://github.com/csc3221-master/books/tags  

---

# 1) What Changed from Phase-1 → Phase-2

Phase-2 adds:

- MongoDB service in `docker-compose.yml`
- Mongoose dependency
- Environment-based Mongo connection
- Database connection bootstrapped at app startup
- Clear separation between app creation and DB initialization

Phase-2 does NOT yet add:

- Book schema
- Controllers or routes
- CRUD logic

This phase is purely about **infrastructure wiring**.

---

# 2) Repo Structure at Phase-2

```text
books/
  backend/
    Dockerfile
    package.json
    src/
      app.js
      server.js
      config/
        db.js
  .gitignore
  LICENSE
  README.md
  docker-compose.yml
  makefile
  structure.txt
```

New addition:
- `src/config/db.js`

---

# 3) Backend Changes

## 3.1 Updated `package.json`

New dependency added:

- `mongoose`

Relevant portion:

```json
"dependencies": {
  "express": "^4.19.2",
  "mongoose": "^8.x.x"
}
```

---

# 3.2 Database Connection Module

File: `backend/src/config/db.js`

Purpose:
- Centralize Mongo connection logic
- Keep server.js clean

Implementation:

```js
const mongoose = require("mongoose");

async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
```

Design principle established:
- Fail fast if database connection fails.

---

# 3.3 Updated `server.js`

Now responsible for:

- Reading `MONGO_URI`
- Connecting to DB before starting server

```js
const { createApp } = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const MONGO_URI = process.env.MONGO_URI;

async function main() {
  await connectDB(MONGO_URI);

  const app = createApp();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API listening on http://0.0.0.0:${PORT}`);
  });
}

main();
```

Important design rule:
- Do not start HTTP server until DB connection succeeds.

---

# 4) Docker Compose Changes

Phase-2 introduces a Mongo service.

Updated `docker-compose.yml`:

```yaml
services:
  mongo:
    image: mongo:7
    container_name: books_mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  api:
    build:
      context: ./backend
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - MONGO_URI=mongodb://mongo:27017/books
    depends_on:
      - mongo

volumes:
  mongo_data:
```

Key decisions:

- Hostname `mongo` used in `MONGO_URI`
- Named volume `mongo_data` for persistence
- `depends_on` ensures container start order
- Mongo exposed for debugging (optional but helpful)

---

# 5) Dockerfile (unchanged from Phase-1)

Still:

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

No changes needed for Mongo wiring.

---

# 6) Running Phase-2

From project root:

```bash
docker compose up --build
```

Expected logs:

- Mongo container starts
- API container starts
- "MongoDB connected"
- "API listening on http://0.0.0.0:3000"

Verify health endpoint:

```bash
curl http://localhost:3000/ready
```

Expected:

```json
{ ready: true, db: "connected" }
```

---

# 7) Architecture Decisions Introduced in Phase-2

1. Database connection isolated in `config/db.js`
2. Fail-fast startup pattern
3. Environment-driven configuration
4. Mongo persistence via named volume
5. Clear separation between app creation and infrastructure boot

---

# 8) Phase-2 Definition of Done

Phase-2 is complete when:

1. `docker compose up --build` launches both API and Mongo.
2. API logs confirm successful Mongo connection.
3. `/ready` endpoint works.
4. Mongo data persists across container restarts.
5. Server refuses to start if DB connection fails.

---

# 9) Phase-2 Tag

This phase is tagged as:

`phase-2-mongo-wiring`

## 9) Commit + Tag

```bash
git add .
git commit -m "Phase-2: Mongo wiring"
git tag -a "phase-2-mongo-wiring" -m "Mongo wiring"
git push origin main --tags
```

---

END OF PHASE-2 DOCUMENTATION