# Phase-1 — Domain Modeling + CRUD Foundation

Phase-1 Goal:
Transform the Phase-0 infrastructure into a real API by introducing:

- A proper domain model (Book)
- Mongoose schema & validation
- Layered folder structure
- RESTful CRUD endpoints
- Proper error handling
- Clean API routing structure

At the end of Phase-1, the system must support full CRUD operations for books.

---

# 1. Refactor Folder Structure

Inside `backend/src`, create:

```
backend/src/
  server.js
  models/
    book.model.js
  routes/
    book.routes.js
  controllers/
    book.controller.js
```

We move toward separation of concerns:

- models → data schema
- controllers → business logic
- routes → HTTP wiring

---

# 2. Create Book Model (Mongoose Schema)

File: `backend/src/models/book.model.js`

```javascript
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    authors: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    year: {
      type: Number,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    copies: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
```

Design decisions:

- `authors` is an array (books may have multiple authors)
- `isbn` is unique
- `copies` defaults to 0
- timestamps enabled

---

# 3. Create Book Controller

File: `backend/src/controllers/book.controller.js`

```javascript
const Book = require("../models/book.model");

exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
```

---

# 4. Create Routes

File: `backend/src/routes/book.routes.js`

```javascript
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

# 5. Wire Routes into Server

Modify `backend/src/server.js`:

Add:

```javascript
const bookRoutes = require("./routes/book.routes");
```

After middleware:

```javascript
app.use("/api/books", bookRoutes);
```

Server now exposes:

- POST    /api/books
- GET     /api/books
- GET     /api/books/:id
- PUT     /api/books/:id
- DELETE  /api/books/:id

---

# 6. Test CRUD Manually

Start system:

```bash
docker compose up --build
```

Create book:

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Code",
    "authors": ["Robert C. Martin"],
    "year": 2008,
    "isbn": "9780132350884",
    "copies": 5
  }'
```

Get all books:

```bash
curl http://localhost:3000/api/books
```

Update:

```bash
curl -X PUT http://localhost:3000/api/books/<id> \
  -H "Content-Type: application/json" \
  -d '{"copies": 10}'
```

Delete:

```bash
curl -X DELETE http://localhost:3000/api/books/<id>
```

---

# 7. Phase-1 Design Principles Established

1. Separation of concerns (model/controller/routes)
2. RESTful API structure
3. Proper HTTP status codes
4. Mongoose validation enforced
5. Unique ISBN constraint
6. Clean JSON responses
7. No business logic inside routes

---

# 8. Phase-1 Definition of Done

Phase-1 is complete if:

1. Books can be created.
2. Books can be listed.
3. Books can be retrieved by ID.
4. Books can be updated.
5. Books can be deleted.
6. Duplicate ISBNs are rejected.
7. API behaves consistently under Docker.

---

# 9. Commit + Tag

```bash
git add .
git commit -m "Phase-1: Book model + CRUD endpoints"
git tag -a "Phase-1" -m "CRUD foundation complete"
git push origin main --tags
```

---

END OF PHASE-1 DOCUMENTATION