# Environment Variables Setup Guide

## ⚠️ QUAN TRỌNG

File này chứa tất cả các biến môi trường cần thiết cho ứng dụng.
**KHÔNG BAO GIỜ** commit file `.env` vào git!

## Hướng dẫn setup

1. Copy file này thành `.env`:

   ```bash
   cp .env.example .env
   ```

2. Cập nhật các giá trị trong `.env` theo môi trường của bạn

## Các biến môi trường bắt buộc

### MONGODB_URI (BẮT BUỘC)

Connection string để kết nối MongoDB.

**Local MongoDB:**

```
MONGODB_URI=mongodb://localhost:27017/5m-game
```

**MongoDB Atlas:**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/5m-game?retryWrites=true&w=majority
```

### JWT_SECRET (BẮT BUỘC)

Key bí mật để mã hóa JWT tokens.
**CHÚ Ý:** Phải có ít nhất 32 ký tự để đảm bảo bảo mật.

**Development:**

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Production (tạo key ngẫu nhiên):**

```bash
# Tạo random key bằng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Các biến môi trường tùy chọn

### PORT

Port cho backend server (mặc định: 5000)

```
PORT=5000
```

### NODE_ENV

Môi trường chạy (development/production)

```
NODE_ENV=development
```

### CLIENT_URL

URL của frontend (cho CORS) (mặc định: http://localhost:5173)

```
CLIENT_URL=http://localhost:5173
```

### VITE_PORT

Port cho Vite dev server (mặc định: 5173)

```
VITE_PORT=5173
```

## Kiểm tra cấu hình

Khi chạy server, nếu thiếu biến môi trường bắt buộc, server sẽ hiển thị lỗi:

```
Error: Missing required environment variables: MONGODB_URI, JWT_SECRET
Please check your .env file and ensure all required variables are set.
```

## Security Best Practices

1. ✅ Luôn sử dụng JWT_SECRET dài và phức tạp (>= 32 ký tự)
2. ✅ Thay đổi JWT_SECRET khi deploy production
3. ✅ Không share file .env với ai
4. ✅ Sử dụng .env.example để chia sẻ cấu trúc, không phải giá trị thực
5. ✅ Thêm .env vào .gitignore
