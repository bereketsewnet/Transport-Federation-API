## TCWF API

Transport & Communication Workers Federation API (Node.js + Express + Sequelize + MySQL).

- **Stack**: Node.js, Express 5, Sequelize 6, MySQL
- **Auth**: JWT (bearer)
- **Docs/Testing**: Postman collection at `src/postman_endpoint.json`

### Prerequisites
- MySQL 8+ running and reachable
- Node.js 18+ and npm

### Environment variables
Create a `.env` file in the project root:

```env
# Server
PORT=4000

# Database (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=tcwf
DB_USER=root
DB_PASSWORD=your_password

# Auth (JWT)
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=1d

# Seed defaults (used by src/seed/seedAdmin.js)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisStrongAdminPass!
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=0000000000
```

### Install
```bash
npm install
```

### Database setup
You have two options:
- **Option A (SQL schema)**: Import `src/config/tcwf_schema_mysql.sql` into your MySQL database.
- **Option B (sync on seed)**: The admin seed script will call `sequelize.sync()` and create missing tables.

### Seed admin user
Creates an admin member and login account. This also syncs tables if they do not exist.
```bash
node src/seed/seedAdmin.js
```

### Run in development
Nodemon reloads on changes.
```bash
npm run dev
```
Server starts on `http://localhost:4000` by default.

### Run in production
```bash
npm start
# or explicitly
NODE_ENV=production node src/server.js
```
Optionally use PM2:
```bash
npm i -g pm2
pm2 start src/server.js --name tcwf-api
pm2 status
```

### Health check
```bash
curl http://localhost:4000/health
# => { "status": "ok" }
```

### Postman collection
- Import `src/postman_endpoint.json` into Postman.
- Set collection/environment variables:
  - **base_url**: `http://localhost:4000`
  - **jwt_token**: paste the token returned from the Login request.

### Generate endpoint examples (success and error)
This project includes a small script that reads the Postman collection and generates a Markdown file with example success/error payloads for each request.

```bash
# Default: reads src/postman_endpoint.json and writes ENDPOINTS_EXAMPLES.md
node generate-endpoint-examples.js

# Custom input/output
node generate-endpoint-examples.js --input src/postman_endpoint.json --output ENDPOINTS_EXAMPLES.md --format md
```
The examples are heuristic and based on common patterns used by the controllers (e.g., `{ data, meta }` for lists, `{ message: 'Not found' }` for missing resources, etc.). Adjust as needed.

### Common endpoints
- Auth: `POST /api/auth/login`
- Unions: CRUD under `/api/unions`
- Members: CRUD and archive under `/api/members`
- Reports: `/api/reports/members-summary`, `/api/reports/unions-cba-expired`, and report cache routes

### Notes
- In production, do not run destructive sync. The server has a commented `sequelize.sync({ alter: true })` hint—keep it disabled unless you fully understand the implications.
