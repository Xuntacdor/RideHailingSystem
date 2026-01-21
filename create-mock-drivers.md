# Tạo Mock Drivers cho Testing

## ⚠️ QUAN TRỌNG
DriverRequest không có field `latitude` và `longitude`, nên **PHẢI dùng SQL** để set location cho driver!

---

## ✅ Cách Nhanh Nhất: SQL Script

### Bước 1: Tạo Users với role DRIVER

```sql
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, account_status, created_at, updated_at)
VALUES 
('driver-user-1', 'driver1@test.com', '$2a$10$dummyHashedPassword1234567890', 'Nguyễn', 'Văn A', '0901234567', 'DRIVER', 'ACTIVE', NOW(), NOW()),
('driver-user-2', 'driver2@test.com', '$2a$10$dummyHashedPassword1234567890', 'Trần', 'Văn B', '0902345678', 'DRIVER', 'ACTIVE', NOW(), NOW()),
('driver-user-3', 'driver3@test.com', '$2a$10$dummyHashedPassword1234567890', 'Lê', 'Văn C', '0903456789', 'DRIVER', 'ACTIVE', NOW(), NOW());
```

### Bước 2: Tạo Driver Profiles với Location

```sql
INSERT INTO drivers (id, user_id, license_number, driver_status, address, rating, latitude, longitude)
VALUES 
('driver-id-1', 'driver-user-1', 'DL001234567', 'AVAILABLE', '123 Nguyễn Văn Linh, Đà Nẵng', 5.0, 16.0544, 108.2022),
('driver-id-2', 'driver-user-2', 'DL002345678', 'AVAILABLE', '456 Trần Phú, Đà Nẵng', 4.8, 16.0644, 108.2122),
('driver-id-3', 'driver-user-3', 'DL003456789', 'AVAILABLE', '789 Lê Duẩn, Đà Nẵng', 4.9, 16.0444, 108.1922);
```

---

## 🔧 Hoặc: Kết hợp API + SQL

### Bước 1: Tạo User qua API

**POST** `http://localhost:8080/api/auth/register`
```json
{
  "email": "driver1@test.com",
  "password": "password123",
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "phoneNumber": "0901234567"
}
```

Lưu `userId` từ response!

### Bước 2: Tạo Driver qua API

**POST** `http://localhost:8080/api/driver`
```json
{
  "userId": "YOUR_USER_ID_FROM_STEP_1",
  "licenseNumber": "DL001234567",
  "driverStatus": "AVAILABLE",
  "address": "123 Nguyễn Văn Linh, Đà Nẵng"
}
```

Lưu `driverId` từ response!

### Bước 3: Update Location bằng SQL

```sql
UPDATE drivers 
SET latitude = 16.0544, longitude = 108.2022, rating = 5.0
WHERE id = 'YOUR_DRIVER_ID_FROM_STEP_2';
```

---

## 📍 Tọa độ Đà Nẵng để Test

| Vị trí | Latitude | Longitude |
|--------|----------|-----------|
| Trung tâm Đà Nẵng | 16.0544 | 108.2022 |
| Bãi biển Mỹ Khê | 16.0400 | 108.2480 |
| Gần sân bay | 16.0544 | 108.1992 |
| Sơn Trà | 16.0644 | 108.2122 |
| Hải Châu | 16.0444 | 108.1922 |

---

## ✅ Verify Drivers

Sau khi tạo xong, test endpoint này:

**GET** `http://localhost:8080/api/driver/nearest?lat=16.0544&lng=108.2022&limit=10`

Response mong đợi:
```json
{
  "code": 200,
  "results": [
    {
      "id": "driver-id-1",
      "userId": "driver-user-1",
      "licenseNumber": "DL001234567",
      "status": "AVAILABLE",
      "rating": 5.0,
      "latitude": 16.0544,
      "longitude": 108.2022
    }
  ]
}
```

---

## 🚀 Quick Copy-Paste Script

```sql
-- All in one!
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, account_status, created_at, updated_at) VALUES 
('driver-user-1', 'driver1@test.com', '$2a$10$hash', 'Nguyễn', 'A', '0901111111', 'DRIVER', 'ACTIVE', NOW(), NOW()),
('driver-user-2', 'driver2@test.com', '$2a$10$hash', 'Trần', 'B', '0902222222', 'DRIVER', 'ACTIVE', NOW(), NOW()),
('driver-user-3', 'driver3@test.com', '$2a$10$hash', 'Lê', 'C', '0903333333', 'DRIVER', 'ACTIVE', NOW(), NOW());

INSERT INTO drivers (id, user_id, license_number, driver_status, address, rating, latitude, longitude) VALUES 
('driver-id-1', 'driver-user-1', 'DL001', 'AVAILABLE', 'Đà Nẵng', 5.0, 16.0544, 108.2022),
('driver-id-2', 'driver-user-2', 'DL002', 'AVAILABLE', 'Đà Nẵng', 4.8, 16.0644, 108.2122),
('driver-id-3', 'driver-user-3', 'DL003', 'AVAILABLE', 'Đà Nẵng', 4.9, 16.0444, 108.1922);
```

