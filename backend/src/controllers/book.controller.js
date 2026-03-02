const mongoose = require("mongoose");
const { Book } = require("../models/book.model");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function listBooks(req, res, next) {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: books });
  } catch (err) {
    return next(err);
  }
}

async function getBookById(req, res, next) {
  try {
    const { id } = req.params; // Equivalent to: const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

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

    if (!updated) {
      return res.status(404).json({ error: "Book not found" });
    }

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
    if (!deleted) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.status(200).json({ data: deleted });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};