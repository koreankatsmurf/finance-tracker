# Deployment Guide

This guide covers deploying the Finance Tracker application to production environments.

## Prerequisites

- Node.js 18+ installed
- Git repository set up
- Environment variables configured

## Backend Deployment (Render.com)

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub/GitLab
2. Make sure `backend/.env` is in `.gitignore`
3. Create `backend/.env.example` with all required variables

### Step 2: Create Render Service

1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `finance-tracker-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-production-jwt-secret-here
FRONTEND_URL=https://your-frontend-domain.vercel.app
DATABASE_URL=./database.sqlite
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_your_live_price_id
OPENAI_API_KEY=sk-your-openai-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://finance-tracker-backend.onrender.com`)

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Update `frontend/src/contexts/AuthContext.jsx`:
   ```javascript
   axios.defaults.baseURL = 'https://your-backend-url.onrender.com'
   ```

### Step 2: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Environment Variables (if needed)

Add any frontend environment variables:

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at `https://your-app.vercel.app`

## PWA Installation

### Android Installation

1. Open the deployed app in Chrome on Android
2. Look for the "Add to Home Screen" prompt, or:
3. Tap the menu (⋮) in Chrome
4. Select "Add to Home Screen"
5. Confirm installation
6. The app icon will appear on your home screen

### iOS Installation (Safari)

1. Open the app in Safari on iOS
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm installation

## Database Migration (Production)

For production, consider upgrading to PostgreSQL:

### Step 1: Update Dependencies

```bash
npm install pg pg-hstore
npm uninstall sqlite3
```

### Step 2: Update Sequelize Config

```javascript
// backend/models/index.js
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});
```

### Step 3: Add PostgreSQL to Render

1. In Render dashboard, create a new PostgreSQL database
2. Copy the connection string
3. Update `DATABASE_URL` environment variable

## Monitoring and Maintenance

### Health Checks

The backend includes a health check endpoint:
```
GET /api/health
```

### Logs

- **Render**: View logs in the Render dashboard
- **Vercel**: View function logs in Vercel dashboard

### Updates

1. Push changes to your repository
2. Render and Vercel will automatically redeploy
3. Monitor deployment status in respective dashboards

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is correctly set in backend
2. **Database Connection**: Check `DATABASE_URL` format
3. **Build Failures**: Verify all dependencies are in `package.json`
4. **Environment Variables**: Double-check all required vars are set

### Debug Steps

1. Check deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check network requests in browser dev tools

## Security Considerations

1. Use strong JWT secrets in production
2. Enable HTTPS (automatic on Render/Vercel)
3. Set secure CORS origins
4. Use Stripe live keys for production
5. Regularly update dependencies
6. Monitor for security vulnerabilities

## Performance Optimization

1. Enable gzip compression
2. Use CDN for static assets
3. Implement database indexing
4. Add request rate limiting
5. Monitor response times
6. Optimize bundle sizes

## Backup Strategy

1. Regular database backups
2. Code repository backups
3. Environment variable documentation
4. Disaster recovery plan