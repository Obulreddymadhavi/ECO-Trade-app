# EcoTrade Backend Documentation

## Overview

The EcoTrade backend is built with **Express.js**, **TypeScript**, and **SQLite** (via better-sqlite3). It provides a complete REST API for the waste recycling and environmental trading platform.

## Project Structure

```
src/
├── routes/              # API route handlers
│   ├── auth.ts         # Authentication routes
│   ├── users.ts        # User profile routes
│   ├── waste-requests.ts
│   ├── vendors.ts
│   ├── transactions.ts
│   ├── notifications.ts
│   ├── rewards.ts
│   ├── ai-classification.ts
│   └── bank-accounts.ts
├── controllers/        # Business logic
│   ├── user-controller.ts
│   ├── waste-controller.ts
│   └── vendor-controller.ts
├── middleware/         # Express middleware
│   ├── auth.ts        # Authentication & RBAC
│   ├── error-handler.ts
│   └── logger.ts
├── utils/             # Helper functions
│   ├── database.ts    # Database initialization
│   ├── helpers.ts     # General utilities
│   └── validation.ts  # Input validation
├── types.ts           # TypeScript interfaces
├── api-endpoints.md   # API documentation
└── config/            # Configuration files

.data/
├── ecotrade.sqlite    # SQLite database file
└── db.json           # JSON backup (legacy)

server.ts             # Main Express server
database.ts           # Database setup (legacy, kept for reference)
```

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install SQLite driver** (if not already installed):
   ```bash
   npm install better-sqlite3
   ```

3. **Configure environment variables**:
   Create `.env` file with:
   ```
   PORT=3000
   GEMINI_API_KEY=your_api_key_here
   NODE_ENV=development
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` and automatically initialize the database.

## API Architecture

### Authentication Flow

- **Login/Register**: Users authenticate via email and password
- **Token-based**: Simple token format for development (production uses JWT)
- **Role-based Access Control (RBAC)**:
  - `customer`: Regular waste recycling users
  - `vendor`: Waste collection vendors
  - `admin`: Platform administrators

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,
  fullName TEXT,
  role TEXT,          -- 'customer', 'vendor', 'admin'
  phone TEXT,
  address TEXT,
  walletBalance REAL,
  rewardPoints INTEGER,
  createdDate TEXT
);
```

#### Waste Requests Table
```sql
CREATE TABLE waste_requests (
  id TEXT PRIMARY KEY,
  userId TEXT FOREIGN KEY,
  userFullName TEXT,
  userPhone TEXT,
  category TEXT,      -- E-Waste, Plastic, Metal, Paper, Glass, Organic
  quantity INTEGER,
  weight REAL,
  wasteDescription TEXT,
  imageUrl TEXT,
  pickupAddress TEXT,
  pickupDate TEXT,
  status TEXT,        -- pending, accepted, completed, rejected
  createdDate TEXT,
  estimatedPayout REAL,
  pointsAwarded INTEGER,
  vendorId TEXT FOREIGN KEY,
  vendorBusinessName TEXT
);
```

#### Vendors Table
```sql
CREATE TABLE vendors (
  id TEXT PRIMARY KEY,
  businessName TEXT,
  categories TEXT,    -- JSON array
  lat REAL,
  lng REAL,
  rating REAL
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  userId TEXT FOREIGN KEY,
  amount REAL,
  type TEXT,         -- deposit, payout, withdrawal, reward_redemption
  status TEXT,       -- pending, completed, failed
  reference TEXT,
  description TEXT,
  createdDate TEXT
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  userId TEXT FOREIGN KEY,
  message TEXT,
  type TEXT,         -- info, success, alert
  read INTEGER,      -- 0 or 1
  createdDate TEXT
);
```

#### Bank Accounts Table
```sql
CREATE TABLE bank_accounts (
  id TEXT PRIMARY KEY,
  userId TEXT FOREIGN KEY,
  bankName TEXT,
  accountHolder TEXT,
  accountNumber TEXT,      -- Masked
  rawAccountNumber TEXT,   -- Encrypted
  routingCode TEXT,
  isPrimary INTEGER,       -- 0 or 1
  createdDate TEXT
);
```

## Core Modules

### Authentication Module (`src/routes/auth.ts`)
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration

### Users Module (`src/routes/users.ts`)
- **GET** `/api/users/:userId` - Get user profile
- **PUT** `/api/users/:userId` - Update profile
- **GET** `/api/users/:userId/wallet` - Get wallet info

### Waste Requests Module (`src/routes/waste-requests.ts`)
- **POST** `/api/waste-requests` - Create waste request
- **GET** `/api/waste-requests` - Get all requests
- **GET** `/api/waste-requests/:requestId` - Get specific request
- **GET** `/api/waste-requests/user/:userId` - Get user's requests
- **PUT** `/api/waste-requests/:requestId` - Update request status
- **DELETE** `/api/waste-requests/:requestId` - Delete request

### Vendors Module (`src/routes/vendors.ts`)
- **GET** `/api/vendors` - Get all vendors
- **GET** `/api/vendors/:vendorId` - Get vendor details
- **POST** `/api/vendors` - Create new vendor
- **PUT** `/api/vendors/:vendorId` - Update vendor
- **GET** `/api/vendors/:vendorId/requests` - Get vendor's requests

### Transactions Module (`src/routes/transactions.ts`)
- **POST** `/api/transactions` - Create transaction
- **GET** `/api/transactions` - Get all transactions
- **GET** `/api/transactions/user/:userId` - Get user transactions

### Notifications Module (`src/routes/notifications.ts`)
- **GET** `/api/notifications/user/:userId` - Get user notifications
- **POST** `/api/notifications` - Create notification
- **PUT** `/api/notifications/:notificationId/read` - Mark as read

### Rewards Module (`src/routes/rewards.ts`)
- **GET** `/api/rewards/items` - Get available rewards
- **POST** `/api/rewards/redeem` - Redeem a reward

### AI Classification Module (`src/routes/ai-classification.ts`)
- **POST** `/api/ai-classification/classify` - Classify waste from image
- **GET** `/api/ai-classification/categories` - Get waste categories

## Middleware

### Authentication Middleware
```typescript
import { authMiddleware, requireRole } from "./src/middleware/auth.ts";

