# E-Bayanihan Web 🌐

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A modern, responsive web application for the E-Bayanihan community support platform. Built with Next.js 15, React 19, and Tailwind CSS, providing an intuitive interface for disaster response coordination, volunteer management, and community engagement.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Development](#-development)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [License](#-license)

## 🌟 Overview

E-Bayanihan Web is the frontend application of the E-Bayanihan platform, designed to provide a seamless user experience for:

- **Community Members**: Easy access to emergency information and volunteer opportunities
- **Volunteers**: Registration, training management, and deployment coordination
- **Administrators**: Comprehensive dashboard for managing incidents, volunteers, and resources
- **Emergency Responders**: Real-time incident tracking and volunteer coordination

Built with modern web technologies and optimized for performance, accessibility, and mobile responsiveness.

## ✨ Features

### Current Features

- **Modern UI/UX**: Clean, intuitive interface built with Radix UI and Tailwind CSS
- **Authentication**: Secure user authentication with Better Auth integration
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Live data synchronization with Socket.io
- **Interactive Maps**: Google Maps integration for location services
- **Data Visualization**: Charts and analytics with Recharts
- **Form Management**: Advanced form handling with React Hook Form and Zod validation
- **File Upload**: Drag-and-drop file upload with preview
- **Dark Mode**: Theme switching with next-themes
- **Accessibility**: WCAG compliant components and keyboard navigation


## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **Yarn**: Version 1.22.22 or higher (package manager for this monorepo)
- **Git**: For version control

Optional but recommended:

- **VS Code**: With recommended extensions
- **Chrome DevTools**: For debugging

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

### 3. Environment Setup

Create a `.env.local` file in the web directory:

```bash
# Copy the example environment file
cp apps/web/.env.example apps/web/.env.local
```

## ⚙️ Configuration

### Environment Variables

Configure the following variables in your `apps/web/.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_SECRET=<your-auth-secret>

# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>

# Socket.io Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Google Maps Setup

1. Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Add your domain to the API key restrictions

## 🏃‍♂️ Usage

### Development Server

```bash
# Start all applications (API + Web) in development mode
yarn dev

# Or start only the web application
cd apps/web
yarn dev
```

The web application will start at `http://localhost:3000`.

### Production Build

```bash
# Build all applications
yarn build

# Start all applications in production mode
yarn start

# Or start only the web application
cd apps/web
yarn build
yarn start
```

### Available Scripts

| Script                   | Description                                 |
|--------------------------|---------------------------------------------|
| `yarn dev`               | Start development server with hot-reloading |
| `yarn build`             | Build the application for production        |
| `yarn start`             | Start production server                     |
| `yarn lint`              | Run ESLint for code quality                 |
| `yarn check-types`       | Run TypeScript type checking                |

## 🛠️ Development

### Code Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Authentication pages
│   ├── dashboard/    # Dashboard pages
│   ├── incidents/    # Incident management
│   ├── volunteers/   # Volunteer management
│   ├── trainings/    # Training management
│   └── ...
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (Radix UI)
│   ├── forms/       # Form components
│   ├── charts/      # Data visualization
│   └── ...
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── contexts/        # React contexts
└── actions/         # Server actions
```

### Component Architecture

- **UI Components**: Base components built with Radix UI primitives
- **Feature Components**: Business logic components
- **Layout Components**: Page layout and navigation
- **Form Components**: Reusable form elements with validation

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: For theme customization
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System preference detection

### State Management

- **React Query**: Server state management and caching
- **React Context**: Global application state
- **Local State**: Component-level state with useState/useReducer
- **Form State**: React Hook Form for form management

## 🚀 Deployment

### Using Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Using Docker

```bash
# Build Docker image
docker build -t e-bayanihan-web .

# Run container
docker run -p 3000:3000 --env-file apps/web/.env.local e-bayanihan-web
```

### Environment-specific Deployment

- **Development**: `yarn dev`
- **Staging**: `yarn build && NODE_ENV=staging yarn start`
- **Production**: `yarn build && NODE_ENV=production yarn start`

## 🏗️ Architecture

### Monorepo Structure

This web application is part of the E-Bayanihan monorepo:

```
e-bayanihan/
├── apps/
│   ├── api/          # Express.js backend API
│   └── web/          # This Next.js frontend
├── packages/
│   ├── auth/         # Shared authentication utilities
│   ├── database/     # Prisma database client
│   ├── schemas/      # Zod validation schemas
│   ├── ui/           # Shared UI components
│   └── ...           # Other shared packages
└── ...
```

### Key Dependencies

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **React Query**: Server state management
- **Better Auth**: Authentication integration
- **Socket.io**: Real-time communication
- **Google Maps**: Location services
- **Recharts**: Data visualization

### Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with WebP support
- **Font Optimization**: Next.js font optimization
- **Bundle Analysis**: Webpack bundle analyzer
- **Lazy Loading**: Component and route lazy loading

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