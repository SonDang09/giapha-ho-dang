---
name: GiaPha Project
description: Complete guide to the GiaPha (Gia Phả) family tree website including architecture, patterns, debugging, and common issues
---

# GiaPha Project Skill

Hướng dẫn toàn diện về dự án website Gia Phả Họ Đặng.

## 🏗️ Project Architecture

### Tech Stack
| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React + Vite + Ant Design | Port 5173 |
| **Backend** | Node.js + Express | Port 5000 |
| **Database** | MongoDB Atlas | Cloud-hosted |
| **Hosting** | Vercel (FE) + Render (BE) | Auto-deploy on push |

### Folder Structure
```
/Users/sondang/My Drive/1. GENPLUS MEDIA/2. Code/GiaPha/
├── frontend/
│   ├── src/
│   │   ├── api/              # API calls (axios instances)
│   │   ├── components/       # Reusable components
│   │   │   ├── Layout/       # AppLayout (Header, Footer)
│   │   │   ├── FamilyTree/   # FamilyTreeView, tree node rendering
│   │   │   └── Memorial/     # Memorial page components
│   │   ├── context/          # React Context providers
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   ├── ThemeContext.jsx     # Dark/light mode
│   │   │   └── SiteSettingsContext.jsx  # Backend-managed settings
│   │   ├── pages/            # Page components
│   │   └── hooks/            # Custom hooks (useDocumentTitle, etc.)
│   └── .env                  # VITE_API_URL
│
├── backend/
│   ├── models/               # Mongoose schemas
│   │   ├── Member.js         # Family member (hierarchical)
│   │   ├── SiteSettings.js   # Configurable site settings
│   │   ├── News.js           # News articles
│   │   ├── Album.js          # Photo albums
│   │   ├── Transaction.js    # Fund transactions
│   │   └── User.js           # User accounts
│   ├── routes/               # Express routes
│   ├── middleware/           # Auth middleware
│   └── server.js             # Entry point
│
└── .agent/
    ├── workflows/deploy.md   # Deploy workflow
    └── skills/giapha-project/  # This skill
```

---

## 🔑 Key Patterns

### 1. Backend-Managed Settings
Tất cả text frontend có thể thay đổi từ Admin:

```jsx
// Import context
import { useSiteSettings } from '../../context/SiteSettingsContext';

// Use in component
const siteSettings = useSiteSettings();
return <h1>{siteSettings.treeHeader}</h1>;
```

**Available settings:**
- `brandName` - Header logo text
- `siteTitle` - Site title (SEO, footer)
- `tagline` - Homepage tagline
- `treeHeader`, `treeSubtitle`, `treeFooter` - Tree page text
- `footerText` - Global footer
- `socialLinks` - { facebook, zalo, youtube }

### 2. Authentication Pattern
```jsx
import { useAuth } from '../../context/AuthContext';

const { user, isAuthenticated, isAdmin, canEdit, logout } = useAuth();

// Admin check
if (isAdmin) {
  // Show admin controls
}
```

**Roles:**
- `admin`, `admin_toc` - Full access
- `user` - Read only

### 3. Family Tree Data Structure
```javascript
// Member model - hierarchical
{
  fullName: String,
  gender: 'male' | 'female',
  generation: Number,
  birthYear: Number,
  deathYear: Number,
  isDeceased: Boolean,
  parent: ObjectId (ref: 'Member'),  // Parent reference
  spouse: String,
  occupation: String,
  biography: String,
  avatar: String,
  photos: [String]
}

// API returns nested tree via aggregation
GET /api/members/tree → { name, children: [...] }
```

### 4. CSS Responsive Pattern
```css
/* Mobile first - base styles */
.desktop-menu { display: none !important; }
.mobile-menu-btn { display: block !important; }

/* Desktop - 1024px+ */
@media (min-width: 1024px) {
  .desktop-menu { display: flex !important; }
  .mobile-menu-btn { display: none !important; }
}

/* Large desktop - 1280px+ */
@media (min-width: 1280px) {
  /* Larger fonts, padding */
}
```

**Breakpoints:**
- `< 1024px` → Hamburger menu
- `≥ 1024px` → Horizontal menu
- `≥ 1280px` → Larger typography

---

## 🎨 Tree Page UI Styling

### Card Colors & Borders
```javascript
const COLORS = {
  male: '#8B0000',      // Dark red for male cards
  female: '#1B5E20',    // Dark green for female cards
  gold: '#DAA520',      // Gold for generation badges
  brown: '#8B4513'      // Brown for connector lines
};
```

### Card Styling
- **Size**: 165x95px for all cards (main + spouse)
- **Border**: 3px solid (red for male, green for female)
- **Badge**: Diamond-shaped generation badge at top-right
- **Title**: CỤ (Gen 1-2), ÔNG/BÀ (Gen 3), VỢ for spouses

