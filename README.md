# 💰 Production-Ready Expense Tracker Web Application

A full-stack financial management web application built with **React (Vite)**, **Node.js (Express)**, and **MongoDB (Mongoose)**. It provides real-time income and expense tracking, custom categories, advanced aggregation-driven cashflow analytics, interactive charts, and multi-parameter filtering, sorting, and pagination.

---

## 🌟 Key Features

1. **Authentication & Security**
   - User registration and login using **JWT (JSON Web Tokens)**.
   - **bcryptjs** password hashing (10 salt rounds).
   - Strict per-user data tenancy: users can only view and manage their own financial data.
   - Security middleware: **Helmet** (HTTP headers), **CORS** whitelist, and **express-rate-limit** (brute-force defense).

2. **Income & Expense CRUD**
   - Full CRUD operations: Amount, Type (`income` / `expense`), Category, Date, and Note.
   - Comprehensive input validation and sanitization using **express-validator**.
   - Indexed database fields (`user`, `date`, `category`, `type`) for sub-millisecond query execution.

3. **Predefined & Custom Categories**
   - Default built-in categories: `Food`, `Rent`, `Travel`, `Salary`, `Shopping`, `Bills`, `Other`.
   - Dynamic user-created custom categories with duplication protection.

4. **MongoDB Aggregation Pipelines**
   - **Monthly Summary (`GET /api/summary/monthly?month=X&year=Y`)**:
     - Computes total income, total expense, net balance, and transaction count in a single round-trip using `$facet`.
     - Category-wise breakdown with percentage calculations for doughnut / pie chart visualizations.
   - **Yearly Summary (`GET /api/summary/yearly?year=Y`)**:
     - Month-by-month cashflow breakdown (Jan to Dec) with income vs. expense comparison for bar chart visualizations.

5. **Advanced Filtering, Sorting & Pagination**
   - Filter by type (`income`/`expense`), category, date range (`startDate`, `endDate`), and text search across transaction notes.
   - Sort by date or amount (`asc` / `desc`).
   - Server-side pagination with `limit`, `page`, total count, and total page calculations.

6. **Interactive Dashboard & UI**
   - **Chart.js (`react-chartjs-2`)**: Spending breakdown pie chart and yearly monthly income vs expense bar chart.
   - Dynamic Month / Year selector.
   - Responsive design with status badges, modal dialogs, and smooth state transitions.

---

## 🏗️ Project Structure

```text
expense-tracker/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection using Mongoose
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile (/me)
│   │   ├── categoryController.js # Predefined + custom category operations
│   │   ├── summaryController.js  # MongoDB Aggregation pipelines
│   │   └── transactionController.js # Transaction CRUD, filter, sort, paginate
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & user attachment
│   │   ├── errorMiddleware.js    # 404 & centralized JSON error handler
│   │   └── validateMiddleware.js # express-validator error formatter
│   ├── models/
│   │   ├── Category.js           # Category Schema with user scoping
│   │   ├── Transaction.js        # Transaction Schema with compound indexes
│   │   └── User.js               # User Schema with bcrypt pre-save hook
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── categoryRoutes.js     # /api/categories routes
│   │   ├── summaryRoutes.js      # /api/summary routes
│   │   └── transactionRoutes.js  # /api/transactions routes
│   ├── utils/
│   │   ├── predefinedCategories.js # List of predefined categories
│   │   └── seed.js               # Database seeding script with demo user
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express app, helmet, cors, rate-limiter
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js    # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── CategoryModal.jsx # Modal to create/delete custom categories
│   │   │   ├── FilterBar.jsx     # Filter, search, and sort controls
│   │   │   ├── Navbar.jsx        # Navigation bar with user badge & logout
│   │   │   ├── ProtectedRoute.jsx# Auth route guard
│   │   │   ├── SummaryCard.jsx   # Metric card component
│   │   │   └── TransactionModal.jsx # Modal for adding/editing transactions
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state & login/register actions
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Financial overview & Chart.js charts
│   │   │   ├── Login.jsx         # Sign in page + one-click demo filler
│   │   │   ├── Register.jsx      # Sign up page
│   │   │   └── Transactions.jsx  # Paginated transaction table with filters
│   │   ├── App.jsx               # Routes setup & layout wrapper
│   │   ├── index.css             # Production-grade CSS styling system
│   │   └── main.jsx              # React DOM render entry
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js            # Vite config with API reverse proxy
│   └── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/expense_tracker` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | `your_super_secret_jwt_key_here` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |

### Client (`client/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend API requests | `http://localhost:5000/api` |

---

## 🚀 Setup & Local Execution

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or newer recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI

---

### Step 1: Backend Setup

1. Open a terminal and navigate to `server`:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `MONGO_URI` points to your MongoDB instance).*

4. Seed the database with sample user data, custom categories, and transactions:
   ```bash
   npm run seed
   ```
   > **Seed Output:**
   > Demo User: `demo@example.com`
   > Password: `Password123!`

