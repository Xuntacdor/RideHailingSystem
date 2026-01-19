# Angular Folder Structure

This document describes the Angular folder structure for the RideHailingSystem frontend application.

## Directory Structure

```
fe/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable standalone components (not feature-specific)
│   │   ├── core/                # Core module - singleton services, guards, interceptors
│   │   │   ├── services/        # Core services (auth, http, storage, etc.)
│   │   │   ├── guards/          # Route guards (auth, role, etc.)
│   │   │   ├── interceptors/    # HTTP interceptors
│   │   │   ├── models/          # Core data models and interfaces
│   │   │   └── constants/       # App-wide constants
│   │   ├── features/            # Feature modules organized by business domain
│   │   │   ├── auth/            # Authentication feature
│   │   │   ├── driver/          # Driver-specific features
│   │   │   ├── passenger/       # Passenger-specific features
│   │   │   ├── ride/            # Ride management features
│   │   │   └── admin/           # Admin panel features
│   │   ├── layouts/             # Layout components (header, footer, sidebar)
│   │   ├── shared/              # Shared module - shared across features
│   │   │   ├── components/      # Shared UI components (buttons, cards, modals)
│   │   │   ├── directives/      # Custom directives
│   │   │   ├── pipes/           # Custom pipes
│   │   │   └── models/          # Shared interfaces and types
│   │   ├── services/            # App-level services (non-core)
│   │   ├── models/              # App-level models
│   │   ├── guards/              # App-level guards
│   │   ├── interceptors/        # App-level interceptors
│   │   ├── pipes/               # App-level pipes
│   │   ├── directives/          # App-level directives
│   │   ├── app.ts               # Root component
│   │   ├── app.html             # Root template
│   │   ├── app.css              # Root styles
│   │   ├── app.config.ts        # App configuration
│   │   └── app.routes.ts        # App routing configuration
│   ├── assets/                  # Static assets
│   │   ├── images/              # Image files
│   │   ├── icons/               # Icon files
│   │   ├── fonts/               # Custom fonts
│   │   └── styles/              # Global styles (themes, variables)
│   ├── environments/            # Environment-specific configurations
│   │   ├── environment.ts       # Development environment
│   │   └── environment.prod.ts  # Production environment
│   ├── index.html               # Main HTML file
│   ├── main.ts                  # Application entry point
│   └── styles.css               # Global styles
├── public/                      # Public assets
├── angular.json                 # Angular CLI configuration
├── package.json                 # NPM dependencies
└── tsconfig.json                # TypeScript configuration
```

## Folder Purposes

### `/app/core/`
- **Purpose**: Contains singleton services and app-wide components that should only be loaded once
- **Examples**: Authentication service, HTTP interceptors, auth guards
- **Rule**: Import CoreModule ONLY in AppModule

### `/app/shared/`
- **Purpose**: Contains reusable components, directives, and pipes used across multiple features
- **Examples**: Custom buttons, form components, data formatting pipes
- **Rule**: Can be imported in any feature module

### `/app/features/`
- **Purpose**: Feature modules organized by business domain
- **Examples**: Authentication, Driver management, Passenger management, Ride booking
- **Structure**: Each feature should have its own components, services, and routing

### `/app/layouts/`
- **Purpose**: Layout components that define the structure of pages
- **Examples**: Header, Footer, Sidebar, Navigation, Main layout containers

### `/app/components/`
- **Purpose**: Standalone reusable components that don't belong to a specific feature
- **Examples**: Dashboard widgets, utility components

## Best Practices

1. **Feature Modules**: Organize code by feature/domain rather than by type
2. **Lazy Loading**: Use lazy loading for feature modules to improve performance
3. **Barrel Exports**: Use index.ts files to create clean import paths
4. **Naming Conventions**: 
   - Components: `component-name.component.ts`
   - Services: `service-name.service.ts`
   - Guards: `guard-name.guard.ts`
   - Pipes: `pipe-name.pipe.ts`
5. **Single Responsibility**: Each file should have a single purpose
6. **DRY Principle**: Don't repeat yourself - use shared components and services

## Example Feature Module Structure

```
features/ride/
├── components/
│   ├── ride-list/
│   ├── ride-details/
│   └── ride-booking/
├── services/
│   └── ride.service.ts
├── models/
│   └── ride.model.ts
├── ride.routes.ts
└── index.ts
```

## Getting Started

To create a new component in the appropriate location:
```bash
ng generate component features/ride/components/ride-list
```

To create a new service:
```bash
ng generate service core/services/auth
```

To create a new guard:
```bash
ng generate guard core/guards/auth
```
