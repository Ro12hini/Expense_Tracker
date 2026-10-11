# Expense Tracker

A full-stack personal expense/budget tracker built with Node.js, Express, and MySQL. Add, edit, delete, and filter expenses by category or month, and see a live doughnut chart breakdown of spending by category.

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** MySQL (via `mysql2`)
- **Frontend:** Vanilla HTML/CSS/JS + Chart.js (via CDN)

## Project Structure
```
expense-tracker/
├── config/
│   └── db.js                  # MySQL connection pool
├── controllers/
│   └── expenseController.js   # CRUD + summary logic, validation
├── routes/
│   └── expenseRoutes.js       # Express route definitions
├── public/                    # Frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js                   
├── .env
└── package.json
```

## API Endpoints

| Method | Endpoint                              | Description                                   |
|--------|-----------------------------------------|------------------------------------------------|
| GET    | `/api/expenses`                        | List expenses. Optional `?category=` and `?month=YYYY-MM` filters |
| POST   | `/api/expenses`                        | Create an expense. Body: `{ title, amount, category, expenseDate }` |
| PUT    | `/api/expenses/:id`                    | Update an expense (same body shape as POST)    |
| DELETE | `/api/expenses/:id`                    | Delete an expense                              |
| GET    | `/api/summary`                         | Total spend + totals grouped by category (feeds the chart) |

## Categories
Fixed list, enforced on both frontend and backend: `Food, Transport, Rent, Utilities, Entertainment, Shopping, Health, Education, Other`.

## Possible next steps
- Add monthly budget limits per category with over-budget warnings
- Add a bar chart of spending trend across months
- Add user accounts (auth) so multiple people can track separately
- Export expenses to CSV
- Deploy backend to Render/Railway
