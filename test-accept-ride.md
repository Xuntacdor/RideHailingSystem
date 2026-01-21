# Test Driver Accept/Reject Ride

## Endpoint
**POST** `http://localhost:8080/api/rides/respond`

## Headers
```
Content-Type: application/json
```

## Request Body để ACCEPT chuyến xe

```json
{
    "rideRequestId": "550e8400-e29b-41d4-a716-446655440000",
    "driverId": "da4312b2-b20a-4041-8e23-ffd205f69c33",
    "accepted": true
}
```

## Request Body để REJECT chuyến xe

```json
{
    "rideRequestId": "550e8400-e29b-41d4-a716-446655440000",
    "driverId": "da4312b2-b20a-4041-8e23-ffd205f69c33",
    "accepted": false
}
```

## Response khi Accept

```json
{
    "success": true,
    "message": "Ride accepted"
}
```

## Response khi Reject

```json
{
    "success": true,
    "message": "Ride rejected"
}
```

## Flow Hoàn Chỉnh

### 1. Customer tạo ride
```bash
POST http://localhost:8080/api/rides
{
    "customerId": "customer-id",
    "startLocation": "A",
    "endLocation": "B",
    "customerLatitude": 16.0544,
    "customerLongitude": 108.2022,
    "distance": 5000,
    "fare": 25000,
    "vehicleType": "MOTORBIKE"
}
```

Response:
```json
{
    "rideRequestId": "abc-123",
    "status": "PENDING",
    "message": "Finding driver...",
    "nearestDriversCount": 3
}
```

### 2. Driver nhận WebSocket notification
Topic: `/topic/driver/{driverId}`
Message chứa `rideRequestId`

### 3. Driver accept hoặc reject
```bash
POST http://localhost:8080/api/rides/respond
{
    "rideRequestId": "abc-123",
    "driverId": "driver-id",
    "accepted": true
}
```

### 4. Khi Accept:
- Tạo Ride mới trong DB với status `CONFIRMED`
- Customer nhận WebSocket notification trên topic `/topic/customer/{customerId}`:
  ```json
  {
      "type": "RIDE_ACCEPTED",
      "driverId": "driver-id",
      "rideId": "ride-id-123"
  }
  ```

### 5. Khi Reject:
- Hệ thống tự động gửi notification cho driver tiếp theo trong danh sách
- Nếu hết driver, customer nhận notification `NO_DRIVER_AVAILABLE`

## Test Notes
- Lấy `rideRequestId` từ response của endpoint create ride
- Dùng đúng `driverId` mà bạn muốn test (driver phải có trong DB)
