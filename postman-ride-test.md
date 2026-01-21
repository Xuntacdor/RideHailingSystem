# Postman Test Request for Create Ride Endpoint

## Endpoint Information
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/rides`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer YOUR_JWT_TOKEN_HERE (if authentication is enabled)
  ```

## Request Body

### Example 1: Motorbike Ride Request
```json
{
  "customerId": "your-customer-user-id-here",
  "startLocation": "Nguyễn Văn Linh, Đà Nẵng",
  "endLocation": "Bãi biển Mỹ Khê, Đà Nẵng",
  "customerLatitude": 16.0544,
  "customerLongitude": 108.2022,
  "distance": 5000,
  "fare": 25000,
  "vehicleType": "MOTORBIKE",
  "startTime": 1737435917000
}
```

### Example 2: Car Ride Request
```json
{
  "customerId": "your-customer-user-id-here",
  "startLocation": "Sân bay Đà Nẵng",
  "endLocation": "Hội An Ancient Town",
  "customerLatitude": 16.0544,
  "customerLongitude": 108.2022,
  "distance": 25000,
  "fare": 350000,
  "vehicleType": "CAR",
  "startTime": 1737435917000
}
```

## Field Descriptions
- `customerId` (required): User ID of the customer booking the ride
- `driverId` (optional): Can be omitted - backend will find drivers automatically
- `startLocation` (required): Pickup location name
- `endLocation` (required): Drop-off location name
- `customerLatitude` (required): Latitude of pickup location
- `customerLongitude` (required): Longitude of pickup location
- `distance` (required): Distance in meters (Long/integer)
- `fare` (required): Fare amount in VND (Long/integer)
- `vehicleType` (required): Either "MOTORBIKE" or "CAR"
- `startTime` (optional): Unix timestamp in milliseconds
- `endTime` (optional): Unix timestamp in milliseconds
- `status` (optional): Can be omitted

## Expected Response

### Success Response (200 OK)
```json
{
  "rideRequestId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING",
  "message": "Finding driver...",
  "nearestDriversCount": 3
}
```

### Error Response (if no drivers available)
```json
{
  "timestamp": "2026-01-21T03:25:00.000Z",
  "status": 404,
  "error": "Not Found",
  "message": "No available drivers found",
  "path": "/api/rides"
}
```

## Important Notes

⚠️ **If you get "No available drivers found"**, you need to:

1. Create a driver user account
2. Ensure the driver has `latitude` and `longitude` set in the database
3. Make sure the driver status is `AVAILABLE`

### Create Mock Driver (SQL)
```sql
-- Create a user with DRIVER role
INSERT INTO user (id, email, password, first_name, last_name, phone_number, role, account_status, created_at, updated_at)
VALUES ('driver-id-123', 'driver@test.com', 'hashed-password', 'John', 'Driver', '0901234567', 'DRIVER', 'ACTIVE', NOW(), NOW());

-- Create driver profile with location
INSERT INTO driver (id, user_id, license_number, license_expiry, status, rating, total_rides, latitude, longitude, created_at, updated_at)
VALUES ('driver-profile-123', 'driver-id-123', 'DL123456789', '2025-12-31', 'AVAILABLE', 5.0, 0, 16.0544, 108.2022, NOW(), NOW());
```

## Testing Without Authentication

If you commented out `/api/rides/**` from the public endpoints, you'll need to either:
1. Uncomment it in `SecurityConfig.java`, OR
2. Add a valid JWT token to the Authorization header

## Getting a Customer ID

To get a valid customer ID for testing:
1. Register a user via `/api/auth/register`
2. Login via `/api/auth/login` to get your user ID from the token
3. Use that ID as the `customerId` in your ride request
