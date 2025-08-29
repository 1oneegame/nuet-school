# 🚀 Quick Deployment Guide

## TL;DR - Deploy in 5 Minutes

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Set up MongoDB Atlas**:
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get connection string

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Configure Environment Variables** in Vercel Dashboard:
   - `MONGODB_URI`: Your Atlas connection string
   - `NEXTAUTH_URL`: Your Vercel app URL
   - `NEXTAUTH_SECRET`: Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `JWT_SECRET`: Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `NEXT_PUBLIC_URL`: Your Vercel app URL

## Environment Variables Template

Copy from `.env.production.example` and update values:

```env
NEXT_PUBLIC_URL=https://your-app.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nuet-app
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-production-secret
JWT_SECRET=your-jwt-secret
```

## Available Scripts

- `npm run deploy` - Full deployment with build test
- `npm run deploy:skip-build` - Deploy without build test
- `npm run vercel:dev` - Run Vercel development server

## Need Help?

See the complete guide: `VERCEL_DEPLOYMENT_GUIDE.md`

---

**Your educational platform will be live at**: `https://your-app.vercel.app` 🎉