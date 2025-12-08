# Hệ thống Logging

## Backend API

### POST /api/logs

Ghi log mới (public - frontend có thể gửi)

**Body:**

```json
{
  "level": "info|warn|error|debug",
  "message": "Log message",
  "source": "frontend|backend",
  "page": "/profile",
  "stack": "Error stack trace",
  "meta": {
    "key": "value"
  }
}
```

### GET /api/logs

Lấy danh sách logs (Admin only)

**Query params:**

- `page`: Trang (default: 1)
- `limit`: Số logs mỗi trang (default: 50)
- `level`: Filter theo level (info, warn, error, debug)
- `source`: Filter theo source (frontend, backend)
- `userId`: Filter theo user ID
- `startDate`: Từ ngày
- `endDate`: Đến ngày

### GET /api/logs/stats

Lấy thống kê logs (Admin only)

### DELETE /api/logs

Xóa logs cũ (Admin only)

**Body:**

```json
{
  "days": 30
}
```

## Frontend Usage

### Import logger

```typescript
import { logger } from "@/utils/logger";
```

### Sử dụng logger

```typescript
// Info
logger.info("User clicked button", { buttonId: "submit" });

// Warning
logger.warn("API response slow", { responseTime: 3000 });

// Error
try {
  // code
} catch (error) {
  logger.error("Failed to fetch data", error, { endpoint: "/api/users" });
}

// Debug
logger.debug("Component mounted", { props });
```

### Tự động log errors

Logger tự động bắt:

- Uncaught errors (window.onerror)
- Unhandled promise rejections

## Database Schema

```typescript
{
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  source: 'frontend' | 'backend',
  page?: string,           // URL page
  userId?: string,         // User ID nếu đã login
  userEmail?: string,      // User email nếu đã login
  stack?: string,          // Error stack trace
  meta?: object,           // Additional data
  timestamp: Date
}
```

## Ví dụ

### Log error trong component

```typescript
try {
  await updateProfile(data);
} catch (error) {
  logger.error("Profile update failed", error, {
    username: data.username,
    page: "/profile",
  });
  showToast({ type: "error", message: "Cập nhật thất bại" });
}
```

### Log thành công

```typescript
logger.info("User registered", {
  username: user.username,
  email: user.email,
});
```
