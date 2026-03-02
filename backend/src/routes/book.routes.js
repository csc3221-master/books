const express = require("express");
const controller = require("../controllers/book.controller");

const router = express.Router();

router.get("/", controller.listBooks);
router.get("/:id", controller.getBookById);
router.post("/", controller.createBook);
router.put("/:id", controller.updateBook);
router.delete("/:id", controller.deleteBook);

module.exports = { bookRouter: router };