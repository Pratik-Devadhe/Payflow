# Payflow - Fintech Payment & Account Management Platform

Payflow is a full-stack financial transaction and bank account management platform with a Spring Boot REST API backend and a modern React frontend.

---

## Project Structure

```
payflow/
├── backend/                  # Spring Boot 4 REST API
│   ├── src/main/java/com/payflow/
│   │   ├── config/           # CORS & application configuration
│   │   ├── controller/       # REST Controllers (Users, Accounts, Payments)
│   │   ├── dto/              # Request / Response records
│   │   ├── entities/         # JPA Entities (User, Account, Payment)
│   │   ├── enums/            # AccountStatus, PaymentStatus
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   └── services/         # Transactional Business Services
│   ├── src/main/resources/   # application.properties (PostgreSQL)
│   └── pom.xml
│
└── frontend/                 # React + Vite + Tailwind CSS Application
    ├── src/
    │   ├── api/              # API clients for Users, Accounts, Payments
    │   ├── components/       # UI components (Users, Accounts, Payments, Navigation)
    │   ├── App.jsx           # Main Dashboard and state container
    │   └── index.css         # Tri-Color Theme (Navy, Emerald, Saffron)
    ├── vite.config.js        # Dev proxy to http://localhost:8080
    └── package.json
```

---

## Getting Started

### 1. Run Backend (Spring Boot)

Ensure PostgreSQL is running with database `payflow` (as configured in `backend/src/main/resources/application.properties`):

```bash
cd backend
mvn spring-boot:run
```
The backend API server will start on `http://localhost:8080`.

### 2. Run Frontend (React)

```bash
cd frontend
npm install
npm run dev
```
The React development server will start on `http://localhost:5173`.
