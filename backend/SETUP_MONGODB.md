# Hướng dẫn Setup MongoDB

## Cách 1: MongoDB Local (Khuyên dùng)

### Bước 1: Cài đặt MongoDB

1. Tải MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Chạy file cài đặt, chọn "Complete"
3. Tick "Install MongoDB as a Service"
4. Tick "Install MongoDB Compass" (GUI tool)

### Bước 2: Khởi động service

Mở PowerShell với quyền **Administrator** và chạy:

```powershell
net start MongoDB
```

### Bước 3: Kiểm tra kết nối

```powershell
mongosh
# Nếu kết nối thành công, gõ: exit
```

### Bước 4: Restart backend

Backend sẽ tự động kết nối MongoDB khi khởi động lại (nodemon tự restart)

---

## Cách 2: MongoDB Atlas (Cloud miễn phí)

### Bước 1: Tạo tài khoản

1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký tài khoản miễn phí

### Bước 2: Tạo Cluster

1. Chọn "Create" → "Shared" (miễn phí)
2. Chọn region gần nhất (Singapore hoặc Tokyo)
3. Cluster Name: `5m-game`
4. Click "Create Cluster"

### Bước 3: Tạo Database User

1. Security → Database Access → Add New Database User
2. Username: `admin`
3. Password: tự tạo password mạnh
4. Database User Privileges: Read and write to any database
5. Add User

### Bước 4: Whitelist IP

1. Security → Network Access → Add IP Address
2. Click "Allow Access From Anywhere" (0.0.0.0/0)
3. Confirm

### Bước 5: Lấy Connection String

1. Clusters → Connect → Drivers
2. Copy connection string:

```
mongodb+srv://admin:<password>@5m-game.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Bước 6: Cập nhật .env

Sửa file `backend/.env`:

```env
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@5m-game.xxxxx.mongodb.net/5m-game?retryWrites=true&w=majority
```

Thay `YOUR_PASSWORD` bằng password bạn tạo ở bước 3.

### Bước 7: Restart backend

Backend sẽ tự động kết nối MongoDB Atlas

---

## Kiểm tra kết nối thành công

Khi backend khởi động, bạn sẽ thấy:

```
✅ MongoDB Kết nối thành công: localhost (hoặc cluster0.xxxxx.mongodb.net)
```

Thay vì:

```
❌ Lỗi kết nối MongoDB: connect ECONNREFUSED
```

## Test đăng ký user

Sau khi MongoDB kết nối thành công:

```powershell
# Test đăng ký
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"123456\"}'

# Kiểm tra trong MongoDB Compass hoặc Atlas
# Database: 5m-game
# Collection: users
# Sẽ thấy user vừa tạo
```
