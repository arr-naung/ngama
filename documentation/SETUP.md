# Setup Guide

This guide will help you set up the X-Clone project on your local machine.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v10.9.3 or higher
- **Git**: For version control

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Antigravity
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for all packages in the monorepo.

### 3. Set Up Environment Variables

#### Web Application

Create `apps/web/.env`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/xclone"

# JWT Secret (change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# API URL for client-side
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

#### Mobile Application

Create `apps/mobile/.env`:

```env
# API URL (use your local IP for testing on physical devices)
EXPO_PUBLIC_API_URL="http://localhost:3000"
# For physical device testing, use your machine's IP:
# EXPO_PUBLIC_API_URL="http://192.168.1.x:3000"
```

#### API Server

Create `apps/api/.env`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/xclone"

# JWT Secret (must match web app!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Upload base URL for mobile access
UPLOAD_BASE_URL="http://192.168.1.x:3001"
```

### 4. Set Up PostgreSQL Database

#### Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Create database
createdb xclone

# Or using psql:
psql -U postgres
CREATE DATABASE xclone;
\q
```

#### Run Migrations

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
cd ../..
```

This will:
- Connect to PostgreSQL database
- Run migrations to create tables
- Generate Prisma Client

### 5. Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts:
- **API server**: http://localhost:3001 (NestJS)
- **Web app**: http://localhost:3000 (Next.js)
- **Mobile app**: Expo development server

Alternatively, run them separately:

```bash
# Web only
npx turbo dev --filter=web

# Mobile only (in a separate terminal)
cd apps/mobile
npm run start
```

## Mobile Development

### Running on iOS Simulator

```bash
cd apps/mobile
npm run ios
```

### Running on Android Emulator

```bash
cd apps/mobile
npm run android
```

### Running on Physical Device

1. Install Expo Go app on your device
2. Ensure your device is on the same network as your development machine
3. Update `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to use your machine's local IP
4. Run `npm run start` and scan the QR code

## Common Issues

### Port Already in Use

If port 3000 is already in use:

```bash
# Change the port in apps/web/package.json
"dev": "next dev --port 3001"
```

### Database Connection Errors

If you encounter PostgreSQL connection errors:

1. Ensure PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL in `apps/api/.env`
3. Verify database exists: `psql -U postgres -l`
4. Reset migrations if needed:
   ```bash
   cd apps/api
   npx prisma migrate reset
   npx prisma migrate dev
   ```

### Module Not Found Errors

```bash
# Clear all node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

## Project Structure

```
Antigravity/
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── db/               # Prisma database layer
│   ├── schema/           # Shared validation schemas
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # ESLint configuration
│   └── typescript-config/ # TypeScript configuration
├── documentation/        # Project documentation
└── turbo.json           # Turborepo configuration
```

## Development Workflow

### Making Database Changes

1. Modify `packages/db/prisma/schema.prisma`
2. Create a migration:
   ```bash
   cd packages/db
   npx prisma migrate dev --name your_migration_name
   ```
3. Prisma Client will auto-generate

### Type Checking

```bash
npm run check-types
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Building for Production

### Web

```bash
npx turbo build --filter=web
cd apps/web
npm run start
```

### Mobile

```bash
cd apps/mobile
npx eas build --platform android
npx eas build --platform ios
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
- Check [API_REFERENCE.md](./API_REFERENCE.md) for API documentation
- Review [PROJECT_FEEDBACK.md](./PROJECT_FEEDBACK.md) for improvement recommendations
