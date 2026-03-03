# Books Project — Phase 0 (tag: `phase-0-structure`)

This document captures **exactly what exists in Phase 0** of the repo and what we intended it to enable next.

> Source-of-truth tag: `phase-0-structure` (created Mar 2, 2026).  [oai_citation:0‡GitHub](https://github.com/csc3221-master/books/tags)

---

## 1) What Phase 0 accomplished

Phase 0 was a **scaffold-only phase**: we created the repository skeleton and put in the “plumbing placeholders” so later phases could add Docker, Express, Mongo, etc.

At this tag, the repo contains (top-level):

- `backend/` (folder scaffold)
- `.gitignore`
- `LICENSE` (MIT)
- `README.md`
- `docker-compose.yml`
- `makefile`  

> [oai_citation:1‡GitHub](https://github.com/csc3221-master/books/tree/phase-0-structure)

---

## 2) Folder structure (Phase 0)

~~~text
books/
├─ backend/
├─ .gitignore
├─ LICENSE
├─ README.md
├─ docker-compose.yml
└─ makefile
~~~  

> (As listed in the repo at `phase-0-structure`.)  [oai_citation:2‡GitHub](https://github.com/csc3221-master/books/tree/phase-0-structure)

### Intent behind each item

#### `backend/`
A dedicated place for the API code (Express/Mongoose will arrive in later phases). In Phase 0, it exists primarily to establish the structure.  

> [oai_citation:3‡GitHub](https://github.com/csc3221-master/books/tree/phase-0-structure)

#### `.gitignore`
A standard Node-oriented ignore file (logs, `node_modules/`, environment files like `.env`, build caches, etc.).  

> [oai_citation:4‡GitHub](https://raw.githubusercontent.com/csc3221-master/books/phase-0-structure/.gitignore)

#### `LICENSE`
MIT license included at repo root.  

> [oai_citation:5‡GitHub](https://github.com/csc3221-master/books/tree/phase-0-structure)

#### `README.md`
Minimal placeholder README containing only the project header at this phase.  

> [oai_citation:6‡GitHub](https://raw.githubusercontent.com/csc3221-master/books/phase-0-structure/README.md)

#### `docker-compose.yml`
Present at repo root as part of the scaffold (intended to eventually orchestrate containers like API + Mongo). In this tag, the raw view returned no content, which strongly suggests it was an empty placeholder file in Phase 0.  

> [oai_citation:7‡GitHub](https://github.com/csc3221-master/books/tree/phase-0-structure)

#### `makefile`
Present at repo root as part of the scaffold (intended to provide convenient `make up`, `make down`, etc.). In this tag, the raw view returned no content, which strongly suggests it was an empty placeholder file in Phase 0.

> [oai_citation:8‡GitHub](https://github.com/csc3221-master/books/tree/phase-0-structure)

---

## 3) What you can “replicate” from Phase 0 (quick checklist)

If you ever want to recreate Phase 0 from scratch, do this:

1. Create repo `books`
2. Create `backend/` directory
3. Add:
   - `README.md` with just `# books`
   - `.gitignore` (Node defaults)
   - `LICENSE` (MIT)
   - `docker-compose.yml` placeholder
   - `makefile` placeholder
4. Tag the result as `phase-0-structure` (or your own Phase-0 tag name)

---

## 4) Notes / expectations for the next phases

Phase 0 intentionally does **not** include:
- Express app setup
- Dockerfile(s) or a working docker-compose service definition
- Mongoose or Mongo wiring
- Any schema/models/routes/controllers

Those arrive starting in Phase 1+ (per the later tags visible in the repo).  

> [oai_citation:9‡GitHub](https://github.com/csc3221-master/books/tags)

## 5) Git Baseline Commit

Once stable:

```bash
git add .
git commit -m "Phase-0: bootstrap API + Mongo via docker-compose"
git tag -a "Phase-0" -m "Baseline bootstrap"
git push origin main --tags
```

---

## 6) Phase-0 Definition of Done

Phase-0 is successful if:

1. Fresh clone works.
2. `.env` is created from `.env.example`.
3. `docker compose up --build` works without manual intervention.
4. Health endpoint returns success.
5. MongoDB persists data via Docker volume.

---

## 7) A useful script for commiting and pushing:
```bash
#!/usr/bin/env bash

# Exit immediately if a command fails
set -e

# ---------- Argument Validation ----------
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <tag-name> <commit-message>"
    echo "Example: $0 phase-777-future \"Final implementation complete\""
    exit 1
fi

TAG_NAME="$1"
COMMIT_MESSAGE="$2"

echo "----------------------------------------"
echo "Tag Name      : $TAG_NAME"
echo "Commit Message: $COMMIT_MESSAGE"
echo "----------------------------------------"

# ---------- Git Flow ----------
echo "Checking status..."
git status

echo "Adding changes..."
git add .

echo "Creating commit..."
git commit -m "$COMMIT_MESSAGE"

echo "Pushing main branch..."
git push origin main

echo "Creating annotated tag..."
git tag -a "$TAG_NAME" -m "$TAG_NAME - $COMMIT_MESSAGE"

echo "Pushing tag..."
git push origin "$TAG_NAME"

echo "----------------------------------------"
echo "Done ✅"
echo "Tag $TAG_NAME successfully created and pushed."
echo "----------------------------------------"

```


END OF PHASE-0 DOCUMENTATION