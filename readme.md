# Sekolah Kaya Backend

A Learning Management System (LMS) backend API built with Node.js, TypeScript, Express, Prisma, and Redis.

## Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)
- PostgreSQL database
- Redis server

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sekolahkaya-be
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL="postgresql://username:password@localhost:5432/sekolahkaya_db"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET=your-jwt-secret
   CORS_ORIGINS=http://localhost:3000
   # Add other required environment variables as per your configuration
   ```

   Note: Adjust the values according to your local setup.

## Database Setup

1. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

2. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

3. (Optional) Seed the database with initial data:
   ```bash
   npm run prisma:seed
   ```

## Build

Compile the TypeScript code to JavaScript:
```bash
npm run build
```

This command will:
- Compile TypeScript files from `src/` to `dist/`
- Add `.js` extensions to import statements in the compiled files

## Run

Start the production server:
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:3000/api-docs`
- JSON Spec: `http://localhost:3000/api-docs.json`

## Health Check

Check server health at: `http://localhost:3000/health`

## Additional Scripts

- `npm run lint`: Lint the code
- `npm run format`: Format the code
- `npm run test`: Run tests
- `npm run prisma:studio`: Open Prisma Studio for database management