Copy script trên vào MySQL Workbench hoặc DBeaver và chạy là xong! 🎯


```sql
-- Tạo 3 users với role DRIVER
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, account_status, created_at, updated_at)
VALUES 
('driver-user-1', 'driver1@test.com', '$2a$10$8ZqQZ5Z5Z5Z5Z5Z5Z5Z5Z5', 'Nguyễn', 'Văn A', '0901234567', 'DRIVER', 'ACTIVE', NOW(), NOW()),
('driver-user-2', 'driver2@test.com', '$2a$10$8ZqQZ5Z5Z5Z5Z5Z5Z5Z5Z5', 'Trần', 'Văn B', '0902345678', 'DRIVER', 'ACTIVE', NOW(), NOW()),
('driver-user-3', 'driver3@test.com', '$2a$10$8ZqQZ5Z5Z5Z5Z5Z5Z5Z5Z5', 'Lê', 'Văn C', '0903456789', 'DRIVER', 'ACTIVE', NOW(), NOW());

-- Tạo driver profiles với location ở Đà Nẵng
INSERT INTO drivers (id, user_id, license_number, driver_status, address, rating, latitude, longitude)
VALUES 
('driver-id-1', 'driver-user-1', 'DL001234567', 'AVAILABLE', 'Đà Nẵng', 5.0, 16.0544, 108.2022),
('driver-id-2', 'driver-user-2', 'DL002345678', 'AVAILABLE', 'Đà Nẵng', 4.8, 16.0644, 108.2122),
('driver-id-3', 'driver-user-3', 'DL003456789', 'AVAILABLE', 'Đà Nẵng', 4.9, 16.0444, 108.1922);
```

## Cách 2: Sử dụng API (Recommend cho production)

### Bước 1: Tạo User trước (nếu chưa có)

**POST** `http://localhost:8080/api/auth/register`
```json
{
  "email": "driver1@test.com",
  "password": "password123",
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "phoneNumber": "0901234567"
}
```

### Bước 2: Tạo Driver Profile

**POST** `http://localhost:8080/api/driver`

Headers:
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN (nếu cần)
```

Body cho Driver 1:
```json
{
  "userId": "user-id-from-step-1",
  "licenseNumber": "DL001234567",
  "licenseExpiry": "2025-12-31"
}
```

Body cho Driver 2:
```json
{
  "userId": "user-id-2",
  "licenseNumber": "DL002345678",
  "licenseExpiry": "2025-12-31"
}
```

Body cho Driver 3:
```json
{
  "userId": "user-id-3",
  "licenseNumber": "DL003456789",
  "licenseExpiry": "2025-12-31"
}
```

### Bước 3: Update Driver Location và Status

**PUT** `http://localhost:8080/api/driver/{driverId}`

```json
{
  "userId": "user-id",
  "licenseNumber": "DL001234567",
  "licenseExpiry": "2025-12-31",
  "driverStatus": "AVAILABLE",
  "latitude": 16.0544,
  "longitude": 108.2022,
  "address": "Đà Nẵng",
  "rating": 5.0
}
```

## Coordinates Đà Nẵng (Dùng cho testing)

- **Trung tâm Đà Nẵng**: [16.0544, 108.2022]
- **Gần bãi biển Mỹ Khê**: [16.0400, 108.2480]
- **Gần sân bay**: [16.0544, 108.1992]
- **Trung tâm thương mại**: [16.0644, 108.2122]

## Quick Test Script

Tạo 1 driver đầy đủ thông tin:

```bash
# 1. Register User
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdriver@gmail.com",
    "password": "123456",
    "firstName": "Test",
    "lastName": "Driver",
    "phoneNumber": "0901234567"
  }'

# 2. Lấy userId từ response, sau đó tạo driver
curl -X POST http://localhost:8080/api/driver \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "licenseNumber": "DL123456789",
    "licenseExpiry": "2025-12-31"
  }'

# 3. Update location (replace {driverId} với ID từ step 2)
curl -X PUT http://localhost:8080/api/driver/{driverId} \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "licenseNumber": "DL123456789",
    "licenseExpiry": "2025-12-31",
    "driverStatus": "AVAILABLE",
    "latitude": 16.0544,
    "longitude": 108.2022,
    "rating": 5.0
  }'
```

## Verify Drivers

**GET** `http://localhost:8080/api/driver/nearest?lat=16.0544&lng=108.2022&limit=10`

Sau khi tạo xong, test lại endpoint này để đảm bảo có drivers available!
