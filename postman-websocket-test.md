# Hướng Dẫn Test WebSocket Bằng Postman

## 1. Chuẩn Bị
- Postman (version mới nhất có hỗ trợ WebSocket)
- Backend đang chạy tại `localhost:8080`
- ID của Driver và Customer (lấy từ database hoặc tạo mới)

## 2. Kết Nối WebSocket cho Driver (Để nhận Ride Request)

1. Mở Postman -> New -> **WebSocket Request**
2. Nhập URL: `ws://localhost:8080/ws-raw`
3. Click **Connect** (Đảm bảo hiện "Connected" màu xanh)

## 3. Gửi Tin Nhắn (STOMP Protocol)

Spring dùng protocol STOMP, nên bạn cần gửi từng **Frame** text cụ thể.

### Bước 1: Gửi lệnh CONNECT
Copy đoạn sau vào ô **Message** và nhấn **Send**:

```text
CONNECT
accept-version:1.1,1.0
heart-beat:10000,10000

```
*(Lưu ý: Để lại 1 dòng trống ở cuối)*

⚠️ **Quan trọng:** Postman có thể không gửi được ký tự `null byte` (`\0` hoặc `^@`) ở cuối frame mà STOMP yêu cầu. Nếu server không phản hồi `CONNECTED`, hãy thử copy ký tự null từ một trang web (ví dụ: search "null character copypaste") và dán vào cuối message.
**Hoặc dùng tool test online: http://jmesnil.net/stomp-websocket/doc/**

### Bước 2: Gửi lệnh SUBSCRIBE (Để nhận noti)
Sau khi thấy server trả về `CONNECTED`, gửi tiếp tin nhắn này:

```text
SUBSCRIBE
id:sub-0
destination:/topic/driver/da4312b2-b20a-4041-8e23-ffd205f69c33

```
*(Thay ID driver của bạn vào destination)*

## 4. Tạo Ride Request (Giả lập khách hàng đặt xe)

Sử dụng tab **HTTP Request** bình thường trong Postman:

- **Method:** POST
- **URL:** `http://localhost:8080/api/rides`
- **Body (JSON):**
  ```json
  {
      "customerId": "fd2e2f7b-6acc-4e38-a4d4-062e94317231",
      "startLocation": "Cầu Rồng",
      "endLocation": "Sân Bay",
      "customerLatitude": 16.0611,
      "customerLongitude": 108.2208,
      "distance": 3000,
      "fare": 20000,
      "vehicleType": "MOTORBIKE",
      "startTime": 1737435917000
  }
  ```
- **Lưu ý:** `customerLatitude` và `customerLongitude` phải gần vị trí của Driver (trong bán kính 10km) thì driver mới nhận được noti.

## 4. Kiểm Tra Kết Quả

Quay lại tab **WebSocket** của Driver:
- Bạn sẽ thấy một tin nhắn JSON gửi về từ server chứa thông tin chuyến xe (`RideNotification`):
  ```json
  {
      "rideRequestId": "...",
      "customerId": "...",
      "startLocation": "Cầu Rồng",
      ...
  }
  ```

## 5. Driver Chấp Nhận Chuyến Xe (Giả lập Driver App)

Để accept chuyến xe (flow này thường qua REST API hoặc WebSocket send):
Hiện tại backend chưa thấy endpoint REST public để accept ride, nhưng `NotificationService` có hàm `notifyRideAccepted`.
Thường trong Spring STOMP, client sẽ gửi message lên `/app/...`.

Test logic này cần check `DriverController` hoặc `RideController` xem có endpoint nào để driver accept không.
Dựa vào code hiện tại, logic accept nằm trong `RideService.handleDriverResponse`, được gọi qua WebSocket hoặc REST.

Nếu driver muốn accept:
- Gửi REST request (nếu có endpoint) hoặc STOMP SEND.

---
**Mẹo:** Để dễ dàng test STOMP hơn Postman, bạn có thể dùng công cụ online như: [JSTOMP](http://jmesnil.net/stomp-websocket/doc/) hoặc tạo một file HTML đơn giản dùng `sockjs-client` và `stompjs` để chạy local test.
