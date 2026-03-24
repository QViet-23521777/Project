# SE113 HR MVP (MongoDB)

Minimum Viable Product cho module **Quan ly nhan su**: nhan vien, hop dong, bang luong va bao cao co ban.

## Run MongoDB (Docker)

```powershell
docker compose up -d
```

Mongo Express: http://localhost:8081

## Run API

```powershell
cd server
copy .env.example .env
npm install
npm run dev
```

API base: `http://localhost:3000/api`

Quick check:

```powershell
curl http://localhost:3000/api/health
```

## Endpoints (MVP)

- `GET /api/employees` `POST /api/employees` `GET/PATCH/DELETE /api/employees/:id`
- `GET /api/contracts` `POST /api/contracts` `PATCH/DELETE /api/contracts/:id`
- `GET /api/payrolls` `POST /api/payrolls` `PATCH/DELETE /api/payrolls/:id`
- `GET /api/reports/payroll-summary?month=YYYY-MM`
- `GET /api/reports/headcount-by-department`

## Run Frontend

```powershell
cd client
copy .env.example .env
npm install
npm run dev
```

UI: http://localhost:5173

Note: neu API khong chay o `http://localhost:3000/api` thi sua `client/.env` (VITE_API_BASE).
