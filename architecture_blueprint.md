# Highway Emergency Fuel Delivery - System Architecture and Product Blueprint

## 1. User Roles
- **Customer**: A standard user stranded on the highway or in need of emergency fuel. They can request fuel, track delivery in real-time, and make payments.
- **Delivery Agent (Driver)**: The personnel driving the fuel truck. They can accept/reject ride requests, navigate to the customer, and update order status (e.g., Arrived, Fueling, Completed).
- **Admin / Dispatcher**: Operations manager who oversees all active requests, manages drivers, monitors fuel inventory, and handles customer support and disputes.

## 2. Final Sitemap & Routing Structure

### Public Routes
- `/` - Home/Landing Page
- `/about` - About Us
- `/contact` - Contact & Support
- `/login` - Universal Login
- `/register` - Customer Registration
- `/driver/apply` - Driver Application Page

### Customer Portal (Protected: `role=customer`)
- `/dashboard` - Overview of recent activity, quick "Request Fuel" CTA
- `/request` - Multi-step form (Location, Fuel Type, Quantity, Payment)
- `/track/[orderId]` - Real-time map tracking of the delivery truck
- `/history` - Past orders and receipts
- `/settings` - Profile, vehicle details, payment methods

### Driver Portal (Protected: `role=driver`)
- `/driver/dashboard` - Active status toggle, current assigned order
- `/driver/requests` - Incoming requests pool
- `/driver/active/[orderId]` - Navigation view, customer details, status updates
- `/driver/history` - Completed deliveries and earnings
- `/driver/settings` - Truck details, profile

### Admin Portal (Protected: `role=admin`)
- `/admin/dashboard` - Metrics (Live orders, available drivers, revenue today)
- `/admin/orders` - Master list of all orders with filtering
- `/admin/users` - Manage customers and drivers
- `/admin/inventory` - Monitor fuel stock per depot/truck
- `/admin/reports` - Analytics and financial reports

## 3. Page Responsibilities

- **Landing Page**: Drive conversions. Clear value proposition, "How it Works," and urgent "Get Fuel Now" action.
- **Request Flow**: Heavily relies on map integration (Google Maps/Mapbox) for accurate GPS pinging. Must automatically detect the highway and mile marker if possible.
- **Tracking Page**: High-frequency real-time updates via WebSockets. Shows ETA, driver info, and a chat/call button.
- **Driver Active Order Page**: Optimized for mobile use in a vehicle. Large buttons for safety, integrated turn-by-turn navigation.
- **Admin Dashboard**: Data-dense view. Real-time map of all moving trucks and waiting customers.

## 4. Frontend Architecture (Next.js)

- **Framework**: Next.js (App Router for Server Components and layouts)
- **Language**: TypeScript for type safety across API boundaries
- **State Management**: Zustand (Global UI state, Modals, User Session)
- **Data Fetching**: React Query (@tanstack/react-query) for caching and server-state management.
- **Styling**: Tailwind CSS + shadcn/ui for rapid, accessible component development.
- **Real-Time Layer**: Socket.io-client to listen for driver location updates and order status changes.
- **Maps**: `@react-google-maps/api` or `react-map-gl` (Mapbox).

## 5. Backend API Plan (Node.js)

- **Framework**: Node.js with Express.js
- **Language**: TypeScript
- **Architecture Pattern**: Controller-Service-Repository (Layered Architecture)
- **Authentication**: JWT (JSON Web Tokens) with short-lived access tokens and httpOnly refresh tokens.
- **Real-time Services**: Socket.io server. Drivers emit location; Server broadcasts to specific room (`order_[id]`).

### Core REST Endpoints
**Auth Users (`/api/auth`)**:
- `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`

**Orders (`/api/orders`)**:
- `POST /` - Create new fuel request
- `GET /` - List orders (with role-based filtering)
- `GET /:id` - Get order details
- `PATCH /:id/status` - Update order status (Driver/Admin)
- `PATCH /:id/location` - Update live destination location (Customer)

**Drivers (`/api/drivers`)**:
- `GET /nearby` - Geospatial query to find closest available drivers
- `PUT /status` - Go online/offline

## 6. MongoDB Collections

**1. Users**
- `_id`, `name`, `email`, `passwordHash`, `role` (enum: customer, driver, admin), `phone`, `createdAt`
- (If Driver): `licenseNumber`, `isOnline`, `currentLocation` (GeoJSON Point), `truckId`

**2. Vehicles (Trucks)**
- `_id`, `plateNumber`, `capacity`, `currentStock` (Gasoline/Diesel split), `assignedDriverId`

**3. Orders**
- `_id`, `customerId`, `driverId` (nullable initially), `status` (pending, accepted, en-route, arrived, fueling, completed, cancelled)
- `fuelType`, `quantityGallons`, `totalPrice`
- `customerLocation` (GeoJSON Point), `deliveryAddress` (highway marker details)
- `timestamps` (requestedAt, acceptedAt, completedAt)

**4. Payments**
- `_id`, `orderId`, `customerId`, `amount`, `currency`, `providerTxId` (e.g., Stripe PaymentIntent ID), `status` (pending, succeeded, failed)

## 7. Scalable Folder Structure

We recommend maintaining distinct `frontend` and `backend` directories for clean deployment and dependency management.

```text
highway-fuel-app/
├── frontend/                     # Next.js App
│   ├── src/
│   │   ├── app/                  # Next.js App Router (Pages & Layouts)
│   │   │   ├── (auth)/           # Grouped auth routes
│   │   │   ├── (customer)/       # Grouped customer routes
│   │   │   ├── (driver)/         # Grouped driver routes
│   │   │   ├── admin/            # Admin routes
│   │   │   ├── api/              # Next.js API routes (BFF pattern if needed)
│   │   │   └── layout.tsx
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ui/               # Base elements (buttons, inputs)
│   │   │   ├── map/              # Map-related components
│   │   │   └── forms/            # Complex form components
│   │   ├── hooks/                # Custom React hooks (e.g., useSocket, useGeolocation)
│   │   ├── lib/                  # Utilities (axios instance, formatting)
│   │   ├── store/                # Zustand stores
│   │   └── types/                # TypeScript interfaces
│   ├── public/                   # Static assets (images, icons)
│   ├── tailwind.config.ts
│   └── package.json
│
└── backend/                      # Node.js + Express
    ├── src/
    │   ├── config/               # DB connection, env variables validation
    │   ├── controllers/          # Request handlers
    │   ├── middlewares/          # Auth guards, error handlers, rate limiting
    │   ├── models/               # Mongoose schemas
    │   ├── routes/               # API endpoint definitions
    │   ├── services/             # Business logic (e.g., matching algorithm)
    │   ├── sockets/              # Socket.io event handlers
    │   ├── utils/                # Helper functions (hashing, geo-math)
    │   └── app.ts                # Express app setup
    ├── tests/                    # Unit and integration tests
    ├── .env
    └── package.json
```
