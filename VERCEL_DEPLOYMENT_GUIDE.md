# Hướng dẫn Deploy Frontend lên Vercel

## Vấn đề
Khi build lên Vercel, ứng dụng không sử dụng endpoint từ environment variables.

## Nguyên nhân
1. File `environment.prod.ts` thiếu `wsUrl`
2. Không có file `.env` trong thư mục `fe` để `@ngx-env/builder` đọc
3. Chưa cấu hình Environment Variables trên Vercel Dashboard

## Giải pháp đã thực hiện

### 1. Đã sửa file `environment.prod.ts`
Thêm `wsUrl: process.env['NG_APP_WS_URL']`

### 2. Đã tạo file `.env` trong thư mục `fe`
```
NG_APP_BACKEND_URL=http://54.206.35.51:8080/api
NG_APP_TRACK_ASIA_KEY=9304ed0af35602777a71768789308f6f9e
NG_APP_WS_URL=http://54.206.35.51:8080/ws
```

### 3. Đã tạo file `vercel.json`
Cấu hình build output và routing cho SPA

### 4. Đã tạo file `.env.example`
Hướng dẫn các environment variables cần thiết

## Các bước Deploy

### Bước 1: Cấu hình Environment Variables trên Vercel

1. Truy cập: https://vercel.com/trimai104zzz-4952s-projects/ridehailing-app/settings/environment-variables

2. Thêm các biến sau:
   - **Name**: `NG_APP_BACKEND_URL`
     - **Value**: `http://54.206.35.51:8080/api`
     - **Environment**: Production, Preview, Development
   
   - **Name**: `NG_APP_TRACK_ASIA_KEY`
     - **Value**: `9304ed0af35602777a71768789308f6f9e`
     - **Environment**: Production, Preview, Development
   
   - **Name**: `NG_APP_WS_URL`
     - **Value**: `http://54.206.35.51:8080/ws`
     - **Environment**: Production, Preview, Development

3. Click "Save" cho mỗi biến

### Bước 2: Redeploy

Sau khi thêm environment variables, chạy lệnh:

```bash
cd /home/mufies/Code/RideHailingSystem/fe
npx vercel --prod
```

Hoặc trigger redeploy từ Vercel Dashboard:
https://vercel.com/trimai104zzz-4952s-projects/ridehailing-app

### Bước 3: Kiểm tra

1. Truy cập: https://ridehailing-app.vercel.app
2. Mở DevTools (F12) > Console
3. Kiểm tra xem app có kết nối đúng API endpoint không

## Lưu ý quan trọng

### CORS Configuration
Backend cần cho phép domain của Vercel:
```
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000,https://ridehailing-app.vercel.app,https://ridehailing-1aj3dpief-trimai104zzz-4952s-projects.vercel.app
```

### WebSocket Connection
Nếu backend đang dùng HTTP, WebSocket sẽ không hoạt động trên HTTPS (Vercel).
Cần:
1. Nâng cấp backend lên HTTPS
2. Hoặc sử dụng WebSocket Secure (WSS)

### Environment Variables trong @ngx-env/builder

File `angular.json` đã cấu hình:
```json
"ngxEnv": {
  "root": ".."
}
```

Điều này cho phép `@ngx-env/builder` đọc:
1. `/home/mufies/Code/RideHailingSystem/fe/.env`
2. `/home/mufies/Code/RideHailingSystem/.env`

Trong production (Vercel), các biến sẽ được inject từ Vercel Environment Variables.

## Troubleshooting

### Nếu vẫn không hoạt động sau khi deploy:

1. **Kiểm tra Build Logs trên Vercel**:
   - Xem có thông báo về environment variables không
   - Đảm bảo build thành công

2. **Kiểm tra Runtime**:
   - Mở DevTools > Network tab
   - Xem API calls có đúng endpoint không

3. **Clear Cache và Redeploy**:
   ```bash
   npx vercel --prod --force
   ```

4. **Kiểm tra file build output**:
   - Trong `dist/fe/browser/main-*.js`
   - Search cho `NG_APP_BACKEND_URL` để xem có được inject không

## Links

- **Production**: https://ridehailing-app.vercel.app
- **Inspect**: https://vercel.com/trimai104zzz-4952s-projects/ridehailing-app
- **Settings**: https://vercel.com/trimai104zzz-4952s-projects/ridehailing-app/settings
