# Books Project — Phase 4 (tag: `phase-4-populate-and-scripts`)

Phase-4 goal: introduce **database population tooling**, improve developer workflow, and make the system easier to test with realistic data.

This is the phase where we move from “API works” to “API is usable and testable at scale.”

**Source-of-truth tag:** `phase-4-populate-and-scripts`  
**Repo:** https://github.com/csc3221-master/books  
**Tags page:** https://github.com/csc3221-master/books/tags  

---

# 1) What Changed from Phase-3 → Phase-4

Phase-4 adds:

- A database population script
- CLI flag support (`--drop`)
- Script execution inside Docker container
- Improvements to docker-compose execution workflow
- A clearer development pattern for running one-off Node scripts

Phase-4 does NOT change:

- Book schema structure
- CRUD endpoints
- Core architecture

This phase is focused on **developer tooling and database seeding**.

---

# 2) Updated Repo Structure

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
      models/
        book.model.js
      controllers/
        book.controller.js
      routes/
        book.routes.js
      populatedb.js
  docker-compose.yml
  makefile
  structure.txt
  README.md
  LICENSE
  .gitignore
```

New addition:

- `backend/src/populatedb.js`

---

# 3) Database Population Script

File: `backend/src/populatedb.js`

Purpose:

- Insert many real books into Mongo
- Optionally drop collection before seeding
- Allow execution via:

```bash
docker exec -it books_api node backend/src/populatedb.js --drop
```

Core design principles introduced:

1. Script must establish its own DB connection
2. Script must close connection cleanly
3. Script must support optional `--drop` flag
4. Script should log progress clearly

---

# 4) Populate Script Structure

High-level flow:

```js
1. Parse CLI arguments
2. Connect to Mongo using same URI logic
3. If --drop → delete existing collection
4. Create multiple Book instances
5. Insert into Mongo
6. Log summary
7. Close DB connection
8. Exit process
```

Important: the script does NOT reuse Express app — it directly uses the model.

---

# 5) CLI Flag Handling

Phase-4 introduces simple argument parsing:

```js
const shouldDrop = process.argv.includes("--drop");
```

Behavior:

- With `--drop`: clears collection before inserting
- Without: just inserts new records

---

# 6) Docker Execution Pattern Established

To run population script:

```bash
docker compose up -d
docker exec -it books_api node src/populatedb.js --drop
```

The source for this script is:
```javascript
// backend/src/populatedb.js
//
// Usage (recommended, no local Node):
//   docker compose up -d
//   docker exec -it books_api node src/populatedb.js
//
// Optional:
//   docker exec -it books_api node src/populatedb.js --drop
//   docker exec -it books_api node src/populatedb.js --count=250
//
// Notes:
// - Uses Open Library Search API to fetch REAL books and inserts them into MongoDB.
// - Requires MONGO_URL env var (already set in your docker-compose for the api service).
// - Inserts only books that have at least one author and at least one ISBN.
// - Ensures unique ISBNs (your schema has isbn unique).

const mongoose = require("mongoose");
const { Book } = require("./models/book.model");

const DEFAULT_COUNT = 250;

