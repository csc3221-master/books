# Books Project — Phase 4 (tag: `phase-4-vite-react`)

Phase-4 goal: introduce a **React frontend using Vite**, containerize it, and integrate it with the existing Dockerized backend and Mongo stack.

This is the phase where the project becomes a **full-stack application**.

**Source-of-truth tag:** `phase-4-vite-react`  
**Repo:** https://github.com/csc3221-master/books  
**Tags page:** https://github.com/csc3221-master/books/tags  

---

# 1) What Changed from Phase-3 → Phase-4

Phase-4 adds:

- A new top-level `frontend/` project
- Vite + React application scaffold
- A Dockerfile for the frontend
- A third service in `docker-compose.yml`
- Vite dev server exposed on port 5173
- Proxy configuration to forward `/api` calls to backend

Phase-4 does NOT change:

- Book schema
- CRUD controllers
- Mongo wiring
- Backend architecture

This phase is strictly about **adding and integrating the frontend layer**.

---

# 2) Updated Repository Structure

```text
books/
  backend/
    Dockerfile
    package.json
    src/
      app.js
      server.js
      config/db.js
      models/book.model.js
      controllers/book.controller.js
      routes/book.routes.js

  frontend/
    Dockerfile
    package.json
    vite.config.js
    index.html
    src/
      main.jsx
      App.jsx
      components/
        BookList.jsx
        BookForm.jsx

  docker-compose.yml
  makefile
  README.md
  LICENSE
  .gitignore
```

New top-level folder:

- `frontend/`

---

# 3) Frontend: Vite + React Setup

The frontend was scaffolded using Vite.

Core characteristics:

- React application
- Dev server runs on port 5173
- Hot reload enabled
- Uses fetch() to call backend API

---

# 4) Vite Configuration (Proxy Setup)

File: `frontend/vite.config.js`

Key feature introduced:

- Proxy `/api` to backend container

Representative configuration:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://api:3000",
        changeOrigin: true,
      },
    },
  },
});
```

Important design decision:

- The frontend calls `/api/books`
- Vite forwards that internally to `http://api:3000`
- `api` is the Docker service name
- No hardcoded `localhost` inside React code

This keeps the frontend environment-agnostic.

---

# 5) Frontend Dockerfile

File: `frontend/Dockerfile`

Purpose:

- Run Vite dev server inside container
- Expose port 5173
- Allow host machine to access dev UI

Representative structure:

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
```

Key decision:

- Explicitly bind Vite to `0.0.0.0`
- Required for Docker port publishing

---

# 6) Updated docker-compose.yml

Phase-4 introduces a third service:

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

  frontend:
    build:
      context: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - api

volumes:
  mongo_data:
```

Now the stack consists of:

- Mongo container
- API container
- Frontend container

All on the same Docker network.

---

# 7) How the Full Stack Works Together

Request flow:

1. Browser → http://localhost:5173
2. React app calls `/api/books`
3. Vite proxy forwards request to `http://api:3000`
4. API container processes request
5. API queries Mongo container
6. Response flows back to browser

Important:  
The browser never talks directly to `api:3000` — only to Vite.

---

# 8) Running Phase-4

From project root:

```bash
docker compose up --build
```

Access:

Frontend:
```
http://localhost:5173
```

Backend health:
```
http://localhost:3000/health
```

---

# 9) Architecture Principles Introduced in Phase-4

1. Full-stack containerized development
2. Service-to-service communication via Docker DNS
3. Proxy-based API routing (no CORS headaches)
4. Separation of frontend and backend build contexts
5. Environment-agnostic API paths (`/api/...`)

---

# 10) Phase-4 Definition of Done

Phase-4 is complete when:

1. All three containers start successfully.
2. Frontend loads in browser.
3. Frontend can fetch books from backend.
4. No CORS errors appear.
5. Network routing works via service names.
6. Backend remains unchanged functionally.

---

# 11) Phase-4 Tag

This phase is tagged as:

`phase-4-vite-react`

# 12) Commit + Tag

```bash
git add .
git commit -m "Phase-4: React"
git tag -a "phase-4-vite-react" -m "Phase-4: React"
git push origin main --tags
```

---

END OF PHASE-4 DOCUMENTATION

This marks the transition from backend-only to full-stack architecture.