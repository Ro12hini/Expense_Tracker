const express = require("express");
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
} = require("../controllers/expenseController");

router.get("/api/expenses", getExpenses);
router.post("/api/expenses", createExpense);
router.put("/api/expenses/:id", updateExpense);
router.delete("/api/expenses/:id", deleteExpense);
router.get("/api/summary", getSummary);

module.exports = router;
