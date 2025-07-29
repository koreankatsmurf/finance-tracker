\# Complete Android Deployment Guide for Finance Tracker



This guide covers deploying the Finance Tracker app to Android using PWA (Progressive Web App) technology, with backend on Render and frontend on Vercel.



\## Prerequisites



\- Node.js 18+ installed

\- Git repository (GitHub/GitLab)

\- Android device with Chrome browser

\- Accounts: Render.com, Vercel.com, Stripe, OpenAI, Cloudinary



\## Part 1: Environment Setup



\### 1.1 Get Required API Keys



\*\*Stripe Setup:\*\*

1\. Go to \[Stripe Dashboard](https://dashboard.stripe.com)

2\. Create account or login

3\. Navigate to "Developers" → "API Keys"

4\. Copy your "Secret key" (starts with `sk\_test\_` or `sk\_live\_`)

5\. Go to "Products" → "Create Product"

6\. Name: "Finance Tracker Premium"

7\. Price: $9.99/month, recurring

8\. Copy the Price ID (starts with `price\_`)



\*\*OpenAI Setup:\*\*

1\. Go to \[OpenAI Platform](https://platform.openai.com)

2\. Create account and add billing method

3\. Navigate to "API Keys"

4\. Create new secret key

5\. Copy the key (starts with `sk-`)



\*\*Cloudinary Setup:\*\*

1\. Go to \[Cloudinary](https://cloudinary.com)

2\. Create free account

3\. Go to Dashboard

4\. Copy: Cloud Name, API Key, API Secret



\### 1.2 Update Environment Variables



Create `backend/.env` file:

```env

NODE\_ENV=production

PORT=10000

JWT\_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random-at-least-32-characters

FRONTEND\_URL=https://your-app-name.vercel.app



\# Database

DATABASE\_URL=./database.sqlite



\# Stripe (use live keys for production)

STRIPE\_SECRET\_KEY=sk\_test\_your\_stripe\_secret\_key\_here

STRIPE\_PREMIUM\_MONTHLY\_PRICE\_ID=price\_your\_stripe\_price\_id\_here



\# OpenAI

OPENAI\_API\_KEY=sk-your-openai-api-key-here



\# Cloudinary

CLOUDINARY\_CLOUD\_NAME=your-cloudinary-cloud-name

CLOUDINARY\_API\_KEY=your-cloudinary-api-key

CLOUDINARY\_API\_SECRET=your-cloudinary-api-secret

```



\## Part 2: Backend Deployment (Render.com)



\### 2.1 Prepare Repository



1\. \*\*Push to GitHub:\*\*

```bash

git add .

git commit -m "Initial Finance Tracker setup"

git push origin main

```



\### 2.2 Deploy to Render



1\. \*\*Create Render Account:\*\*

&nbsp;  - Go to \[Render.com](https://render.com)

&nbsp;  - Sign up with GitHub account



2\. \*\*Create Web Service:\*\*

&nbsp;  - Click "New +" → "Web Service"

&nbsp;  - Connect your GitHub repository

&nbsp;  - Select your finance-tracker repository



3\. \*\*Configure Service:\*\*

&nbsp;  - \*\*Name:\*\* `finance-tracker-backend`

&nbsp;  - \*\*Environment:\*\* `Node`

&nbsp;  - \*\*Region:\*\* Choose closest to your users

&nbsp;  - \*\*Branch:\*\* `main`

&nbsp;  - \*\*Root Directory:\*\* `backend`

&nbsp;  - \*\*Build Command:\*\* `npm install`

&nbsp;  - \*\*Start Command:\*\* `npm start`



4\. \*\*Add Environment Variables:\*\*

&nbsp;  In Render dashboard, go to "Environment" tab and add:

&nbsp;  ```

&nbsp;  NODE\_ENV=production

&nbsp;  PORT=10000

&nbsp;  JWT\_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random-at-least-32-characters

&nbsp;  FRONTEND\_URL=https://your-app-name.vercel.app

&nbsp;  DATABASE\_URL=./database.sqlite

&nbsp;  STRIPE\_SECRET\_KEY=sk\_live\_your\_live\_stripe\_key

&nbsp;  STRIPE\_PREMIUM\_MONTHLY\_PRICE\_ID=price\_your\_live\_price\_id

&nbsp;  OPENAI\_API\_KEY=sk-your-openai-api-key-here

&nbsp;  CLOUDINARY\_CLOUD\_NAME=your-cloudinary-cloud-name

&nbsp;  CLOUDINARY\_API\_KEY=your-cloudinary-api-key

&nbsp;  CLOUDINARY\_API\_SECRET=your-cloudinary-api-secret

&nbsp;  ```



5\. \*\*Deploy:\*\*

&nbsp;  - Click "Create Web Service"

&nbsp;  - Wait for deployment (5-10 minutes)

&nbsp;  - Note your backend URL: `https://finance-tracker-backend-xxxx.onrender.com`



\### 2.3 Verify Backend



Test your backend:

```bash

curl https://your-backend-url.onrender.com/api/health

```

Should return: `{"status":"OK","timestamp":"..."}`



\## Part 3: Frontend Deployment (Vercel)



\### 3.1 Update Frontend Configuration



Update `frontend/src/services/api.js`:

```javascript

const api = axios.create({

&nbsp; baseURL: 'https://your-backend-url.onrender.com', // Replace with your actual backend URL

&nbsp; timeout: 10000,

&nbsp; headers: {

&nbsp;   'Content-Type': 'application/json',

&nbsp; },

})

```



\### 3.2 Deploy to Vercel



1\. \*\*Create Vercel Account:\*\*

&nbsp;  - Go to \[Vercel.com](https://vercel.com)

&nbsp;  - Sign up with GitHub account



2\. \*\*Import Project:\*\*

&nbsp;  - Click "New Project"

&nbsp;  - Import your GitHub repository

&nbsp;  - Select the repository



3\. \*\*Configure Project:\*\*

&nbsp;  - \*\*Framework Preset:\*\* Vite

&nbsp;  - \*\*Root Directory:\*\* `frontend`

&nbsp;  - \*\*Build Command:\*\* `npm run build`

&nbsp;  - \*\*Output Directory:\*\* `dist`

&nbsp;  - \*\*Install Command:\*\* `npm install`



4\. \*\*Add Environment Variables (if needed):\*\*

&nbsp;  ```

&nbsp;  VITE\_API\_URL=https://your-backend-url.onrender.com

&nbsp;  VITE\_STRIPE\_PUBLISHABLE\_KEY=pk\_live\_your\_stripe\_publishable\_key

&nbsp;  ```



5\. \*\*Deploy:\*\*

&nbsp;  - Click "Deploy"

&nbsp;  - Wait for deployment (3-5 minutes)

&nbsp;  - Note your frontend URL: `https://your-app-name.vercel.app`



\### 3.3 Update Backend CORS



Update your backend's `FRONTEND\_URL` environment variable in Render:

```

FRONTEND\_URL=https://your-app-name.vercel.app

```



Redeploy the backend service in Render.



\## Part 4: Android PWA Installation



\### 4.1 Verify PWA Requirements



1\. \*\*Check PWA Status:\*\*

&nbsp;  - Open your app in Chrome on desktop

&nbsp;  - Press F12 → "Application" tab → "Manifest"

&nbsp;  - Verify manifest loads correctly

&nbsp;  - Check "Service Workers" tab



2\. \*\*Test PWA Features:\*\*

&nbsp;  - Offline functionality

&nbsp;  - Add to Home Screen prompt

&nbsp;  - App-like behavior



\### 4.2 Install on Android



\*\*Method 1: Chrome "Add to Home Screen"\*\*



1\. \*\*Open in Chrome:\*\*

&nbsp;  - Open Chrome on Android

&nbsp;  - Navigate to `https://your-app-name.vercel.app`

&nbsp;  - Log in to test functionality



2\. \*\*Install PWA:\*\*

&nbsp;  - Tap Chrome menu (⋮)

&nbsp;  - Select "Add to Home Screen"

&nbsp;  - Confirm installation

&nbsp;  - App icon appears on home screen



3\. \*\*Launch App:\*\*

&nbsp;  - Tap the app icon

&nbsp;  - App opens in full-screen mode

&nbsp;  - No browser UI visible



\*\*Method 2: Chrome Install Banner\*\*



1\. \*\*Automatic Prompt:\*\*

&nbsp;  - Visit the site multiple times

&nbsp;  - Chrome may show install banner

&nbsp;  - Tap "Install" when prompted



\### 4.3 Test Android App



1\. \*\*Core Functionality:\*\*

&nbsp;  - User registration/login

&nbsp;  - Add/edit transactions

&nbsp;  - View dashboard

&nbsp;  - Create budgets

&nbsp;  - View reports



2\. \*\*PWA Features:\*\*

&nbsp;  - Offline access to cached pages

&nbsp;  - App-like navigation

&nbsp;  - Push notifications (if implemented)

&nbsp;  - Background sync



3\. \*\*Premium Features:\*\*

&nbsp;  - Stripe payment flow

&nbsp;  - AI receipt scanning

&nbsp;  - Auto-categorization



\## Part 5: Native Android App (Optional - Capacitor)



\### 5.1 Install Capacitor



```bash

cd frontend

npm install @capacitor/core @capacitor/cli @capacitor/android

npx cap init

```



\### 5.2 Configure Capacitor



Update `capacitor.config.ts`:

```typescript

import { CapacitorConfig } from '@capacitor/cli';



const config: CapacitorConfig = {

&nbsp; appId: 'com.financetracker.app',

&nbsp; appName: 'Finance Tracker',

&nbsp; webDir: 'dist',

&nbsp; server: {

&nbsp;   androidScheme: 'https'

&nbsp; },

&nbsp; plugins: {

&nbsp;   SplashScreen: {

&nbsp;     launchShowDuration: 2000,

&nbsp;     backgroundColor: '#3B82F6',

&nbsp;   },

&nbsp; },

};



export default config;

```



\### 5.3 Build Android App



```bash

\# Build web app

npm run build



\# Add Android platform

npx cap add android



\# Copy web assets

npx cap copy



\# Open in Android Studio

npx cap open android

```



\### 5.4 Generate APK



1\. \*\*In Android Studio:\*\*

&nbsp;  - Build → Generate Signed Bundle/APK

&nbsp;  - Choose APK

&nbsp;  - Create new keystore or use existing

&nbsp;  - Build release APK



2\. \*\*Install APK:\*\*

&nbsp;  - Transfer APK to Android device

&nbsp;  - Enable "Install from unknown sources"

&nbsp;  - Install the APK



\## Part 6: Production Checklist



\### 6.1 Security



\- \[ ] Use HTTPS for all endpoints

\- \[ ] Strong JWT secret (32+ characters)

\- \[ ] Stripe live keys for production

\- \[ ] Rate limiting enabled

\- \[ ] Input validation on all endpoints

\- \[ ] CORS properly configured



\### 6.2 Performance



\- \[ ] Database indexes added

\- \[ ] Image optimization (Cloudinary)

\- \[ ] Gzip compression enabled

\- \[ ] CDN for static assets

\- \[ ] Bundle size optimization



\### 6.3 Monitoring



\- \[ ] Error logging (Sentry)

\- \[ ] Performance monitoring

\- \[ ] Database backups

\- \[ ] Health check endpoints

\- \[ ] Uptime monitoring



\### 6.4 PWA Requirements



\- \[ ] Manifest.json valid

\- \[ ] Service worker registered

\- \[ ] HTTPS enabled

\- \[ ] Responsive design

\- \[ ] Offline functionality

\- \[ ] App icons (192x192, 512x512)



\## Part 7: Troubleshooting



\### 7.1 Common Issues



\*\*Backend Issues:\*\*

\- Check Render logs for errors

\- Verify environment variables

\- Test API endpoints individually

\- Check database connection



\*\*Frontend Issues:\*\*

\- Check browser console for errors

\- Verify API URL configuration

\- Test PWA manifest

\- Check service worker registration



\*\*Android Issues:\*\*

\- Clear Chrome cache

\- Check PWA requirements

\- Verify HTTPS certificate

\- Test on different devices



\### 7.2 Debug Commands



```bash

\# Check backend health

curl https://your-backend-url.onrender.com/api/health



\# Test authentication

curl -X POST https://your-backend-url.onrender.com/api/auth/login \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -d '{"email":"test@example.com","password":"password"}'



\# Check PWA manifest

curl https://your-app-name.vercel.app/manifest.json

```



\## Part 8: Maintenance



\### 8.1 Updates



1\. \*\*Code Updates:\*\*

&nbsp;  - Push to GitHub

&nbsp;  - Vercel auto-deploys frontend

&nbsp;  - Render auto-deploys backend



2\. \*\*Database Migrations:\*\*

&nbsp;  - Add migration files

&nbsp;  - Deploy backend

&nbsp;  - Migrations run automatically



3\. \*\*Dependency Updates:\*\*

&nbsp;  - Update package.json

&nbsp;  - Test locally

&nbsp;  - Deploy to production



\### 8.2 Monitoring



\- Monitor Render/Vercel dashboards

\- Check error logs regularly

\- Monitor Stripe payments

\- Track user analytics

\- Monitor API usage (OpenAI/Cloudinary)



\## Success Criteria



✅ Backend deployed and accessible  

✅ Frontend deployed and responsive  

✅ PWA installable on Android  

✅ All features working (auth, transactions, budgets)  

✅ AI features functional (premium)  

✅ Stripe payments working  

✅ App works offline (cached content)  

✅ Professional UI/UX  



Your Finance Tracker app is now live and installable on Android devices!



\*\*App URLs:\*\*

\- Frontend: `https://your-app-name.vercel.app`

\- Backend: `https://your-backend-url.onrender.com`

\- Android: Install via Chrome "Add to Home Screen"