### Spouse Display
- Spouses rendered next to main member with brown connector line
- Same card size and styling as main member
- Title shows "VỢ" instead of ÔNG/BÀ

### Year Format
- `(YYYY-YYYY)` for deceased
- `(YYYY-nay)` for living
- `(?-YYYY)` if birth year unknown

---

## 🐛 Common Issues & Solutions

### 1. Menu overflow on medium screens
**Problem:** Menu horizontal bị tràn ở 800-1000px
**Solution:** Tăng breakpoint lên 1024px để hamburger hiện sớm hơn

### 2. Render backend "sleeping"
**Problem:** First request takes 30-60 seconds
**Solution:** 
- Render free tier spins down after 50s inactivity
- Use health check endpoint or upgrade plan

### 3. Tree view not rendering
**Problem:** Tree data empty or malformed
**Debug:**
```javascript
// Check API response
const response = await membersAPI.getTree();
console.log('Tree data:', response.data);

// Verify root exists
// Each node needs: name, attributes, children[]
```

### 4. Settings not updating
**Problem:** Backend settings not reflected in frontend
**Solution:**
1. Check SiteSettingsContext is wrapping App
2. Verify backend SiteSettings model has field
3. Check settingsAPI response in Network tab

### 5. Image upload fails
**Problem:** Avatar/photo upload không hoạt động
**Debug:**
- Check file size (max 5MB typically)
- Check CORS settings on backend
- Verify multer middleware configured

### 6. Login rate limiting
**Problem:** "Quá nhiều lần đăng nhập thất bại" sau vài lần thử
**Solution:**
- Backend có rate limit cho login attempts (10 requests/15 phút)
- Đợi 15 phút hoặc restart backend trên Render Dashboard
- Mở Render Dashboard → giapha-backend → Manual Deploy → Restart service
- Credentials đúng: `admin` / `Admin@2024`

---

## 🔧 Development Commands

### Start local development
```bash
# Terminal 1: Backend
cd "/Users/sondang/My Drive/1. GENPLUS MEDIA/2. Code/GiaPha/backend" && npm start

# Terminal 2: Frontend  
cd "/Users/sondang/My Drive/1. GENPLUS MEDIA/2. Code/GiaPha/frontend" && npm run dev
```

### Deploy to production
```bash
cd "/Users/sondang/My Drive/1. GENPLUS MEDIA/2. Code/GiaPha"
git add .
git commit -m "Your message"
git push origin main
# Vercel auto-deploys in ~1 min
# Render auto-deploys in ~2-3 min
```

---

## 📊 API Endpoints Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/members` | GET/POST | List/create members |
| `/api/members/tree` | GET | Nested tree structure |
| `/api/members/:id` | GET/PUT/DELETE | Single member CRUD |
| `/api/members/anniversaries` | GET | Upcoming death anniversaries |
| `/api/news` | GET/POST | News articles |
| `/api/albums` | GET/POST | Photo albums |
| `/api/settings` | GET/PUT | Site settings |
| `/api/auth/login` | POST | User login |
| `/api/transactions` | GET/POST | Fund transactions |

---

## 🎨 UI Components Quick Reference

### FamilyTreeView
Location: `frontend/src/components/FamilyTree/FamilyTreeView.jsx`

**Props:**
- `data` - Tree data from API
- `loading` - Show spinner
- `onRefresh` - Callback after CRUD

**Features:**
- Custom node rendering with foreignObject
- Admin actions (Add child, Edit, Delete)
- Mobile-optimized zoom levels

### AppLayout
Location: `frontend/src/components/Layout/AppLayout.jsx`

**Features:**
- Responsive header (horizontal ≥1024px, hamburger <1024px)
- Dynamic branding from SiteSettings
- Dark mode toggle
- User menu with logout

---

## 🔐 Credentials & Access

| Service | Username | Password/Notes |
|---------|----------|----------------|
| **Admin Login** | admin | Admin@2024 |
| **GitHub** | SonDang09 | - |
| **Vercel** | sondangs-projects-2be2385f | Via GitHub OAuth |
| **Render** | - | Via GitHub OAuth |
| **MongoDB** | ducsonseo_db_user | In Render env vars |

### URLs
| Environment | Frontend | Backend |
|-------------|----------|--------|
| **Production** | https://giapha-ho-dang.vercel.app | https://giapha-backend.onrender.com |
| **Localhost** | http://localhost:5173 hoặc 5174 | http://localhost:5001 |

### CORS Allowed Origins
Backend cho phép requests từ:
- `https://giapha-ho-dang.vercel.app`
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:3000`

---

## 📝 When to Update This Skill

Cập nhật skill này khi:
1. Thêm model mới vào backend
2. Thay đổi authentication flow
3. Thêm settings field mới
4. Thay đổi responsive breakpoints
5. Phát hiện lỗi mới và cách fix