5. Start the backend server:
   ```bash
   # Development mode with hot-reload
   npm run dev

   # Or standard production start
   npm start
   ```
   The backend will be running at `http://localhost:5000`.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to `client`:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.
   - Log in using `demo@example.com` / `Password123!` (or click the **"Quick Fill Demo User"** button).
   - Alternatively, click **"Create an account"** to register a new user.

---

## 📡 API Documentation

All protected endpoints require the HTTP Header:
```http
Authorization: Bearer <your_jwt_token>
```

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user with `name`, `email`, `password` |
| `POST` | `/api/auth/login` | Public | Authenticate user with `email`, `password` and receive JWT |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |

#### Request Example (`POST /api/auth/register`):
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```

---

### 2. Transactions (`/api/transactions`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | Private | Get paginated list with search, filter, and sort |
| `POST` | `/api/transactions` | Private | Create a new transaction |
| `GET` | `/api/transactions/:id` | Private | Retrieve transaction by ID |
| `PUT` | `/api/transactions/:id` | Private | Update an existing transaction |
| `DELETE` | `/api/transactions/:id`| Private | Delete a transaction |

#### Query Parameters for `GET /api/transactions`:
- `type`: `income` or `expense`
- `category`: Category name (e.g. `Food`, `Salary`)
- `startDate`: ISO 8601 date string (e.g. `2026-01-01`)
- `endDate`: ISO 8601 date string (e.g. `2026-12-31`)
- `minAmount` / `maxAmount`: Numeric range filter
- `search`: Substring search in transaction notes
- `sortBy`: `date` or `amount` (default: `date`)
- `sortOrder`: `desc` or `asc` (default: `desc`)
- `page`: Page number (default: `1`)
- `limit`: Number of items per page (default: `10`)

#### Transaction Object Schema:
```json
{
  "_id": "671bee81e8c105ab1352e001",
  "user": "671bee81e8c105ab1352e000",
  "amount": 1400.00,
  "type": "expense",
  "category": "Rent",
  "date": "2026-10-02T10:00:00.000Z",
  "note": "Apartment rent payment",
  "createdAt": "2026-10-25T20:50:00.000Z",
  "updatedAt": "2026-10-25T20:50:00.000Z"
}
```

---

### 3. Summaries & Aggregation (`/api/summary`)

#### Monthly Summary:
`GET /api/summary/monthly?month=10&year=2026`
- **Output:**
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 10,
    "monthName": "Oct",
    "totalIncome": 6350,
    "totalExpense": 2182.49,
    "balance": 4167.51,
    "transactionCount": 9,
    "expenseBreakdown": [
      { "category": "Rent", "total": 1400, "count": 1, "percentage": 64.1 },
      { "category": "Food", "total": 352.5, "count": 2, "percentage": 16.2 },
      { "category": "Shopping", "total": 195, "count": 1, "percentage": 8.9 },
      { "category": "Bills", "total": 160, "count": 1, "percentage": 7.3 },
      { "category": "Travel", "total": 115, "count": 1, "percentage": 5.3 }
    ],
    "incomeBreakdown": [
      { "category": "Salary", "total": 5500, "count": 1, "percentage": 86.6 },
      { "category": "Investments", "total": 850, "count": 1, "percentage": 13.4 }
    ]
  }
}
```

#### Yearly Summary:
`GET /api/summary/yearly?year=2026`
- **Output:**
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "yearlyTotalIncome": 64350,
    "yearlyTotalExpense": 21824.9,
    "yearlyNetSavings": 42525.1,
    "months": [
      { "month": 1, "monthName": "Jan", "income": 6350, "expense": 2182.49, "net": 4167.51, "count": 9 },
      { "month": 2, "monthName": "Feb", "income": 5500, "expense": 2182.49, "net": 3317.51, "count": 8 },
      ...
    ]
  }
}
```

---

### 4. Categories (`/api/categories`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Private | Returns merged list of predefined + user's custom categories |
| `POST` | `/api/categories` | Private | Create a new custom category |
| `DELETE` | `/api/categories/:id`| Private | Delete a custom category |

---

## 🛡️ Security & Best Practices Implemented

- **Password Hashing:** Passwords are never stored in plaintext; salt rounds = 10 with `bcryptjs`.
- **Query Scoping:** Every transaction and category read/write query strictly includes `{ user: req.user._id }`.
- **Compound Indexes:** Mongoose schemas feature indexes on `{ user: 1, date: -1 }`, `{ user: 1, category: 1 }`, and `{ user: 1, type: 1 }` ensuring fast searches and aggregations even with large datasets.
- **Rate Limiting:** Protects against brute force and DDoS via `express-rate-limit`.
- **HTTP Header Hardening:** Configured with `helmet` for secure response headers.
- **Centralized Error Handler:** Safely catches Mongoose validation errors, duplicate keys (code 11000), cast errors, and expired JWT tokens with uniform JSON responses.
