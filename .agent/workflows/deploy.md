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

### Tài khoản đăng nhập
| Vai trò | Username | Password |
|---------|----------|----------|
| Quản trị viên | admin | Admin@123456 |
| Chi họ | chinho | chi123 |
| Thành viên | member | member123 |

---

## Thông tin cấu hình

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://giapha-ho-dang.vercel.app |
| Backend (Render) | https://giapha-backend.onrender.com |
| GitHub | https://github.com/SonDang09/giapha-ho-dang |

---

## 📁 Cấu trúc Project

```
/Users/sondang/Downloads/GiaPha/
├── frontend/                 # React + Vite + Ant Design
│   ├── src/
│   │   ├── api/             # API calls (membersAPI, newsAPI, settingsAPI...)
│   │   ├── components/      # Reusable components
│   │   │   ├── Layout/      # AppLayout (Header, Footer)
│   │   │   ├── FamilyTree/  # FamilyTreeView component
│   │   │   └── Memorial/    # Memorial components
│   │   ├── context/         # React Context (Auth, Theme, SiteSettings)
│   │   ├── pages/           # Page components
│   │   │   ├── Admin/       # AdminPage.jsx - Quản trị
│   │   │   ├── Tree/        # TreePage.jsx - Cây gia phả
│   │   │   ├── Home/        # HomePage.jsx - Trang chủ
│   │   │   └── ...
│   │   └── hooks/           # Custom hooks
│   └── .env                 # VITE_API_URL
│
└── backend/                 # Node.js + Express + MongoDB
    ├── models/              # Mongoose models
    │   ├── Member.js        # Thành viên
    │   ├── SiteSettings.js  # Cấu hình website
    │   ├── News.js          # Tin tức
    │   ├── Album.js         # Album ảnh
    │   ├── Transaction.js   # Giao dịch quỹ
    │   └── User.js          # Người dùng
    ├── routes/              # API routes
    └── server.js            # Entry point
```

---

## ⚙️ Backend Settings (SiteSettings Model)

Các cấu hình được quản lý từ Admin > Cấu hình:

| Field | Mô tả | Hiển thị ở |
|-------|-------|-----------|
| `brandName` | Tên thương hiệu | Header logo (góc trái) |
| `location` | Địa điểm | Thông tin chung |
| `siteTitle` | Tiêu đề website | Footer, SEO |
| `tagline` | Châm ngôn | Trang chủ hero |
| `heroDescription` | Mô tả ngắn | Trang chủ |
| `treeHeader` | Tiêu đề cây gia phả | Header trang cây |
| `treeSubtitle` | Dòng phụ cây | Subtitle trang cây |
| `treeFooter` | Footer cây gia phả | Footer trang cây |
| `headerScripts` | Mã nhúng (GA, Pixel) | `<head>` tag |
| `footerText` | Text footer | Footer toàn trang |
| `socialLinks` | Facebook, Zalo, YouTube | Footer/liên hệ |
| `contactEmail` | Email liên hệ | Trang liên hệ |
| `contactPhone` | SĐT liên hệ | Trang liên hệ |

---

## 🌳 Tính năng Cây Gia Phả

### Quick Actions (Admin)
Click vào node thành viên → Modal hiện các nút:
- **Thêm con** (xanh): Thêm con cái, tự động set cha/mẹ
- **Sửa**: Chỉnh sửa thông tin thành viên
- **Xóa** (đỏ): Xác nhận xóa với Popconfirm

### Mobile Optimization
- `nodeSize.x`: 200px (desktop: 160px)
- `zoom`: 0.45 cho mobile
- `separation`: điều chỉnh để tránh overlap

---

## 🔐 Authentication

- JWT token lưu trong `localStorage`
- Roles: `admin`, `admin_toc` (có toàn quyền), `user` (xem)
- AuthContext: `useAuth()` → `{ user, isAuthenticated, isAdmin, canEdit, logout }`

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

## 📋 Các API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/members` | GET/POST | Danh sách/thêm thành viên |
| `/api/members/:id` | GET/PUT/DELETE | CRUD thành viên |
| `/api/members/tree` | GET | Cây gia phả dạng nested |
| `/api/members/anniversaries` | GET | Ngày giỗ sắp tới |
| `/api/news` | GET/POST | Tin tức |
| `/api/albums` | GET/POST | Album ảnh |
| `/api/settings` | GET/PUT | Cấu hình website |
| `/api/auth/login` | POST | Đăng nhập |
| `/api/transactions` | GET/POST | Giao dịch quỹ |

---

## Lưu ý quan trọng

⚠️ **Render Free Tier**: Backend có thể "ngủ" sau 50 giây không hoạt động. Request đầu tiên có thể mất 30-60 giây.

✅ **Auto-Deploy**: Mỗi push lên `main` sẽ tự động trigger deployment.

🔄 **Rollback**: Nếu có lỗi, vào dashboard Vercel/Render để rollback về version trước.

🔒 **Admin Password**: `Admin@123456` (đã cập nhật từ admin123)

📱 **Mobile**: Đã tối ưu cho màn hình mobile, tree view auto-adjust nodeSize và zoom.

🎨 **Theme**: Support dark mode via ThemeContext.
