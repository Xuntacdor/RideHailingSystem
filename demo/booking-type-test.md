# BookingType API Test Commands

## 1. Create Booking Types

### Xe máy giá rẻ (BIKE_CHEAP)
```bash
curl -X POST http://localhost:8080/api/booking-types \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BIKE_CHEAP",
    "name": "Xe máy giá rẻ",
    "vehicleType": "MOTORBIKE",
    "baseFare": 8000,
    "pricePerKm": 3000,
    "pricePerMinute": 150,
    "description": "Xe máy tiết kiệm, phù hợp quãng đường ngắn",
    "active": true
  }'
```

### Xe máy thường (BIKE_STANDARD)
```bash
curl -X POST http://localhost:8080/api/booking-types \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BIKE_STANDARD",
    "name": "Xe máy thường",
    "vehicleType": "MOTORBIKE",
    "baseFare": 10000,
    "pricePerKm": 4000,
    "pricePerMinute": 200,
    "description": "Xe máy tiêu chuẩn",
    "active": true
  }'
```

### Xe máy nhanh (BIKE_FAST)
```bash
curl -X POST http://localhost:8080/api/booking-types \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BIKE_FAST",
    "name": "Xe máy nhanh",
    "vehicleType": "MOTORBIKE",
    "baseFare": 12000,
    "pricePerKm": 5000,
    "pricePerMinute": 250,
    "description": "Xe máy cao cấp, di chuyển nhanh chóng",
    "active": true
  }'
```

### Xe ô tô thường (CAR_STANDARD)
```bash
curl -X POST http://localhost:8080/api/booking-types \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CAR_STANDARD",
    "name": "Xe ô tô",
    "vehicleType": "CAR",
    "baseFare": 25000,
    "pricePerKm": 9000,
    "pricePerMinute": 400,
    "description": "Xe ô tô 4 chỗ thoải mái",
    "active": true
  }'
```

### Xe ô tô cao cấp (CAR_PREMIUM)
```bash
curl -X POST http://localhost:8080/api/booking-types \
  -H "Content-Type": application/json" \
  -d '{
    "code": "CAR_PREMIUM",
    "name": "Xe ô tô cao cấp",
    "vehicleType": "CAR",
    "baseFare": 35000,
    "pricePerKm": 12000,
    "pricePerMinute": 500,
    "description": "Xe ô tô cao cấp, dịch vụ premium",
    "active": true
  }'
```

## 2. Get All Booking Types
```bash
curl -X GET http://localhost:8080/api/booking-types
```

## 3. Get Active Booking Types Only
```bash
curl -X GET http://localhost:8080/api/booking-types/active
```

## 4. Get Booking Types by Vehicle Type
```bash
# Get all MOTORBIKE types
curl -X GET http://localhost:8080/api/booking-types/vehicle/MOTORBIKE

# Get all CAR types
curl -X GET http://localhost:8080/api/booking-types/vehicle/CAR
```

## 5. Update a Booking Type (Example)
```bash
curl -X PUT http://localhost:8080/api/booking-types/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BIKE_CHEAP",
    "name": "Xe máy giá rẻ",
    "vehicleType": "MOTORBIKE",
    "baseFare": 9000,
    "pricePerKm": 3500,
    "pricePerMinute": 180,
    "description": "Xe máy tiết kiệm - Giá mới",
    "active": true
  }'
```

## 6. Delete (Soft Delete) a Booking Type
```bash
curl -X DELETE http://localhost:8080/api/booking-types/{id}
```

---

## PowerShell Commands (Windows)

### Create BIKE_CHEAP
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/booking-types" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{
  "code": "BIKE_CHEAP",
  "name": "Xe máy giá rẻ",
  "vehicleType": "MOTORBIKE",
  "baseFare": 8000,
  "pricePerKm": 3000,
  "pricePerMinute": 150,
  "description": "Xe máy tiết kiệm",
  "active": true
}'
```

### Get All Booking Types
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/booking-types" -Method GET
```
