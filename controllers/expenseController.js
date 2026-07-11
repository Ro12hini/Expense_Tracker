const { pool } = require("../config/db");

const ALLOWED_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Education",
  "Other",
];

function isValidExpense({ title, amount, category, expenseDate }) {
  if (!title || typeof title !== "string" || title.trim().length === 0) return "Title is required.";
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) return "Amount must be a positive number.";
  if (!category || !ALLOWED_CATEGORIES.includes(category)) return `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}.`;
  if (!expenseDate || isNaN(Date.parse(expenseDate))) return "A valid date is required.";
  return null;
}

// GET /api/expenses  (supports optional ?category= and ?month=YYYY-MM filters)
async function getExpenses(req, res) {
  const { category, month } = req.query;

  let query = "SELECT * FROM expenses WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (month) {
    query += " AND DATE_FORMAT(expense_date, '%Y-%m') = ?";
    params.push(month);
  }

  query += " ORDER BY expense_date DESC, id DESC";

  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching expenses:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// POST /api/expenses
async function createExpense(req, res) {
  const { title, amount, category, expenseDate } = req.body;

  const validationError = isValidExpense({ title, amount, category, expenseDate });
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const [result] = await pool.execute(
      "INSERT INTO expenses (title, amount, category, expense_date) VALUES (?, ?, ?, ?)",
      [title.trim(), amount, category, expenseDate]
    );
    const [rows] = await pool.execute("SELECT * FROM expenses WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating expense:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// PUT /api/expenses/:id
async function updateExpense(req, res) {
  const { id } = req.params;
  const { title, amount, category, expenseDate } = req.body;

  const validationError = isValidExpense({ title, amount, category, expenseDate });
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const [result] = await pool.execute(
      "UPDATE expenses SET title = ?, amount = ?, category = ?, expense_date = ? WHERE id = ?",
      [title.trim(), amount, category, expenseDate, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }

    const [rows] = await pool.execute("SELECT * FROM expenses WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating expense:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// DELETE /api/expenses/:id
async function deleteExpense(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.execute("DELETE FROM expenses WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }
    res.json({ message: "Expense deleted." });
  } catch (err) {
    console.error("Error deleting expense:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
}

// GET /api/summary  -> total spend + breakdown by category (for the chart)
async function getSummary(req, res) {
  try {
    const [totalRows] = await pool.execute("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses");
    const [byCategory] = await pool.execute(
      "SELECT category, COALESCE(SUM(amount), 0) AS total FROM expenses GROUP BY category ORDER BY total DESC"
    );

    res.json({
      total: totalRows[0].total,
      byCategory,
    });
  } catch (err) {
    console.error("Error fetching summary:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
}

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  ALLOWED_CATEGORIES,
};
