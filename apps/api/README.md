# E-Bayanihan API 🚀

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-black.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748.svg)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.3.x-purple.svg)](https://www.better-auth.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A robust backend API for the E-Bayanihan community support platform, empowering local communities to coordinate disaster
response, volunteer management, and emergency services effectively. This is part of the E-Bayanihan monorepo.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [License](#-license)

## 🌟 Overview

E-Bayanihan is a comprehensive disaster response and community support platform designed specifically for Filipino
communities. The backend provides a RESTful API that enables:

- **Volunteer Management**: Coordinate community volunteers and their deployments
- **Real-time Location Tracking**: Monitor volunteer locations during emergency operations
- **Training Management**: Organize and track community preparedness training
- **SMS Alert System**: Send emergency notifications to community members
- **Administrative Dashboard**: Comprehensive overview for CDRRMO and community leaders

Built with modern technologies including Node.js, Express 5, TypeScript, Prisma ORM, and Better Auth for optimal performance and
maintainability. This API is part of a monorepo structure with shared packages for database, schemas, and authentication.

## ✨ Features

### Current Features

- **Authentication & Authorization**: Secure user authentication with Better Auth and role-based access control
- **User Management**: Complete CRUD operations for user accounts and profiles
- **Volunteer Management**: Volunteer registration, deployment, and tracking
- **Incident Management**: Create, update, and track emergency incidents
- **Training Management**: Training program creation and attendance tracking
- **Location Services**: Google Maps integration for location tracking
- **File Upload**: AWS S3 integration for file storage
- **Real-time Communication**: Socket.io for real-time updates
- **Email Services**: Resend integration for notifications
- **RESTful API**: Well-structured endpoints following REST principles
- **Database Integration**: Prisma ORM with robust data modeling
- **Environment Configuration**: Flexible configuration management with envalid
- **Development Tools**: Hot-reloading and debugging support with tsx


## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **Yarn**: Version 1.22.22 or higher (package manager for this monorepo)
- **Database**: PostgreSQL (recommended for production)
- **Git**: For version control

Optional but recommended:

- **Docker**: For containerized development
- **Postman** or similar API testing tool
- **AWS CLI**: For S3 file upload functionality

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/dev-laww/e-bayanihan.git
cd e-bayanihan
```

### 2. Install Dependencies

```bash
# Install all dependencies for the monorepo
yarn install
```

### 3. Database Setup

```bash
# Navigate to the database package
cd packages/database

# Generate Prisma client
yarn prisma generate

# Run database migrations
yarn prisma db push

# (Optional) Seed the database with initial data
yarn prisma db seed

# Return to root
cd ../..
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the API directory:

```bash
# Copy the example environment file
cp apps/.env.example apps/.env
```

Configure the following variables in your `apps/.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/e_bayanihan"

# Better Auth Configuration
BETTER_AUTH_SECRET=<your-super-secret-auth-key>
BETTER_AUTH_URL=http://localhost:3001

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=<your-aws-region>
AWS_S3_BUCKET=<your-s3-bucket-name>

# Google Maps Configuration
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>

# Email Configuration (Resend)
RESEND_API_KEY=<your-resend-api-key>

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000

# Twilio Configuration (for SMS alerts - optional)
TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone-number>
```

### Database Configuration

The application uses PostgreSQL as the primary database. Make sure you have PostgreSQL running locally or use a cloud provider like Supabase, Railway, or Neon.

Update your `DATABASE_URL` in the `.env` file with your PostgreSQL connection string.

## 🏃‍♂️ Usage

### Development Server

```bash
# Start all applications (API + Web) in development mode
yarn dev

# Or start only the API
cd apps
yarn dev
```

The API server will start at `http://localhost:8000` (or your configured PORT).

### Production Server

```bash
# Build all applications
yarn build

# Start all applications in production mode
yarn start

# Or start only the API
cd apps
yarn build
yarn start
```

### Available Scripts

| Script                   | Description                                 |
|--------------------------|---------------------------------------------|
| `yarn dev`               | Start development server with hot-reloading |
| `yarn build`             | Compile TypeScript to JavaScript            |
| `yarn start`             | Start production server                     |

## 📚 API Documentation

### Base URL

```
http://localhost:3001 (or your configured PORT)
```

### Authentication

The API uses Better Auth for authentication. All protected endpoints require proper authentication headers.

### Core Endpoints

#### Authentication (Better Auth)
- `POST /auth/sign-in` - User sign in
- `POST /auth/sign-up` - User registration
- `POST /auth/sign-out` - User sign out
- `GET /auth/session` - Get current session

#### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Volunteers
- `GET /volunteers` - Get all volunteers
- `POST /volunteers` - Create volunteer
- `GET /volunteers/:id` - Get volunteer by ID
- `PUT /volunteers/:id` - Update volunteer
- `DELETE /volunteers/:id` - Delete volunteer

#### Incidents
- `GET /incidents` - Get all incidents
- `POST /incidents` - Create incident
- `GET /incidents/:id` - Get incident by ID
- `PUT /incidents/:id` - Update incident
- `DELETE /incidents/:id` - Delete incident

#### Trainings
- `GET /trainings` - Get all trainings
- `POST /trainings` - Create training
- `GET /trainings/:id` - Get training by ID
- `PUT /trainings/:id` - Update training
- `DELETE /trainings/:id` - Delete training

#### Locations
- `GET /locations` - Get all locations
- `POST /locations` - Create location
- `GET /locations/:id` - Get location by ID
- `PUT /locations/:id` - Update location
- `DELETE /locations/:id` - Delete location

#### Attendance
- `GET /attendance` - Get attendance records
- `POST /attendance` - Create attendance record
- `PUT /attendance/:id` - Update attendance record

#### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/analytics` - Get analytics data

### Response Format

All API responses follow this structure:

```json lines
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🛠️ Development

### Code Structure

```
src/
├── controllers/    # Route controllers
├── middlewares/    # Express middlewares
├── lib/           # Core libraries (auth, external services)
├── routes/         # API routes
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── index.ts        # Application entry point
└── server.ts       # Express server setup
```

### Coding Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with shared configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Monorepo Structure**: Shared packages for common functionality

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "feat: add new feature"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Create a Pull Request

## 🧪 Testing

### Running Tests

```bash
# Run all tests (from root)
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Test Structure

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows

*Note: Test setup is planned for future implementation.*

## 🚀 Deployment

### Using Docker

```bash
# Build Docker image
docker build -t e-bayanihan-api .

# Run container
docker run -p 8000:8000 --env-file apps/.env e-bayanihan-api
```

### Using PM2 (Production)

```bash
# Install PM2 globally
yarn global add pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Monitor application
pm2 status
pm2 logs
```

### Environment-specific Deployment

- **Development**: `yarn dev`
- **Staging**: `yarn build && NODE_ENV=staging yarn start`
- **Production**: `yarn build && NODE_ENV=production yarn start`

## 🏗️ Architecture

### Monorepo Structure

This API is part of the E-Bayanihan monorepo with the following structure:

```
e-bayanihan/
├── apps/
│   ├── api/          # This API backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── auth/         # Shared authentication utilities
│   ├── database/     # Prisma database client and schema
│   ├── schemas/      # Zod validation schemas
│   ├── ui/           # Shared UI components
│   └── ...           # Other shared packages
└── ...
```

### Key Dependencies

- **Express 5**: Web framework
- **Better Auth**: Authentication and session management
- **Prisma**: Database ORM
- **Socket.io**: Real-time communication
- **AWS S3**: File storage
- **Google Maps**: Location services
- **Resend**: Email services

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, create an issue in the [GitHub repository](https://github.com/dev-laww/e-bayanihan).

## 🙏 Acknowledgments

- Filipino communities for inspiring this project
- CDRRMO offices for their valuable feedback
- Open source community for the amazing tools and libraries

---

**Made with ❤️ for Filipino communities**

*E-Bayanihan - Empowering communities through technology*