// Protected route (requires authentication)
app.get("/api/protected", authMiddleware, handler);

// Role-based protected route
app.post("/api/admin/action", authMiddleware, requireRole("admin"), handler);
```

### Error Handler Middleware
Centralized error handling with consistent response format:
```json
{
  "error": "Error message",
  "details": "Additional context",
  "stack": "Stack trace (development only)"
}
```

### Request Logger Middleware
Logs all incoming requests with method, path, status, and duration.

## Validation

Input validation utilities in `src/utils/validation.ts`:
- `validateEmail()` - Email format validation
- `validatePassword()` - Password strength validation
- `validatePhone()` - Phone number validation
- `validateWasteRequest()` - Waste request data validation
- `validateUser()` - User registration data validation
- `validateTransaction()` - Transaction data validation

## Controllers

### UserController
Business logic for user operations:
- `getUserById()` - Retrieve user by ID
- `createUser()` - Create new user with validation
- `updateUser()` - Update user profile
- `authenticateUser()` - Authenticate with email/password

### WasteController
Business logic for waste management:
- `createWasteRequest()` - Create request with validation
- `getWasteStats()` - Get user or platform statistics
- `updateWasteRequestStatus()` - Update request status

### VendorController
Business logic for vendor operations:
- `getAllVendors()` - Retrieve all vendors
- `createVendor()` - Register new vendor
- `getVendorStats()` - Get vendor performance stats

## Sample Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@ecotrade.com",
    "password": "SecurePass123",
    "fullName": "John Doe",
    "role": "customer",
    "phone": "+1 (555) 123-4567"
  }'
```

### Create Waste Request
```bash
curl -X POST http://localhost:3000/api/waste-requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "cust-1",
    "userFullName": "John Doe",
    "userPhone": "+1 (555) 123-4567",
    "category": "E-Waste",
    "weight": 12.5,
    "wasteDescription": "Old computer parts",
    "pickupAddress": "123 Main St",
    "pickupDate": "2026-06-25"
  }'
```

### Classify Waste with AI
```bash
curl -X POST http://localhost:3000/api/ai-classification/classify \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

## Development Notes

### Database Initialization
- Database is automatically created on first run
- SQLite file stored at `.data/ecotrade.sqlite`
- Sample data initialized automatically for testing

### AI Integration
- Uses Google Gemini API for image classification
- Requires `GEMINI_API_KEY` environment variable
- Falls back to mock classification if API key not provided

### Error Handling
All endpoints follow consistent error response format with proper HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### CORS
API accepts requests from all origins for development. Configure CORS headers in production.

## Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Environment Setup
```env
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_production_key
```

## Testing

Run tests with:
```bash
npm run test
```

Sample test credentials:
- **Customer**: customer@ecotrade.com / password123
- **Vendor**: vendor@ecotrade.com / password123
- **Admin**: admin@ecotrade.com / password123

## API Documentation

For complete API endpoint documentation, see [api-endpoints.md](./src/api-endpoints.md)

## Contributing

1. Follow TypeScript strict mode
2. Use controllers for business logic
3. Add validation for all inputs
4. Document new endpoints
5. Maintain consistent error handling

## License

Apache-2.0
