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
├── public/                    # Frontend (served statically)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── sql/
│   └── schema.sql             # Run this in MySQL Workbench first
├── server.js                   # App entry point
├── .env.example
└── package.json
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up the database
Open MySQL Workbench and run the contents of `sql/schema.sql`. This creates the `expense_tracker` database and `expenses` table.

### 3. Configure environment variables
```bash
cp .env.example .env
```
Fill in your real MySQL password in `.env`. Note this app runs on **port 3001** by default (not 3000), so it doesn't clash with the URL shortener project if you run both at once.

### 4. Run the server
```bash
npm start
```
Or with auto-restart during development:
```bash
npm run dev
```

Visit `http://localhost:3001` in your browser.

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
