// backend/src/models/book.model.js
const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: [1, "name cannot be empty"],
    },
    authors: {
      type: [String],
      default: [],
    },
    isbn: {
      type: String,
      required: [true, "isbn is required"],
      trim: true,
      unique: true,
      index: true,
    },
    year: {
      type: Number,
      min: [0, "year must be >= 0"],
      max: [3000, "year must be reasonable"],
    },
    language: {
      type: String,
      trim: true,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Normalize arrays
BookSchema.pre("save", function normalize(next) {
  if (Array.isArray(this.authors)) {
    this.authors = this.authors.map((s) => String(s).trim()).filter(Boolean);
  }
  if (Array.isArray(this.tags)) {
    this.tags = this.tags.map((s) => String(s).trim()).filter(Boolean);
  }
  next();
});

// Optional: text index to support "q" search well (Mongo will build it on first use)
BookSchema.index({ name: "text", authors: "text", isbn: "text", tags: "text" });

const Book = mongoose.model("Book", BookSchema);

module.exports = { Book };