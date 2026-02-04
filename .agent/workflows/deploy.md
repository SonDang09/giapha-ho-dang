---
description: Quy trình deploy website Gia Phả lên production
---

# Deploy Gia Phả Website

## 🔑 Tài khoản các nền tảng

| Nền tảng | Tài khoản | Dashboard |
|----------|-----------|-----------|
| **GitHub** | SonDang09 | https://github.com/SonDang09 |
| **Vercel** | sondangs-projects-2be2385f | https://vercel.com/sondangs-projects-2be2385f |
| **Render** | (đăng nhập qua GitHub) | https://dashboard.render.com |
| **MongoDB Atlas** | ducsonseo_db_user | https://cloud.mongodb.com |

### Admin Website
- **URL**: https://giapha-ho-dang.vercel.app/admin
- **Username**: admin
- **Password**: admin123

---

## Thông tin cấu hình

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://giapha-ho-dang.vercel.app |
| Backend (Render) | https://giapha-backend.onrender.com |
| GitHub | https://github.com/SonDang09/giapha-ho-dang |

---

## Quy trình Deploy

### 1. Sửa code tại local
Sửa code trong thư mục `/Users/sondang/Downloads/GiaPha`

### 2. Test local trước khi push

// turbo
```bash
cd /Users/sondang/Downloads/GiaPha/frontend && npm run dev
```

// turbo
```bash
cd /Users/sondang/Downloads/GiaPha/backend && npm run dev
```

Mở http://localhost:5173 để test

### 3. Commit thay đổi

```bash
cd /Users/sondang/Downloads/GiaPha
git add .
git commit -m "Mô tả thay đổi của bạn"
```

### 4. Push lên GitHub

```bash
git push origin main
```

### 5. Kiểm tra deployment
- Vercel: https://vercel.com/sondangs-projects-2be2385f (auto-deploy trong ~1 phút)
- Render: https://dashboard.render.com (auto-deploy trong ~2-3 phút)

### 6. Verify production
Mở https://giapha-ho-dang.vercel.app và kiểm tra thay đổi

---

## Lưu ý quan trọng

⚠️ **Render Free Tier**: Backend có thể "ngủ" sau 50 giây không hoạt động. Request đầu tiên có thể mất 30-60 giây.

✅ **Auto-Deploy**: Mỗi push lên `main` sẽ tự động trigger deployment.

🔄 **Rollback**: Nếu có lỗi, vào dashboard Vercel/Render để rollback về version trước.