// Node 18+ has global fetch; Node 20 (your container) is fine.
if (typeof fetch !== "function") {
  console.error("This script requires Node.js 18+ (global fetch).");
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    drop: false,
    count: DEFAULT_COUNT,
  };

  for (const a of argv.slice(2)) {
    if (a === "--drop") args.drop = true;
    else if (a.startsWith("--count=")) {
      const n = Number(a.split("=", 2)[1]);
      if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid --count value");
      args.count = Math.floor(n);
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }
  return args;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeArray(arr) {
  return (Array.isArray(arr) ? arr : [])
    .map((s) => String(s).trim())
    .filter(Boolean);
}

function pickIsbn(doc) {
  const isbns = normalizeArray(doc.isbn);

  // Prefer ISBN-13 if present (length 13 and numeric-ish), else first available
  const isbn13 = isbns.find((x) => /^\d{13}$/.test(x));
  if (isbn13) return isbn13;

  const isbn10 = isbns.find((x) => /^\d{9}[\dX]$/.test(x));
  if (isbn10) return isbn10;

  return isbns[0] || null;
}

function buildBookFromOpenLibraryDoc(doc) {
  const name = String(doc.title || "").trim();
  const authors = normalizeArray(doc.author_name);
  const isbn = pickIsbn(doc);

  if (!name) return null;
  if (!isbn) return null;
  if (authors.length === 0) return null;

  const year = Number.isFinite(doc.first_publish_year) ? doc.first_publish_year : undefined;

  // Open Library returns language codes like "eng", "spa", etc (not always ISO-639-1)
  const language = normalizeArray(doc.language)[0] || "";

  // Use up to a handful of subjects as tags if present
  const tags = normalizeArray(doc.subject).slice(0, 8);

  return {
    name,
    authors,
    isbn,
    year,
    language,
    tags,
  };
}

async function fetchSearchPage({ subject, page, limit }) {
  // Important: Open Library recommends specifying fields for /search.json (perf change).
  // We'll request only what we need.
  const fields = [
    "title",
    "author_name",
    "first_publish_year",
    "isbn",
    "language",
    "subject",
  ].join(",");

  const url =
    `https://openlibrary.org/search.json?` +
    `subject=${encodeURIComponent(subject)}` +
    `&page=${encodeURIComponent(page)}` +
    `&limit=${encodeURIComponent(limit)}` +
    `&fields=${encodeURIComponent(fields)}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "books-api-populator/1.0 (educational)" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenLibrary request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json();
}

async function connectDb() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) throw new Error("Missing env var MONGO_URL");

  await mongoose.connect(mongoUrl);
}

async function main() {
  const { drop, count } = parseArgs(process.argv);

  console.log(`Target: ${count} books`);
  await connectDb();
  console.log("Connected to MongoDB");

  if (drop) {
    console.log("Dropping Book collection...");
    await Book.deleteMany({});
  }

  const subjects = [
    "fantasy",
    "science_fiction",
    "mystery",
    "thriller",
    "romance",
    "history",
    "biography",
    "philosophy",
    "poetry",
    "children",
    "young_adult",
    "classics",
    "psychology",
    "programming",
  ];

  const seenIsbns = new Set();
  let inserted = 0;

  // Prefill seenIsbns with existing db entries (so reruns don’t churn)
  {
    const existing = await Book.find({}, { isbn: 1 }).lean();
    for (const b of existing) {
      if (b && b.isbn) seenIsbns.add(String(b.isbn));
    }
    if (existing.length > 0) {
      console.log(`Existing books in DB: ${existing.length} (will avoid duplicates)`);
    }
  }

  // Keep pulling pages until we reach count
  const limit = 100;
  let subjectIndex = 0;

  while (inserted < count) {
    const subject = subjects[subjectIndex % subjects.length];
    subjectIndex++;

    // Page cycling for variety
    for (let page = 1; page <= 10 && inserted < count; page++) {
      console.log(`Fetching subject="${subject}" page=${page} ...`);

      let json;
      try {
        json = await fetchSearchPage({ subject, page, limit });
      } catch (e) {
        console.warn(`Fetch failed for ${subject} page ${page}: ${e.message}`);
        await sleep(500);
        continue;
      }

      const docs = Array.isArray(json.docs) ? json.docs : [];
      if (docs.length === 0) break;

      const batch = [];
      for (const d of docs) {
        const book = buildBookFromOpenLibraryDoc(d);
        if (!book) continue;
        if (seenIsbns.has(book.isbn)) continue;

        seenIsbns.add(book.isbn);
        batch.push(book);

        if (inserted + batch.length >= count) break;
      }

      if (batch.length > 0) {
        try {
          // ordered:false = continue inserts even if a duplicate slips through
          const result = await Book.insertMany(batch, { ordered: false });
          inserted += result.length;
          console.log(`Inserted ${result.length}. Total inserted this run: ${inserted}`);
        } catch (e) {
          // If duplicates happen due to race/edge cases, insertMany throws; we can continue.
          console.warn(`InsertMany warning: ${e.message}`);
        }
      }

      // Be polite to the API
      await sleep(250);
    }
  }

  console.log(`Done. Inserted this run: ${inserted}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("populate failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
```


Important lesson learned during this phase:

The path inside the container must match the container’s WORKDIR.

Because:

```
WORKDIR /app
COPY src ./src
```

The correct path inside container is:

```
node src/populatedb.js
```

NOT:

```
node backend/src/populatedb.js
```

This clarified container filesystem understanding.

---

# 7) Developer Workflow Improvements

Phase-4 establishes a clean dev loop:

Start containers:

```bash
docker compose up -d
```

Seed DB:

```bash
docker exec -it books_api node src/populatedb.js --drop
```

Test API:

```bash
curl http://localhost:3000/api/books
```

Stop:

```bash
docker compose down
```

Reset DB:

```bash
docker compose down -v
```

---

# 8) Architecture Principles Reinforced

Phase-4 reinforces:

1. Separation between runtime server and admin scripts
2. Explicit DB lifecycle handling
3. Script-based database seeding
4. Docker-aware execution paths
5. Clean container execution model

---

# 9) Phase-4 Definition of Done

Phase-4 is complete when:

1. The API still supports full CRUD.
2. The populate script inserts large sets of books.
3. `--drop` properly clears existing records.
4. Script runs correctly inside container.
5. Container path issues are understood and resolved.
6. Data persists across restarts (unless volume removed).

---

# 10) Phase-4 Tag

This phase is tagged as:

`phase-4-populate-and-scripts`


# 11) Commit + Tag

```bash
git add .
git commit -m "Phase-3: Book model CRUD"
git tag -a "phase-3-book-model-crud" -m "Phase-3: Book model CRUD"
git push origin main --tags
```

---
END OF PHASE-4 DOCUMENTATION

do phase-4, make sure it is a single 100% fenced markdown block