# Deploying to Vercel - Complete Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Set up a cloud MongoDB database

## Step 1: Prepare Your Project

### 1.1 Update next.config.js
Update your `next.config.js` to handle production domains:

```javascript
/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')(['react-icons']);

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'your-vercel-domain.vercel.app'], // Add your Vercel domain
  },
  // Ensure API routes work properly
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = withTM(nextConfig);
```

### 1.2 Create vercel.json (Optional but Recommended)
Create a `vercel.json` file in your project root:

```json
{
  "functions": {
    "src/pages/api/**/*.ts": {
      "maxDuration": 30
    },
    "src/pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "JWT_SECRET": "@jwt-secret",
    "NEXTAUTH_URL": "@nextauth-url"
  }
}
```

## Step 2: Set Up MongoDB Atlas

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose a free tier cluster
3. **Configure Network Access**: Add `0.0.0.0/0` to allow connections from anywhere
4. **Create Database User**: Create a user with read/write permissions
5. **Get Connection String**: Copy the connection string (replace `<password>` with your actual password)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nuet-app?retryWrites=true&w=majority
```

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Import Project**: Go to Vercel dashboard → "New Project" → Import from GitHub
3. **Configure Settings**: Select your repository and configure build settings

## Step 4: Configure Environment Variables

In your Vercel dashboard, go to Project Settings → Environment Variables and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://your-app-git-branch.vercel.app` | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | Strong random string (generate new one) | All |
| `JWT_SECRET` | Strong random string (generate new one) | All |
| `NEXT_PUBLIC_URL` | `https://your-app.vercel.app` | Production |
| `SMTP_HOST` | Your SMTP server (if using email) | All |
| `SMTP_PORT` | SMTP port (usually 587) | All |
| `SMTP_USER` | Your SMTP username | All |
| `SMTP_PASS` | Your SMTP password | All |
| `SMTP_FROM` | Your sender email | All |

### Generate Secure Secrets

Use these commands to generate secure secrets:

```bash
# For NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 5: Update Your Code for Production

### 5.1 Update Database Connection
Ensure your MongoDB connection handles production environment properly in `src/lib/mongodb.js`:

```javascript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

### 5.2 Update CORS and Security Headers
Add security headers in `next.config.js`:

```javascript
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXTAUTH_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};
```

## Step 6: Test Your Deployment

1. **Check Build Logs**: Monitor the deployment process in Vercel dashboard
2. **Test API Endpoints**: Verify all API routes work correctly
3. **Test Authentication**: Ensure login/register functionality works
4. **Test Database Operations**: Verify CRUD operations work with MongoDB Atlas
5. **Test File Uploads**: Ensure file upload functionality works (if applicable)

## Step 7: Custom Domain (Optional)

1. **Add Domain**: In Vercel dashboard → Project Settings → Domains
2. **Configure DNS**: Update your domain's DNS settings as instructed by Vercel
3. **Update Environment Variables**: Update `NEXTAUTH_URL` and `NEXT_PUBLIC_URL` to use your custom domain

## Common Issues and Solutions

### Issue 1: API Routes Not Working
**Solution**: Ensure your API routes are in the correct directory structure (`src/pages/api/` or `pages/api/`)

### Issue 2: Database Connection Timeout
**Solution**: 
- Check MongoDB Atlas network access settings
- Verify connection string is correct
- Ensure database user has proper permissions

### Issue 3: Environment Variables Not Loading
**Solution**:
- Verify variables are set in Vercel dashboard
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Issue 4: NextAuth Issues
**Solution**:
- Ensure `NEXTAUTH_URL` matches your deployment URL exactly
- Generate a new `NEXTAUTH_SECRET` for production
- Check that your authentication providers are configured for the new domain

### Issue 5: File Upload Issues
**Solution**:
- Consider using cloud storage (AWS S3, Cloudinary) instead of local file storage
- Vercel has limitations on file system writes

## Performance Optimization

1. **Enable Image Optimization**: Update `next.config.js` with proper image domains
2. **Use Static Generation**: Implement ISR (Incremental Static Regeneration) where possible
3. **Optimize Bundle Size**: Use dynamic imports for large components
4. **Database Indexing**: Ensure proper indexes in MongoDB for better performance

## Security Checklist

- [ ] Use strong, unique secrets for production
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure proper CORS headers
- [ ] Validate all user inputs
- [ ] Use environment variables for sensitive data
- [ ] Enable MongoDB Atlas security features
- [ ] Regular security updates for dependencies

## Monitoring and Maintenance

1. **Vercel Analytics**: Enable analytics in your Vercel dashboard
2. **Error Monitoring**: Consider integrating Sentry or similar service
3. **Database Monitoring**: Use MongoDB Atlas monitoring tools
4. **Regular Updates**: Keep dependencies updated

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)

Your educational platform should now be successfully deployed on Vercel! 🚀