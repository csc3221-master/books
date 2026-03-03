# Books Project — Phase 5 (tag: `phase-5-crud-search-pagination`)

Phase-5 goal: extend the backend to support **search, filtering, sorting, and pagination**, and update the React frontend to consume these capabilities with a polished UI.

This phase transforms the app from basic CRUD into a realistic data-driven interface.

**Source-of-truth tag:** `phase-5-crud-search-pagination`  
**Repo:** https://github.com/csc3221-master/books  
**Tags page:** https://github.com/csc3221-master/books/tags  

---

# 1) Backend Changes

## 1.1 Updated `backend/src/controllers/book.controller.js`

The `getAllBooks` controller is enhanced to support:

- search (title)
- author
- tag
- minYear / maxYear
- sort
- page
- limit

### New `getAllBooks` Implementation

```js
const Book = require("../models/book.model");

exports.getAllBooks = async (req, res) => {
  try {
    const {
      search,
      author,
      tag,
      minYear,
      maxYear,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (author) {
      filter.author = { $regex: author, $options: "i" };
    }

    if (tag) {
      filter.tags = tag;
    }

    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = Number(minYear);
      if (maxYear) filter.year.$lte = Number(maxYear);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let sortOption = {};
    if (sort) {
      sortOption[sort] = 1;
    }

    const totalItems = await Book.countDocuments(filter);

    const books = await Book.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      data: books,
      page: pageNum,
      totalPages: Math.ceil(totalItems / limitNum),
      totalItems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

No changes required in routes — the existing `GET /api/books` now supports rich querying.

---

# 2) Frontend Changes

## 2.1 Updated `frontend/src/App.jsx`

Adds:

- Search input
- Filters
- Pagination controls
- Dynamic query construction

### New `App.jsx`

```jsx
import { useEffect, useState } from "react";

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  useEffect(() => {
    fetchBooks();
  }, [search, author, page]);

  const fetchBooks = async () => {
    const params = new URLSearchParams({
      search,
      author,
      page,
      limit,
    });

    const res = await fetch(`/api/books?${params.toString()}`);
    const data = await res.json();

    setBooks(data.data);
    setTotalPages(data.totalPages);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Books</h1>

      <div>
        <input
          placeholder="Search title"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <input
          placeholder="Filter author"
          value={author}
          onChange={(e) => {
            setPage(1);
            setAuthor(e.target.value);
          }}
        />
      </div>

      <ul>
        {books.map((b) => (
          <li key={b._id}>
            <strong>{b.title}</strong> — {b.author} ({b.year})
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "1rem" }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        <span style={{ margin: "0 1rem" }}>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
```

---

# 3) No Changes Required In

- `book.model.js`
- `book.routes.js`
- Docker configuration
- Mongo wiring
- Vite proxy configuration

The stack remains:

- Mongo container
- API container
- Frontend container

---

# 4) New API Examples

Search:

```
GET /api/books?search=clean
```

Filter:

```
GET /api/books?author=martin
```

Pagination:

```
GET /api/books?page=2&limit=5
```

Combined:

```
GET /api/books?search=code&author=martin&page=1&limit=5
```

---

# 5) Phase-5 Definition of Done

Phase-5 is complete when:

1. Users can search by title.
2. Users can filter by author.
3. Results paginate correctly.
4. API returns metadata.
5. Pagination UI disables correctly at boundaries.
6. Containers run cleanly with full-stack behavior.

---

# 6) Phase-5 Tag

This phase is tagged as:

`phase-5-crud-search-pagination`

At this point, the project is a fully containerized, searchable, paginated full-stack application.



# 12) Commit + Tag

```bash
git add .
git commit -m "Phase-5: CRUD Search and Pagination"
git tag -a "phase-5-crud-search-pagination" -m "Phase-5: CRUD Search and Pagination"
git push origin main --tags
```

---

END OF PHASE-5 DOCUMENTATION
