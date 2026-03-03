# Books Project — Phase 6 (tag: `phase-6-populate-db`)

Phase-6 goal: introduce a **robust, repeatable database population system** suitable for development, demos, grading, and testing.

This phase formalizes database seeding as part of the architecture instead of an ad-hoc script.

**Proposed tag:** `phase-6-populate-db`  
**Repo:** https://github.com/csc3221-master/books  

---

# 1) What Phase-6 Adds

Phase-6 introduces:

- A structured database seeding script
- Bulk insert optimization
- Optional `--drop` flag to reset data
- Deterministic sample dataset
- Clear container execution pattern
- Optional Makefile target for seeding

Phase-6 does NOT change:

- Schema
- CRUD logic
- Search/pagination
- Frontend behavior

This phase strengthens the **developer workflow and reproducibility**.

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
      scripts/
        populate-db.js
  frontend/
  docker-compose.yml
  makefile
```

New directory:

```
backend/src/scripts/
```

New file:

```
populate-db.js
```

---

# 3) New File: `backend/src/scripts/populate-db.js`

Purpose:

- Seed Mongo with realistic book data
- Support optional `--drop`
- Exit cleanly after execution

## Complete Implementation

```js
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Book = require("../models/book.model");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongo:27017/books";

const shouldDrop = process.argv.includes("--drop");

const sampleBooks = [
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    year: 2008,
    isbn: "9780132350884",
    tags: ["software", "engineering"],
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    year: 1999,
    isbn: "9780201616224",
    tags: ["software", "craft"],
  },
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    year: 2009,
    isbn: "9780262033848",
    tags: ["algorithms", "cs"],
  },
];

async function populate() {
  try {
    await connectDB(MONGO_URI);

    if (shouldDrop) {
      console.log("Dropping existing books collection...");
      await Book.deleteMany({});
    }

    console.log("Inserting books...");
    await Book.insertMany(sampleBooks);

    console.log("Database successfully populated.");
  } catch (err) {
    console.error("Populate error:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

populate();
```

---

# 4) Optional: Update `makefile`

Add a convenient target:

```makefile
populate:
	docker exec -it books_api node src/scripts/populate-db.js --drop
```

Now you can run:

```bash
make populate
```

---

# 5) Docker Execution Pattern

Start stack:

```bash
docker compose up -d
```

Populate DB:

```bash
docker exec -it books_api node src/scripts/populate-db.js --drop
```

Verify:

```bash
curl http://localhost:3000/api/books
```

---

# 6) Design Improvements in Phase-6

1. Seeding script isolated in `scripts/`
2. Bulk insertion via `insertMany`
3. Clean DB lifecycle handling
4. Deterministic dataset
5. Optional destructive reset
6. Reproducible development environment

---

# 7) Developer Workflow After Phase-6

Cold start:

```bash
docker compose down -v
docker compose up -d --build
make populate
```

You now have:

- Clean containers
- Fresh Mongo volume
- Preloaded books
- Ready-to-demo frontend

---

# 8) Phase-6 Definition of Done

Phase-6 is complete when:

1. `populate-db.js` runs inside container.
2. `--drop` removes previous records.
3. Books appear via API immediately after seeding.
4. Script exits cleanly without hanging.
5. Workflow is documented and repeatable.

---

# 9) Stack Status After Phase-6

You now have:

- Containerized backend
- Containerized frontend
- Mongo persistence
- Full CRUD
- Search + pagination
- Deterministic database seeding

This marks the project as **development-ready and demo-ready**.

---

# 10) Suggested Tag Command

```bash
git add .
git commit -m "Phase-6: structured database population system"
git tag -a phase-6-populate-db -m "Add database seeding script"
git push origin main --tags
```

---

END OF PHASE-6