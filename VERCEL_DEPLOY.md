# FilaZero Saúde - Vercel Demo Deployment Guide

## 🚀 Quick Deploy to Vercel

This guide will help you deploy FilaZero Saúde as a **live demo** on Vercel in under 5 minutes.

### Why Vercel?

- ✅ **Automatic deploys** from GitHub
- ✅ **Free SSL certificate** and global CDN
- ✅ **Preview deployments** for every commit
- ✅ **Zero configuration** needed
- ✅ **Production-ready** performance

---

## Demo Mode

The Vercel deployment runs in **DEMO MODE** using localStorage mock backend:

- ✅ No backend server needed
- ✅ Fully functional queue management
- ✅ Real-time simulation with mock data
- ✅ Perfect for showcasing to potential buyers
- ⚠️ Data resets on page refresh (demo only)

---

## Step-by-Step Deployment

### 1. Prerequisites

- GitHub repository: ✅ Already done (`glferreira-devsecops/filazero`)
- Vercel account: Sign up at [vercel.com](https://vercel.com) (free)

### 2. Import Project to Vercel

**Option A: Web Interface** (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub account
4. Choose repository: `glferreira-devsecops/filazero`
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **"Deploy"**

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root
cd /path/to/filazero-saude
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: filazero-saude
# - Directory: frontend
# - Framework: Vite (auto-detected)
# - Deploy? Yes
```

### 3. Configure Build Settings (if needed)

If build fails, verify these settings in Vercel dashboard:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

### 4. Environment Variables (Optional)

For production PocketBase connection (when backend is deployed):

```
VITE_POCKETBASE_URL=https://your-pocketbase-url.com
```

For demo mode (default), leave empty.

---

## Post-Deployment

### Your Live Demo URLs

After deployment, Vercel provides:

1. **Production URL**: `https://filazero-saude.vercel.app`
2. **Preview URLs**: Unique URL for each branch/commit
3. **Custom Domain**: Add your own domain (optional)

### Test the Demo

Visit your deployment URL and test:

1. **Landing Page** (`/`)
   - See marketing homepage
   - Click "Demo" button

2. **Patient View** (`/clinic/demo`)
   - Generate a ticket
   - Watch queue position update in real-time

3. **Reception Dashboard** (`/reception`)
   - Login (demo mode: any email/password works)
   - See live queue
   - Call patients, manage tickets

4. **TV Panel** (`/panel`)
   - Large-screen display simulation
   - Real-time queue updates

5. **Admin Analytics** (`/admin`)
   - View statistics
   - See charts and metrics

---

## Vercel Configuration Files

### `vercel.json` (Root Directory)

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "installCommand": "cd frontend && npm install"
}
```

### `frontend/.env.production`

```
VITE_POCKETBASE_URL=
VITE_DEMO_MODE=true
```

---

## Demo Mode Features

### What Works in Demo Mode

✅ **Full Queue Management**

- Create tickets
- Call patients
- Update status (waiting → called → in service → done)
- Real-time sync across tabs

✅ **All User Interfaces**

- Patient mobile view
- Reception dashboard
- TV panel display
- Admin analytics

✅ **Real-Time Simulation**

- Mock WebSocket updates
- Multi-device sync via localStorage
- Smooth animations and transitions

### Limitations (Demo Mode)

⚠️ **Data Persistence**

- Data stored in browser localStorage
- Resets on page refresh
- Not shared between different browsers/devices

⚠️ **Authentication**

- Any email/password accepted (demo only)
- No real user management

💡 **For Production**: Deploy PocketBase backend separately and set `VITE_POCKETBASE_URL`

---

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Builds project
# 3. Deploys to production
# 4. Updates live URL
```

**Preview Deployments**:

- Every branch gets a unique URL
- Perfect for testing before merging to main

---

## Custom Domain (Optional)

### Add Your Domain

1. Go to Vercel dashboard → Project Settings → Domains
2. Add domain: `filazero.com` or `demo.filazero.com`
3. Configure DNS:
   - **A Record**: `76.76.21.21` (Vercel IP)
   - **CNAME**: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate auto-generated

---

## Performance Optimization

Vercel automatically optimizes:

- ✅ **Gzip compression** for all assets
- ✅ **Brotli compression** when supported
- ✅ **Global CDN** (edge caching)
- ✅ **HTTP/2** and **HTTP/3**
- ✅ **Image optimization** (next/image)
- ✅ **Smart caching** headers

### Expected Performance

```
Lighthouse Scores (Vercel):
- Performance: 95-100
- Accessibility: 90+
- Best Practices: 95+
- SEO: 90+

Load Times:
- First Contentful Paint: <1s
- Time to Interactive: <2s
- Total Blocking Time: <100ms
```

---

## Monitoring & Analytics

### Vercel Analytics (Free Tier)

Enable in dashboard:

1. Project Settings → Analytics
2. Toggle "Enable Analytics"
3. View real-time visitors, page views, performance

### Available Metrics

- Real User Monitoring (RUM)
- Core Web Vitals
- Geographic distribution
- Device/browser breakdown
- Page load times

---

## Troubleshooting

### Build Fails

**Error**: `Cannot find module`

```bash
# Solution: Verify package.json dependencies
cd frontend
npm install
npm run build  # Test locally first
```

**Error**: `Command "npm run build" exited with 1`

```bash
# Solution: Check build logs in Vercel dashboard
# Common fix: Update Node.js version to 18.x in settings
```

### Demo Mode Not Working

**Issue**: Tickets not appearing

```javascript
// Solution: Clear localStorage and reload
localStorage.clear();
location.reload();
```

**Issue**: Authentication fails

```javascript
// In demo mode, any credentials work
// If failing, check browser console for errors
```

---

## Share Your Demo

### Demo URLs for Buyers

**For Acquire Listing**:

```
Live Demo: https://filazero-saude.vercel.app
GitHub: https://github.com/glferreira-devsecops/filazero
```

**Demo Instructions for Buyers**:

1. Visit `/clinic/demo` to see patient view
2. Generate a ticket and see queue position
3. Open second tab: `/reception` (login with any credentials)
4. Call the ticket from reception dashboard
5. See real-time sync between tabs
6. Open third tab: `/panel` for TV display view

---

## Upgrade to Production

When ready to deploy with real backend:

### Option 1: Deploy PocketBase to Fly.io

```bash
# Deploy backend
fly launch  # From backend directory
fly deploy

# Get URL: https://filazero-backend.fly.dev

# Update Vercel env vars
VITE_POCKETBASE_URL=https://filazero-backend.fly.dev
```

### Option 2: Full Stack on Railway

```bash
# Deploy entire stack
railway init
railway up

# Automatic full stack deployment with database
```

---

## Cost

### Vercel Free Tier

✅ **Included**:

- Unlimited deployments
- 100 GB bandwidth/month
- Automatic SSL
- Global CDN
- Preview deployments

⚠️ **Limits**:

- 6,000 build minutes/month (more than enough)
- 100 GB bandwidth (sufficient for demo)

💡 **Upgrade ($20/month Pro)**:

- Unlimited bandwidth
- Advanced analytics
- Custom deployment hooks
- Priority support

**For Demo**: Free tier is perfect! ✅

---

## Summary

### What You Get

✅ **Live Demo URL** in <5 minutes
✅ **Automatic deployments** from GitHub
✅ **Free SSL** and global CDN
✅ **Professional presentation** for buyers
✅ **Real-time updates** with every commit
✅ **Zero maintenance** required

### Next Steps

1. Deploy to Vercel (5 minutes)
2. Test demo thoroughly
3. Add demo URL to Acquire listing
4. Share with potential buyers
5. Upgrade to production backend when needed

---

**Last Updated**: December 9, 2024
**Deployment Time**: ~5 minutes
**Monthly Cost**: $0 (free tier)
**Maintenance**: Automatic
