# Books Project — Phase 3 (tag: `phase-3-book-model-crud`)

Phase-3 goal: introduce the **Book domain model**, implement **validation**, and expose full **REST CRUD endpoints** backed by MongoDB.

This is the phase where the API becomes a real application instead of just infrastructure.

**Source-of-truth tag:** `phase-3-book-model-crud`  
**Repo:** https://github.com/csc3221-master/books  
**Tags page:** https://github.com/csc3221-master/books/tags  

---

# 1) What Changed from Phase-2 → Phase-3

Phase-3 adds:

- Book Mongoose schema
- Validation rules (required, min/max, unique)
- Controllers for business logic
- REST routes
- API mounted under `/api/books`
- Proper HTTP status handling

Phase-3 does NOT yet include:

- Data seeding scripts
- Query/filter features
- Advanced middleware (logging, auth, etc.)

---

# 2) Repo Structure at Phase-3

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
  docker-compose.yml
  makefile
  structure.txt
  README.md
  LICENSE
  .gitignore
```

New directories introduced:

- `models/`
- `controllers/`
- `routes/`

This matches the architectural plan described earlier in `structure.txt`.

---

# 3) Book Model (Mongoose Schema)

File: `backend/src/models/book.model.js`

Key schema fields:

- `title` (required, trimmed)
- `author` (required, trimmed)
- `year` (required, min/max validation)
- `isbn` (required, unique)
- `tags` (array of strings)

Validation introduced:

- Required constraints
- Min/Max for year
- Unique index on ISBN

Representative structure:

```js
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 0,
      max: 2100,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
```

Design decisions established in Phase-3:

- One author per book (string)
- `tags` allowed as flexible categorization
- Server-side validation handled by Mongoose

---

# 4) Book Controller

File: `backend/src/controllers/book.controller.js`

Implements:

- `createBook`
- `getAllBooks`
- `getBookById`
- `updateBook`
- `deleteBook`

Pattern used:

- `async/await`
- Try/catch per handler
- Proper HTTP status codes:
  - 201 on create
  - 404 if not found
  - 400 on validation error
  - 500 on unexpected error

Representative structure:

```js
const Book = require("../models/book.model");

exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
```

Other handlers follow the same pattern using:

- `Book.find()`
- `Book.findById()`
- `Book.findByIdAndUpdate()`
- `Book.findByIdAndDelete()`

---

# 5) Book Routes

File: `backend/src/routes/book.routes.js`

Routes defined:

- `POST   /api/books`
- `GET    /api/books`
- `GET    /api/books/:id`
- `PUT    /api/books/:id`
- `DELETE /api/books/:id`

Implementation pattern:

```js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/book.controller");

router.post("/", controller.createBook);
router.get("/", controller.getAllBooks);
router.get("/:id", controller.getBookById);
router.put("/:id", controller.updateBook);
router.delete("/:id", controller.deleteBook);

module.exports = router;
```

---

# 6) App Wiring Update

`app.js` updated to mount book routes:

```js
const bookRoutes = require("./routes/book.routes");

app.use("/api/books", bookRoutes);
```

Health endpoint still exists:

```js
GET /health
```

---

# 7) Example API Usage (Phase-3)

Create:

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "year": 2008,
    "isbn": "9780132350884",
    "tags": ["software", "engineering"]
  }'
```

List:

```bash
curl http://localhost:3000/api/books
```

Update:

```bash
curl -X PUT http://localhost:3000/api/books/<id> \
  -H "Content-Type: application/json" \
  -d '{"year": 2009}'
```

Delete:

```bash
curl -X DELETE http://localhost:3000/api/books/<id>
```

---

# 8) Architecture Principles Reinforced in Phase-3

1. MVC-style separation (models/controllers/routes)
2. Mongoose validation over manual validation
3. RESTful endpoint structure
4. Proper HTTP semantics
5. JSON-only API
6. Database-first persistence layer

---

# 9) Phase-3 Definition of Done

Phase-3 is complete when:

1. Mongo is running via Docker.
2. Books can be created in Mongo.
3. Duplicate ISBNs are rejected.
4. Validation errors return HTTP 400.
5. CRUD works end-to-end.
6. Containers restart cleanly and data persists.

---

# 10) Phase-3 Tag

This phase is tagged as:

`phase-3-book-model-crud`

# 11) Commit + Tag

```bash
git add .
git commit -m "Phase-3: Book model CRUD"
git tag -a "phase-3-book-model-crud" -m "Phase-3: Book model CRUD"
git push origin main --tags
```

---

END OF PHASE-3 DOCUMENTATION