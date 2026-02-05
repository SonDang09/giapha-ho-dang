# Debugging Guide - GiaPha Project

## Quick Debug Scripts

### 1. Check API Connectivity
```bash
# Test backend health
curl -s https://giapha-backend.onrender.com/api/health | jq

# Test tree endpoint
curl -s https://giapha-backend.onrender.com/api/members/tree | jq '.data | length'
```

### 2. Check Frontend Build
```bash
cd /Users/sondang/Downloads/GiaPha/frontend
npm run build
# Look for any TypeScript/ESLint errors
```

### 3. MongoDB Quick Check
```javascript
// In backend, add to any route temporarily:
const Member = require('./models/Member');
const count = await Member.countDocuments();
console.log('Total members:', count);
```

---

## Common Debug Scenarios

### "Trang trắng" (White Screen)
1. Open browser DevTools → Console
2. Check for JavaScript errors
3. Common causes:
   - Missing env variable `VITE_API_URL`
   - Backend not responding
   - Invalid JSON from API

### "Không load được data"
1. Network tab → Check API calls
2. If 500 error: Check backend logs on Render
3. If 404: Check route paths
4. If CORS error: Check backend cors config

### "Tree không hiển thị đúng"
```javascript
// Log tree data structure
console.log(JSON.stringify(treeData, null, 2));

// Verify structure:
// { name: "...", attributes: {...}, children: [...] }
```

### "Login không được"
1. Check localStorage for token
2. Verify password (Admin@123456)
3. Check backend /api/auth/login response

---

## Log Locations

| Service | How to View Logs |
|---------|-----------------|
| Frontend (local) | Browser DevTools Console |
| Backend (local) | Terminal running `npm run dev` |
| Backend (Render) | https://dashboard.render.com → Service → Logs |
| Vercel Deploy | https://vercel.com → Deployments → Build logs |
