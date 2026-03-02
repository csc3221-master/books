// backend/src/routes/book.routes.js
const express = require("express");
const controller = require("../controllers/book.controller");

const router = express.Router();

// IMPORTANT: Put /isbn/:isbn BEFORE /:id
router.get("/", controller.listBooks);
router.get("/isbn/:isbn", controller.getBookByIsbn);
router.get("/:id", controller.getBookById);
router.post("/", controller.createBook);
router.put("/:id", controller.updateBook);
router.delete("/:id", controller.deleteBook);

module.exports = { bookRouter: router };