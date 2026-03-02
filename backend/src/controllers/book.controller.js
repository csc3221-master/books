// backend/src/controllers/book.controller.js
const mongoose = require("mongoose");
const { Book } = require("../models/book.model");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function clampInt(n, lo, hi, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  const i = Math.trunc(x);
  return Math.min(hi, Math.max(lo, i));
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseSort(sortRaw) {
  // sort format: "createdAt:desc" or "year:asc"
  const allowed = new Set(["createdAt", "year", "name", "isbn", "language", "updatedAt"]);
  const raw = String(sortRaw || "createdAt:desc");
  const [field, dir] = raw.split(":");
  const f = allowed.has(field) ? field : "createdAt";
  const d = String(dir || "desc").toLowerCase() === "asc" ? 1 : -1;
  return { [f]: d };
}

async function listBooks(req, res, next) {
  try {
    const {
      q,
      tag,
      author,
      language,
      year,
      page,
      limit,
      sort,
    } = req.query;

    const pageNum = clampInt(page, 1, 1_000_000, 1);
    const limitNum = clampInt(limit, 1, 100, 20);
    const sortObj = parseSort(sort);

    const filter = {};

    // Filters (case-insensitive)
    if (tag) {
      filter.tags = { $regex: new RegExp(escapeRegex(tag), "i") };
    }
    if (author) {
      filter.authors = { $regex: new RegExp(escapeRegex(author), "i") };
    }
    if (language) {
      filter.language = { $regex: new RegExp(`^${escapeRegex(language)}$`, "i") };
    }
    if (year !== undefined && String(year).trim() !== "") {
      const y = Number(year);
      if (!Number.isFinite(y)) return res.status(400).json({ error: "Invalid year" });
      filter.year = y;
    }

    // Search "q": broad match across fields using regex
    if (q && String(q).trim() !== "") {
      const rx = new RegExp(escapeRegex(String(q).trim()), "i");
      filter.$or = [
        { name: rx },
        { isbn: rx },
        { authors: rx },
        { tags: rx },
      ];
    }

    const skip = (pageNum - 1) * limitNum;

    const [total, books] = await Promise.all([
      Book.countDocuments(filter),
      Book.find(filter).sort(sortObj).skip(skip).limit(limitNum),
    ]);

    const pages = Math.max(1, Math.ceil(total / limitNum));

    return res.status(200).json({
      data: books,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
        sort: sortObj,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getBookById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: "Book not found" });

    return res.status(200).json({ data: book });
  } catch (err) {
    return next(err);
  }
}

async function getBookByIsbn(req, res, next) {
  try {
    const { isbn } = req.params;
    const normalized = String(isbn || "").trim();
    if (!normalized) return res.status(400).json({ error: "Invalid isbn" });

    const book = await Book.findOne({ isbn: normalized });
    if (!book) return res.status(404).json({ error: "Book not found" });

    return res.status(200).json({ data: book });
  } catch (err) {
    return next(err);
  }
}

async function createBook(req, res, next) {
  try {
    const payload = req.body;
    const created = await Book.create(payload);
    return res.status(201).json({ data: created });
  } catch (err) {
    return next(err);
  }
}

async function updateBook(req, res, next) {
  try {
    const { id } = req.params;
    const payload = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const updated = await Book.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ error: "Book not found" });
    return res.status(200).json({ data: updated });
  } catch (err) {
    return next(err);
  }
}

async function deleteBook(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Book not found" });

    return res.status(200).json({ data: deleted });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listBooks,
  getBookById,
  getBookByIsbn,
  createBook,
  updateBook,
  deleteBook,
};