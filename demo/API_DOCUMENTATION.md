# Ride Hailing System API Documentation

Base URL: `http://localhost:8080`

## Table of Contents
- [Authentication](#authentication)
- [Booking Types](#booking-types)
- [Users](#users)
- [Rides](#rides)
- [Drivers](#drivers)
- [Coupons](#coupons)
- [Support Tickets](#support-tickets)
- [Rates](#rates)

---

## Authentication

### Register
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "userName": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phoneNumber": "+84123456789",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "CUSTOMER",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "userName": "john_doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "CUSTOMER",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Logout
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Booking Types

### Get All Booking Types
**GET** `/api/booking-types`

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Xe máy giá rẻ",
    "code": "BIKE_CHEAP",
    "vehicleType": "MOTORBIKE",
    "baseFare": 8000,
    "pricePerKm": 3000,
    "pricePerMinute": 150,
    "description": "Xe máy tiết kiệm, phù hợp quãng đường ngắn",
    "active": true,
    "iconUrl": null
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Xe ô tô",
    "code": "CAR_STANDARD",
    "vehicleType": "CAR",
    "baseFare": 25000,
    "pricePerKm": 9000,
    "pricePerMinute": 400,
    "description": "Xe ô tô 4 chỗ thoải mái",
    "active": true,
    "iconUrl": null
  }
]
```

### Get Active Booking Types
**GET** `/api/booking-types/active`

**Response:** Same format as Get All

### Get Booking Type by ID
**GET** `/api/booking-types/{id}`

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Xe máy giá rẻ",
  "code": "BIKE_CHEAP",
  "vehicleType": "MOTORBIKE",
  "baseFare": 8000,
  "pricePerKm": 3000,
  "pricePerMinute": 150,
  "description": "Xe máy tiết kiệm",
  "active": true,
  "iconUrl": null
}
```

### Get Booking Types by Vehicle Type
**GET** `/api/booking-types/vehicle/{type}`

**Parameters:**
- `type`: MOTORBIKE or CAR

**Response:** Array of booking types

### Create Booking Type
**POST** `/api/booking-types`

**Request Body:**
```json
{
  "name": "Xe máy nhanh",
  "code": "BIKE_FAST",
  "vehicleType": "MOTORBIKE",
  "baseFare": 12000,
  "pricePerKm": 5000,
  "pricePerMinute": 250,
  "description": "Xe máy cao cấp, di chuyển nhanh chóng",
  "active": true,
  "iconUrl": "https://example.com/icon.png"
}
```

**Response:**
```json
{
  "id": "generated-uuid",
  "name": "Xe máy nhanh",
  "code": "BIKE_FAST",
  "vehicleType": "MOTORBIKE",
  "baseFare": 12000,
  "pricePerKm": 5000,
  "pricePerMinute": 250,
  "description": "Xe máy cao cấp, di chuyển nhanh chóng",
  "active": true,
  "iconUrl": "https://example.com/icon.png"
}
```

### Update Booking Type
**PUT** `/api/booking-types/{id}`

**Request Body:** Same as Create

**Response:** Updated booking type

### Delete Booking Type (Soft Delete)
**DELETE** `/api/booking-types/{id}`

**Response:** `204 No Content`

---

## Users

### Get User Profile
**GET** `/api/users/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userName": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "phoneNumber": "+84123456789",
  "role": "CUSTOMER",
  "accountStatus": "ACTIVE",
  "createdAt": 1674825600000
}
```

### Update User Profile
**PUT** `/api/users/{id}`

**Request Body:**
```json
{
  "fullName": "John Smith",
  "phoneNumber": "+84987654321",
  "email": "john.smith@example.com"
}
```

### Get All Users (Admin)
**GET** `/api/users`

**Response:** Array of users

### Change Password
**POST** `/api/users/change-password`

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

---

## Rides

### Create Ride
**POST** `/api/rides`

**Request Body:**
```json
{
  "customerId": "customer-uuid",
  "driverId": "driver-uuid",
  "startLocation": "123 Nguyen Hue, Da Nang",
  "endLocation": "456 Le Duan, Da Nang",
  "distance": 5200,
  "fare": 45000,
  "vehicleType": "BIKE",
  "status": "PENDING"
}
```

**Response:**
```json
{
  "id": "ride-uuid",
  "customer": {
    "id": "customer-uuid",
    "fullName": "John Doe"
  },
  "driver": {
    "id": "driver-uuid",
    "fullName": "Driver Name"
  },
  "startLocation": "123 Nguyen Hue, Da Nang",
  "endLocation": "456 Le Duan, Da Nang",
  "startTime": null,
  "endTime": null,
  "distance": 5200,
  "fare": 45000,
  "vehicleType": "BIKE",
  "status": "PENDING"
}
```

### Get Ride by ID
**GET** `/api/rides/{id}`

### Get All Rides
**GET** `/api/rides`

### Get Rides by Driver
**GET** `/api/rides/driver/{driverId}`

### Get Rides by Customer
**GET** `/api/rides/customer/{customerId}`

### Get Rides by User (Driver or Customer)
**GET** `/api/rides/user/{userId}`

### Update Ride
**PUT** `/api/rides/{id}`

**Request Body:** Same as Create

### Update Ride Status
**PATCH** `/api/rides/{rideId}/status`

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Status values:** `PENDING`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

---

## Drivers

### Register as Driver
**POST** `/api/drivers/register`

**Request Body:**
```json
{
  "userId": "user-uuid",
  "licenseNumber": "ABC123456",
  "vehicleType": "MOTORBIKE",
  "vehicleNumber": "59A-12345"
}
```

### Get Driver Profile
**GET** `/api/drivers/{id}`

### Get All Drivers
**GET** `/api/drivers`

### Update Driver
**PUT** `/api/drivers/{id}`

---

## Coupons

### Create Coupon
**POST** `/api/coupons`

**Request Body:**
```json
{
  "code": "WELCOME10",
  "discountPercent": 10,
  "maxDiscount": 50000,
  "minOrderValue": 20000,
  "validFrom": 1674825600000,
  "validTo": 1706361600000,
  "maxUsage": 100,
  "description": "Welcome discount 10%"
}
```

### Get Coupon by Code
**GET** `/api/coupons/code/{code}`

### Validate Coupon
**POST** `/api/coupons/validate`

**Request Body:**
```json
{
  "code": "WELCOME10",
  "orderValue": 100000
}
```

---

## Support Tickets

### Create Support Ticket
**POST** `/api/support-tickets`

**Request Body:**
```json
{
  "userId": "user-uuid",
  "subject": "Payment Issue",
  "description": "I was charged twice for the same ride",
  "category": "PAYMENT"
}
```

### Get All Tickets
**GET** `/api/support-tickets`

### Get Ticket by ID
**GET** `/api/support-tickets/{id}`

### Update Ticket Status
**PATCH** `/api/support-tickets/{id}/status`

**Request Body:**
```json
{
  "status": "RESOLVED"
}
```

**Status values:** `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

---

## Rates

### Create Rate
**POST** `/api/rates`

**Request Body:**
```json
{
  "rideId": "ride-uuid",
  "userId": "user-uuid",
  "rating": 5,
  "comment": "Excellent service!",
  "ratedUserId": "driver-uuid"
}
```

### Get Rate by ID
**GET** `/api/rates/{id}`

### Get Rates by Ride
**GET** `/api/rates/ride/{rideId}`

### Get Rates by User
**GET** `/api/rates/user/{userId}`

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "timestamp": "2024-01-20T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/booking-types"
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
