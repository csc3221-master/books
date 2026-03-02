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

// Optional: normalize some fields
BookSchema.pre("save", function normalize(next) {
  if (Array.isArray(this.authors)) {
    this.authors = this.authors.map((s) => String(s).trim()).filter(Boolean);
  }
  if (Array.isArray(this.tags)) {
    this.tags = this.tags.map((s) => String(s).trim()).filter(Boolean);
  }
  next();
});

const Book = mongoose.model("Book", BookSchema);

module.exports = { Book };