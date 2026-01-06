# Insurance Management System - Frontend

A comprehensive insurance management platform built with Angular 21, featuring role-based access control and a modular architecture for managing insurance policies, claims, and user interactions.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Modular Structure](#modular-structure)
- [Role-Based Access Control](#role-based-access-control)
- [User Roles and Modules](#user-roles-and-modules)
- [Core Features](#core-features)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Development](#development)
- [Build and Test](#build-and-test)

## Overview

This Insurance Management System is a modern, scalable frontend application designed to handle the complete lifecycle of insurance operations. The system supports multiple user roles including members, agents, providers, claims officers, and administrators, each with dedicated modules and features tailored to their specific needs.

The application implements a robust modular architecture with lazy-loaded modules, ensuring optimal performance and clear separation of concerns. Each user role has access to a specific set of features protected by authentication guards and role-based access control.

## Technology Stack

- **Framework**: Angular 21.0.0
- **UI Libraries**: 
  - Angular Material (21.0.5)
  - PrimeIcons (7.0.0)
  - Tailwind CSS (4.1.12)
- **State Management**: RxJS (7.8.0) with Signals
- **HTTP Client**: Angular HTTP Client with Interceptors
- **Authentication**: JWT (JSON Web Tokens) with jwt-decode
- **Testing**: Vitest (4.0.8)
- **Build Tool**: Angular CLI (21.0.3)

## Architecture

The application follows Angular's best practices and modern architectural patterns:

### 1. **Modular Architecture**
- Lazy-loaded feature modules for optimal performance
- Standalone components for better tree-shaking
- Clear separation between smart (container) and presentational components

### 2. **Reactive Programming**
- RxJS observables for asynchronous data handling
- Angular Signals for reactive state management
- `toSignal()` for seamless Observable-to-Signal conversion

### 3. **Security Layer**
- JWT-based authentication
- HTTP interceptors for automatic token injection
- Route guards for authentication and role-based authorization
- Directive-based UI element visibility control

### 4. **Service-Oriented Design**
- Centralized API service for HTTP communication
- Domain-specific services (Policy, Claim, Hospital, etc.)
- Singleton services using `providedIn: 'root'`

## Modular Structure

The application is organized into distinct modules, each serving a specific purpose:

```
src/app/
├── core/                    # Core functionality used across the app
│   ├── guards/              # Route protection (auth, role-based)
│   ├── interceptors/        # HTTP interceptors (JWT, error handling)
│   ├── models/              # TypeScript interfaces and enums
│   └── services/            # Business logic and API communication
├── modules/                 # Feature modules (lazy-loaded)
│   ├── admin/               # Admin-specific features
│   ├── agent/               # Insurance agent features
│   ├── auth/                # Authentication pages
│   ├── claims-officer/      # Claims processing features
│   ├── member/              # Customer/member features
│   ├── provider/            # Healthcare provider features
│   └── public/              # Publicly accessible pages
├── shared/                  # Reusable components and utilities
│   ├── components/          # Shared UI components
│   └── directives/          # Custom directives
└── environment/             # Environment configurations
```

### Module Organization Pattern

Each feature module follows a consistent structure:

```
module-name/
├── container/               # Smart components with business logic
│   └── component-name/      # Reusable container components
├── pages/                   # Page-level components (routed)
│   └── page-name/           # Individual page components
├── module-name-module.ts    # NgModule definition
└── module-name-routing.ts   # Module-specific routes
```

This pattern ensures:
- **Separation of Concerns**: Smart components handle logic, dumb components handle presentation
- **Reusability**: Container components can be reused across different pages
- **Maintainability**: Clear structure makes it easy to locate and modify features

## Role-Based Access Control

The application implements multi-layered security for role-based access:

### 1. **Route Guards**

**Authentication Guard** (`authGuard`)
- Protects all authenticated routes
- Redirects unauthenticated users to login page
- Preserves the return URL for post-login redirect

**Role Guard** (`roleGuard`)
- Validates user roles before route activation
- Accepts an array of allowed roles
- Redirects unauthorized users to `/unauthorized` page

Example usage in routing:
```typescript
{
  path: 'member',
  loadChildren: () => import('./modules/member/member-module').then(m => m.MemberModule),
  canActivate: [authGuard, roleGuard([ERole.ROLE_USER])],
  data: { roles: [ERole.ROLE_USER] }
}
```

### 2. **HTTP Interceptors**

**JWT Interceptor** (`jwtInterceptor`)
- Automatically attaches JWT token to outgoing HTTP requests
- Excludes authentication endpoints to prevent token loops

**Error Interceptor** (`errorInterceptor`)
- Centralized error handling
- Manages HTTP error responses
- Handles authentication failures

### 3. **Directive-Based Access Control**

**HasRole Directive** (`*appHasRole`)
- Controls UI element visibility based on user roles
- Reactive updates when user role changes
- Usage: `<div *appHasRole="['ROLE_ADMIN']">Admin Only Content</div>`

## User Roles and Modules

### 1. **Member Module** (`ROLE_USER`)

**Purpose**: Serves insurance policy holders (customers)

**Key Features**:
- **Dashboard**: View active policies with coverage details
- **Raise Claims**: Submit new insurance claims with document upload
- **Claim History**: Track claim status and history
- **Analytics**: Visualize policy and claim statistics
- **Document Management**: Upload and manage policy-related documents

**Routes**:
- `/member/dashboard` - Overview of user's policies
- `/member/claim/new/:id` - Claim submission form
- `/member/claims` - Claim history table
- `/member/analytics` - Visual analytics dashboard
- `/member/documents` - Document management

**Components**:
- `PolicyCard` - Displays policy information
- `ClaimHistoryTable` - Lists user's claims with filters
- `ClaimForm` - Claim submission form

### 2. **Admin Module** (`ROLE_ADMIN`)

**Purpose**: System administration and insurance plan management

**Key Features**:
- **Dashboard**: Manage insurance plans (create, update, delete)
- **Plan Creation**: Design new insurance products with coverage and premium settings
- **Analytics**: System-wide statistics and metrics
- **Hospital Management**: Approve and manage network hospitals

**Routes**:
- `/admin/dashboard` - Insurance plan management
- `/admin/analytics` - Administrative analytics

**Components**:
- `PlanForm` - Create/edit insurance plans
- Plan listing with CRUD operations

**Responsibilities**:
- Define insurance plans with coverage amounts and premiums
- Manage system-wide configurations
- Oversee platform operations

### 3. **Agent Module** (`ROLE_AGENT`)

**Purpose**: Insurance sales representatives who onboard new customers

**Key Features**:
- **Dashboard**: View agent's sales performance and policy portfolio
- **New Sale**: Register new customers and enroll them in insurance plans
- **Customer Finder**: Search and verify customer information
- **Policy Enrollment**: Create policies for customers

**Routes**:
- `/agent/dashboard` - Agent's sales dashboard
- `/agent/sale/new` - New customer registration and policy sale

**Components**:
- `CustomerFinder` - Search existing users or register new ones
- `AgentPlanTable` - Display available plans for enrollment

**Responsibilities**:
- Register new users in the system
- Sell insurance policies to customers
- Track commission and sales metrics

### 4. **Claims Officer Module** (`ROLE_CLAIMS_OFFICER`)

**Purpose**: Process and adjudicate insurance claims

**Key Features**:
- **Dashboard**: Queue of pending claims requiring review
- **Claim Details**: Detailed view of individual claims with documents
- **Claim Approval**: Approve claims with approved amounts and comments
- **Claim Rejection**: Reject invalid claims with rejection reasons
- **Approved Claims**: History of approved claims
- **Rejected Claims**: Archive of rejected claims
- **Analytics**: Claims processing metrics and trends

**Routes**:
- `/claims/dashboard` - Pending claims queue
- `/claims/details/:id` - Claim detail view
- `/claims/approved` - Approved claims list
- `/claims/rejected` - Rejected claims list
- `/claims/analytics` - Claims analytics

**Components**:
- `ClaimsTable` - Filterable table of claims
- Claim approval/rejection forms

**Responsibilities**:
- Review submitted claims
- Validate claim authenticity and policy coverage
- Approve or reject claims with appropriate amounts
- Ensure claims don't exceed policy coverage limits

### 5. **Provider Module** (`ROLE_PROVIDER`)

**Purpose**: Healthcare providers (hospitals, clinics) submitting claims on behalf of patients

**Key Features**:
- **Claim Submission**: Submit claims directly after treatment
- **Policy Finder**: Verify patient's insurance policy
- **Hospital Selector**: Select the treating hospital

**Routes**:
- `/provider/dashboard` - Claim submission interface

**Components**:
- `PolicyFinder` - Search patient policies by policy number
- `HospitalSelector` - Select hospital from network
- Claim submission form

**Responsibilities**:
- Submit claims for treatments provided
- Verify patient insurance coverage
- Provide treatment documentation

### 6. **Auth Module** (Public)

**Purpose**: User authentication and account management

**Key Features**:
- **Login**: JWT-based authentication
- **Registration**: New user account creation
- **Change Password**: Secure password updates

**Routes**:
- `/auth/login` - Login page
- `/auth/register` - User registration
- `/auth/change-password` - Password change form

**Components**:
- `LoginForm` - Email/password authentication
- `RegisterForm` - User registration with role selection
- `PasswordForm` - Change password form

### 7. **Public Module** (No authentication required)

**Purpose**: Publicly accessible information

**Key Features**:
- **Plan Search**: Browse available insurance plans
- **Hospital Search**: Find network hospitals

**Routes**:
- `/public/plans` - Insurance plan catalog
- `/public/hospitals` - Network hospital directory

**Components**:
- `PlanCard` - Display plan details
- `HospitalCard` - Show hospital information

## Core Features

### Authentication and Authorization

**Authentication Service** (`Auth`)
- JWT token management with localStorage
- Token decoding and user extraction
- Observable user state (`user$`)
- Role checking methods
- User lookup by email

### API Communication

**API Service** (`Api`)
- Centralized HTTP client wrapper
- Base URL configuration from environment
- Generic CRUD methods (`get`, `post`, `put`, `delete`)
- Type-safe responses

### Domain Services

**Policy Service** (`Policy`)
- Manage insurance plans (CRUD)
- Retrieve user policies
- Agent policy tracking
- Policy enrollment

**Claim Service** (`Claim`)
- Submit claims (member and provider sources)
- Update claim status (approve/reject)
- Retrieve claims by user, policy, or status
- Claim statistics

**Hospital Service** (`Hospital`)
- Add and manage hospitals
- Network hospital filtering
- Hospital search functionality

**Member Document Service** (`MemberDocument`)
- Upload policy documents
- Retrieve user documents
- Document URL management

### Data Models

All data models are strongly typed with TypeScript interfaces:

**User Model** (`IUser`)
- User roles: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PROVIDER`, `ROLE_AGENT`, `ROLE_CLAIMS_OFFICER`

**Policy Model** (`IPolicy`)
- Status: `ACTIVE`, `EXPIRED`, `CANCELLED`
- Links to user, agent, and insurance plan

**Claim Model** (`IClaim`)
- Status: `SUBMITTED`, `IN_REVIEW`, `APPROVED`, `REJECTED`
- Submission source: `MEMBER`, `PROVIDER`
- Approval amounts and rejection reasons

**Hospital Model** (`IHospital`)
- Network hospital designation
- Contact information

### Shared Components

**Header** - Application-wide navigation with role-based menu items

**Sidebar** - Collapsible navigation for authenticated users

**Footer** - Application footer with links

**Document Upload** - File upload component for claim documents

**Dialog Components**:
- `ConfirmDialog` - Confirmation prompts
- `AlertDialog` - Alert messages
- `PromptDialog` - User input dialogs

## Project Structure

```
insurance-frontend-repo/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts              # Authentication guard
│   │   │   │   └── role.guard.ts              # Role-based authorization guard
│   │   │   ├── interceptors/
│   │   │   │   ├── jwt.interceptor.ts         # JWT token injection
│   │   │   │   └── error.interceptor.ts       # Global error handling
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts              # User and role definitions
│   │   │   │   ├── policy.model.ts            # Policy and plan models
│   │   │   │   ├── claim.model.ts             # Claim models
│   │   │   │   ├── hospital.model.ts          # Hospital models
│   │   │   │   └── member-document.model.ts   # Document models
│   │   │   └── services/
│   │   │       ├── api/api.ts                 # HTTP client wrapper
│   │   │       ├── auth/auth.ts               # Authentication service
│   │   │       ├── policy/policy.ts           # Policy service
│   │   │       ├── claim/claim.ts             # Claim service
│   │   │       ├── hospital/hospital.ts       # Hospital service
│   │   │       ├── admin/admin.ts             # Admin service
│   │   │       ├── member-document/           # Document service
│   │   │       └── dialog/dialog.ts           # Dialog service
│   │   ├── modules/
│   │   │   ├── admin/                         # Admin module
│   │   │   ├── agent/                         # Agent module
│   │   │   ├── auth/                          # Authentication module
│   │   │   ├── claims-officer/                # Claims officer module
│   │   │   ├── member/                        # Member module
│   │   │   ├── provider/                      # Provider module
│   │   │   └── public/                        # Public module
│   │   ├── shared/
│   │   │   ├── components/                    # Shared components
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── footer/
│   │   │   │   ├── landing/
│   │   │   │   ├── document-upload/
│   │   │   │   ├── claim-form/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   ├── alert-dialog/
│   │   │   │   ├── prompt-dialog/
│   │   │   │   └── unauthorized/
│   │   │   └── directives/
│   │   │       └── has-role.ts                # Role-based visibility directive
│   │   ├── environment/
│   │   │   └── environment.ts                 # Environment configuration
│   │   ├── app.config.ts                      # Application configuration
│   │   ├── app.routes.ts                      # Root routing configuration
│   │   └── app.ts                             # Root component
│   ├── main.ts                                # Application entry point
│   ├── styles.css                             # Global styles
│   └── index.html                             # HTML template
├── angular.json                               # Angular CLI configuration
├── package.json                               # Dependencies
├── tsconfig.json                              # TypeScript configuration
├── tailwind.config.js                         # Tailwind CSS configuration
└── README.md                                  # This file
```

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v11.5.1 or higher)
- Angular CLI (v21.0.3 or higher)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/tanmaydhelia/insurance-frontend-repo.git
   cd insurance-frontend-repo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Update the API URL in `src/app/environment/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:9000'  // Your backend API URL
   };
   ```

4. **Start development server**
   ```bash
   npm start
   # or
   ng serve
   ```

5. **Access the application**
   
   Open your browser and navigate to `http://localhost:4200/`

### Backend Integration

This frontend application requires a compatible backend API. Ensure your backend:
- Runs on the configured API URL (default: `http://localhost:9000`)
- Provides JWT-based authentication at `/auth/token`
- Supports the defined API endpoints for policies, claims, hospitals, etc.
- Returns JWT tokens with user information including `userId`, `username`, `email`, and `roles`

## Development

### Development Server

To start a local development server:

```bash
ng serve
```

The application will automatically reload when you modify source files.

### Code Scaffolding

Generate new components, services, or modules:

```bash
# Generate a component
ng generate component component-name

# Generate a service
ng generate service service-name

# Generate a module
ng generate module module-name
```

For a complete list of available schematics:

```bash
ng generate --help
```

### Coding Guidelines

1. **Component Structure**
   - Use standalone components where possible
   - Separate smart (container) components from presentational components
   - Place smart components in `container/` folders
   - Place page components in `pages/` folders

2. **Services**
   - Use `providedIn: 'root'` for singleton services
   - Inject services via constructor or `inject()` function
   - Keep services focused on single responsibilities

3. **Routing**
   - Use lazy loading for feature modules
   - Apply guards at module level for role-based access
   - Use route parameters for dynamic data

4. **State Management**
   - Use RxJS observables for asynchronous data
   - Convert to signals using `toSignal()` for template reactivity
   - Use `BehaviorSubject` for shared state

## Build and Test

### Building

Build the project for production:

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory. The production build is optimized for performance.

### Testing

Execute unit tests with Vitest:

```bash
ng test
```

### Code Quality

Format code with Prettier (configured in `package.json`):

```bash
npm run format  # If configured
```

## Additional Features

### Lazy Loading

All feature modules are lazy-loaded to improve initial load performance:

```typescript
{
  path: 'member',
  loadChildren: () => import('./modules/member/member-module').then(m => m.MemberModule)
}
```

### Responsive Design

- Built with Tailwind CSS for mobile-first responsive design
- Adapts to various screen sizes
- Mobile-optimized navigation

### Error Handling

- Global error interceptor for HTTP errors
- User-friendly error messages via dialog service
- Graceful fallbacks for failed API requests

### Security Features

- XSS protection through Angular's built-in sanitization
- CSRF protection (when configured with backend)
- Secure JWT token storage
- Automatic token expiration handling

## Contributing

When contributing to this project:

1. Follow the established folder structure
2. Maintain the separation between smart and presentational components
3. Write unit tests for new features
4. Update this README for significant architectural changes
5. Ensure all guards and interceptors are properly configured

## License

This project is part of an insurance management system implementation.

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [RxJS Documentation](https://rxjs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Angular Material Documentation](https://material.angular.io)
