# Node + Express + Mongo (Docker) — One-Liner Student Cheat Sheet (Phases 0–3)

> Minimal commands only. Assumes Docker Desktop + `docker compose` is installed.

---

## Phase-0 — Clone the Project

```bash
git clone <REPO_URL> && cd <REPO_FOLDER>
```

Clones the repository and enters the project directory.

---

## Phase-1 — Run the API (Express in Docker)

```bash
docker compose up --build
```

Builds the API image (if needed) and starts the container.

Test:

```bash
curl http://localhost:3000/health
```

Stop:

```bash
docker compose down
```

---

## Phase-2 — Run API + Mongo

```bash
docker compose up --build
```

Starts both:
- api
- mongo

Test DB readiness:

```bash
curl http://localhost:3000/ready
```

Stop (keep database):

```bash
docker compose down
```

Reset database (delete volume):

```bash
docker compose down -v
```

---

## Phase-3 — Test CRUD Endpoints

Start stack:

```bash
docker compose up --build
```

Create a book:

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"name":"The Hobbit","authors":["J.R.R. Tolkien"],"isbn":"978-0547928227","year":1937,"language":"en","tags":["fantasy"]}'
```

List books:

```bash
curl http://localhost:3000/api/books
```

Stop:

```bash
docker compose down
```