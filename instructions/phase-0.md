# Phase-0 — Project Bootstrap (Complete Replication Guide)

This document records **exactly what Phase-0 accomplished** so it can be reproduced from scratch at any time.

Phase-0 Goal:
Create a clean, minimal, reproducible full-stack backend foundation using:

- Node.js
- Express
- MongoDB
- Docker + Docker Compose
- Environment variable configuration
- Git baseline

At the end of Phase-0, the system must start with a single command and expose a working health endpoint.

---

# 1. Initialize the Repository

```bash
mkdir books
cd books
git init
```

Create base structure:

```
books/
  backend/
    src/
  docker-compose.yml
  .gitignore
  README.md
  .env.example
```

---

# 2. Create .gitignore

Create `.gitignore` in project root:

```
node_modules/
.env
.DS_Store
npm-debug.log*
```

---

# 3. Initialize Backend (Node + Express)

```bash
cd backend
npm init -y
```

Install dependencies:

```bash
npm install express mongoose dotenv cors
npm install --save-dev nodemon
```

Modify `backend/package.json` scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

---

# 4. Create Express Server

Create file: `backend/src/server.js`

Minimal required functionality:

- Load environment variables
- Connect to MongoDB
- Provide `/api/health` endpoint
- Listen on `0.0.0.0`

Example implementation:

```javascript
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

# 5. Environment Variables

Create `.env` (NOT committed):

```
PORT=3000
MONGO_URI=mongodb://mongo:27017/books
```

Create `.env.example` (commit this file):

```
PORT=3000
MONGO_URI=mongodb://mongo:27017/books
```

Important rule:

- When running inside Docker, use `mongo` as hostname.
- When running Mongo locally (outside Docker), use `localhost`.

---

# 6. Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

---

# 7. Docker Compose Configuration

Create `docker-compose.yml` in project root:

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
    build: ./backend
    container_name: books_api
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - mongo

volumes:
  mongo_data:
```

---

# 8. Run the System

From project root:

```bash
docker compose up --build
```

Verify health endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{"status":"ok"}
```

Stop containers:

```bash
docker compose down
```

Stop and delete database volume:

```bash
docker compose down -v
```

---

# 9. Common Phase-0 Rules We Established

1. Always bind Express to `0.0.0.0`
2. Always use service name (`mongo`) inside Docker
3. Keep environment config externalized
4. Use Docker Compose as the single source of truth
5. Make startup reproducible with one command

---

# 10. Git Baseline Commit

Once stable:

```bash
git add .
git commit -m "Phase-0: bootstrap API + Mongo via docker-compose"
git tag -a "Phase-0" -m "Baseline bootstrap"
git push origin main --tags
```

---

# 11. Phase-0 Definition of Done

Phase-0 is successful if:

1. Fresh clone works.
2. `.env` is created from `.env.example`.
3. `docker compose up --build` works without manual intervention.
4. Health endpoint returns success.
5. MongoDB persists data via Docker volume.

---

END OF PHASE-0 DOCUMENTATION