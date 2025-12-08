# Backend API - Node.js

Backend API cho ứng dụng 5M Game sử dụng Node.js, Express, MongoDB.

## Cài đặt

```bash
cd backend
npm install
```

## Chạy server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user (cần token)
- `PUT /api/auth/profile` - Cập nhật profile (cần token)

### Logs

- `POST /api/logs` - Tạo log mới (public)
- `GET /api/logs` - Lấy danh sách logs (admin only)
- `GET /api/logs/stats` - Thống kê logs (admin only)
- `DELETE /api/logs` - Xóa logs cũ (admin only)

### Health Check

- `GET /api/health` - Kiểm tra server status

## Environment Variables

Tạo file `.env` trong thư mục root (không phải backend folder):

```env
MONGODB_URI=mongodb://localhost:27017/5m-game
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Cấu trúc thư mục

```
backend/
├── config/
│   ├── env.js          # Environment config
│   └── database.js     # MongoDB connection
├── controllers/
│   ├── authController.js
│   └── logController.js
├── middleware/
│   ├── auth.js         # JWT verification
│   ├── validator.js    # Request validation
│   └── errorHandler.js # Error handling
├── models/
│   ├── User.js
│   └── Log.js
├── routes/
│   ├── authRoutes.js
│   └── logRoutes.js
├── index.js            # Server entry point
├── package.json
└── nodemon.json
```

## Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Request validation
- **CORS** - Cross-origin resource sharing
