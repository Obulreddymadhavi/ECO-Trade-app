# EcoTrade API Endpoints

## Authentication Routes (`/api/auth`)

### POST /api/auth/login
Login user with email and password.
```json
{
  "email": "user@ecotrade.com",
  "password": "password123"
}
```

### POST /api/auth/register
Register a new user.
```json
{
  "email": "newuser@ecotrade.com",
  "password": "Password123",
  "fullName": "John Doe",
  "role": "customer",
  "phone": "+1 (555) 123-4567",
  "address": "123 Main St"
}
```

## User Routes (`/api/users`)

### GET /api/users/:userId
Get user profile information.

### PUT /api/users/:userId
Update user profile.
```json
{
  "fullName": "Jane Doe",
  "phone": "+1 (555) 987-6543",
  "address": "456 Oak Ave"
}
```

### GET /api/users/:userId/wallet
Get wallet balance and reward points.

### GET /api/users
Get all users (admin only).

## Waste Request Routes (`/api/waste-requests`)

### POST /api/waste-requests
Create a new waste request.
```json
{
  "userId": "cust-1",
  "userFullName": "Jane Doe",
  "userPhone": "+1 (555) 123-4567",
  "category": "E-Waste",
  "quantity": 1,
  "weight": 12.5,
  "wasteDescription": "Old computer parts",
  "pickupAddress": "123 Eco Way",
  "pickupDate": "2026-06-25"
}
```

### GET /api/waste-requests
Get all waste requests (with optional status filter).
Query: `?status=pending`

### GET /api/waste-requests/:requestId
Get specific waste request details.

### GET /api/waste-requests/user/:userId
Get all waste requests from a specific user.

### PUT /api/waste-requests/:requestId
Update waste request status.
```json
{
  "status": "accepted",
  "vendorId": "vend-1",
  "vendorBusinessName": "EcoCycle Solutions"
}
```

### DELETE /api/waste-requests/:requestId
Delete a waste request.

## Vendor Routes (`/api/vendors`)

### GET /api/vendors
Get all vendors.

### GET /api/vendors/:vendorId
Get vendor details.

### POST /api/vendors
Create a new vendor.
```json
{
  "businessName": "Green Recycling Co",
  "categories": ["Plastic", "Paper"],
  "lat": 40.7128,
  "lng": -74.0060,
  "rating": 4.5
}
```

### PUT /api/vendors/:vendorId
Update vendor information.

### GET /api/vendors/:vendorId/requests
Get all waste requests for a vendor.

## Transaction Routes (`/api/transactions`)

### POST /api/transactions
Create a new transaction.
```json
{
  "userId": "cust-1",
  "amount": 50.00,
  "type": "payout",
  "reference": "TX-REQ-001",
  "description": "Waste recycling payout"
}
```

### GET /api/transactions
Get all transactions.

### GET /api/transactions/:transactionId
Get specific transaction details.

### GET /api/transactions/user/:userId
Get user's transaction history.

## Notification Routes (`/api/notifications`)

### GET /api/notifications/user/:userId
Get user's notifications.

### POST /api/notifications
Create a notification.
```json
{
  "userId": "cust-1",
  "message": "Your waste request has been accepted",
  "type": "success"
}
```

### PUT /api/notifications/:notificationId/read
Mark notification as read.

### PUT /api/notifications/user/:userId/read-all
Mark all notifications as read for a user.

### DELETE /api/notifications/:notificationId
Delete a notification.

## Reward Routes (`/api/rewards`)

### GET /api/rewards/items
Get all available reward items.

### GET /api/rewards/items/:rewardId
Get specific reward item.

### POST /api/rewards/redeem
Redeem a reward using points.
```json
{
  "userId": "cust-1",
  "rewardId": "reward-1"
}
```

## AI Classification Routes (`/api/ai-classification`)

### GET /api/ai-classification/categories
Get all waste categories with pricing.

### POST /api/ai-classification/classify
Classify waste from an image.
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {...}
}
```

## Sample Credentials

- **Customer**: 
  - Email: customer@ecotrade.com
  - Password: password123
  - User ID: cust-1

- **Vendor**:
  - Email: vendor@ecotrade.com
  - Password: password123
  - User ID: vend-1

- **Admin**:
  - Email: admin@ecotrade.com
  - Password: password123
  - User ID: admin-1

## Query Parameters

- `status`: Filter by status (pending, accepted, completed, rejected)
- `userId`: Filter by user ID
- `vendorId`: Filter by vendor ID

## Headers

- `Content-Type: application/json`
- `Authorization: Bearer <userId>:<token>` (optional, can use userId in body/query)
