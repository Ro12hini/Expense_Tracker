const form = document.getElementById("expense-form");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");
const errorText = document.getElementById("error-text");

const expenseIdInput = document.getElementById("expense-id");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("expense-date");

const expenseList = document.getElementById("expense-list");
const emptyText = document.getElementById("empty-text");
const totalAmountEl = document.getElementById("total-amount");

const filterCategory = document.getElementById("filter-category");
const filterMonth = document.getElementById("filter-month");
const clearFiltersBtn = document.getElementById("clear-filters");

let chart = null;

// ---------- Helpers ----------
function formatCurrency(num) {
  return `₹${Number(num).toFixed(2)}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function buildQuery() {
  const params = new URLSearchParams();
  if (filterCategory.value) params.append("category", filterCategory.value);
  if (filterMonth.value) params.append("month", filterMonth.value);
  return params.toString() ? `?${params.toString()}` : "";
}

// ---------- Load data ----------
async function loadExpenses() {
  try {
    const res = await fetch(`/api/expenses${buildQuery()}`);
    const data = await res.json();
    renderExpenses(data);
  } catch (err) {
    console.error("Failed to load expenses:", err);
  }
}

async function loadSummary() {
  try {
    const res = await fetch("/api/summary");
    const data = await res.json();
    totalAmountEl.textContent = formatCurrency(data.total);
    renderChart(data.byCategory);
  } catch (err) {
    console.error("Failed to load summary:", err);
  }
}

function refreshAll() {
  loadExpenses();
  loadSummary();
}

// ---------- Render table ----------
function renderExpenses(expenses) {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    emptyText.classList.remove("hidden");
    return;
  }
  emptyText.classList.add("hidden");

  expenses.forEach((exp) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(exp.expense_date)}</td>
      <td>${escapeHtml(exp.title)}</td>
      <td><span class="category-tag">${escapeHtml(exp.category)}</span></td>
      <td>${formatCurrency(exp.amount)}</td>
      <td class="row-actions">
        <button class="edit-btn secondary" data-id="${exp.id}">Edit</button>
        <button class="delete-btn" data-id="${exp.id}">Delete</button>
      </td>
    `;
    expenseList.appendChild(tr);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", () => startEdit(expenses, btn.dataset.id))
  );
  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => deleteExpense(btn.dataset.id))
  );
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Chart ----------
function renderChart(byCategory) {
  const ctx = document.getElementById("category-chart");

  const labels = byCategory.map((c) => c.category);
  const values = byCategory.map((c) => c.total);
  const colors = [
    "#e8a9c3", "#c9aede", "#f6d6a8", "#a8d8c9",
    "#f3b6b6", "#b8c9ec", "#d9b8e0", "#f0c9dd", "#c3ddb0",
  ];

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }],
    },
    options: {
      plugins: {
        legend: { position: "bottom", labels: { color: "#6b4c63", font: { size: 11, family: "Nunito" } } },
      },
    },
  });
}

// ---------- Form submit (create or update) ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorText.classList.add("hidden");

  const payload = {
    title: titleInput.value.trim(),
    amount: parseFloat(amountInput.value),
    category: categoryInput.value,
    expenseDate: dateInput.value,
  };

  const editingId = expenseIdInput.value;
  const url = editingId ? `/api/expenses/${editingId}` : "/api/expenses";
  const method = editingId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      errorText.textContent = data.error || "Something went wrong.";
      errorText.classList.remove("hidden");
      return;
    }

    resetForm();
    refreshAll();
  } catch (err) {
    errorText.textContent = "Could not reach the server.";
    errorText.classList.remove("hidden");
  }
});

// ---------- Edit ----------
function startEdit(expenses, id) {
  const exp = expenses.find((e) => String(e.id) === String(id));
  if (!exp) return;

  expenseIdInput.value = exp.id;
  titleInput.value = exp.title;
  amountInput.value = exp.amount;
  categoryInput.value = exp.category;
  dateInput.value = exp.expense_date.slice(0, 10);

  formTitle.textContent = "Edit Expense";
  submitBtn.textContent = "Update Expense";
  cancelEditBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

cancelEditBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  expenseIdInput.value = "";
  formTitle.textContent = "Add Expense";
  submitBtn.textContent = "Add Expense";
  cancelEditBtn.classList.add("hidden");
  errorText.classList.add("hidden");
}

// ---------- Delete ----------
async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;

  try {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    refreshAll();
  } catch (err) {
    console.error("Failed to delete:", err);
  }
}

// ---------- Filters ----------
filterCategory.addEventListener("change", loadExpenses);
filterMonth.addEventListener("change", loadExpenses);
clearFiltersBtn.addEventListener("click", () => {
  filterCategory.value = "";
  filterMonth.value = "";
  loadExpenses();
});

// ---------- Init ----------
dateInput.valueAsDate = new Date();
refreshAll();
