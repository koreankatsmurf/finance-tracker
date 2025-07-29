\# Complete Windows Deployment Guide for Finance Tracker



This guide will walk you through deploying your Finance Tracker app to Android using Windows Command Prompt or PowerShell.



\## Prerequisites



\- Node.js 18+ installed

\- Git installed

\- GitHub account

\- Chrome browser on Android device



\## Part 1: Get Required API Keys



\### 1.1 Stripe Setup (Required for Premium Features)



1\. Go to \[https://dashboard.stripe.com](https://dashboard.stripe.com)

2\. Create account or sign in

3\. Click "Developers" → "API Keys"

4\. Copy your "Secret key" (starts with `sk\_test\_` or `sk\_live\_`)

5\. Go to "Products" → "Create Product"

&nbsp;  - Name: "Finance Tracker Premium"

&nbsp;  - Price: $9.99/month, recurring

6\. Copy the Price ID (starts with `price\_`)



\### 1.2 OpenAI Setup (Required for AI Features)



1\. Go to \[https://platform.openai.com](https://platform.openai.com)

2\. Create account and add billing method

3\. Click "API Keys" → "Create new secret key"

4\. Copy the key (starts with `sk-`)



\### 1.3 Cloudinary Setup (Required for Receipt Images)



1\. Go to \[https://cloudinary.com](https://cloudinary.com)

2\. Create free account

3\. Go to Dashboard

4\. Copy: Cloud Name, API Key, API Secret



\## Part 2: Prepare Your Project



\### 2.1 Open Command Prompt or PowerShell



1\. Press `Windows + R`

2\. Type `cmd` and press Enter

3\. Navigate to your project folder:

```cmd

cd C:\\path\\to\\your\\finance-tracker

```



\### 2.2 Install Dependencies



```cmd

npm install

cd backend

npm install

cd ../frontend

npm install

cd ..

```



\### 2.3 Set Up Environment Variables



1\. Navigate to backend folder:

```cmd

cd backend

```



2\. Create `.env` file by copying the example:

```cmd

copy .env.example .env

```



3\. Open `.env` file in Notepad:

```cmd

notepad .env

```



4\. Replace the placeholder values with your actual API keys:

```env

NODE\_ENV=production

PORT=10000

JWT\_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random-at-least-32-characters

FRONTEND\_URL=https://your-app-name.vercel.app



DATABASE\_URL=./database.sqlite



STRIPE\_SECRET\_KEY=sk\_test\_your\_stripe\_secret\_key\_here

STRIPE\_PREMIUM\_MONTHLY\_PRICE\_ID=price\_your\_stripe\_price\_id\_here



OPENAI\_API\_KEY=sk-your-openai-api-key-here



CLOUDINARY\_CLOUD\_NAME=your-cloudinary-cloud-name

CLOUDINARY\_API\_KEY=your-cloudinary-api-key

CLOUDINARY\_API\_SECRET=your-cloudinary-api-secret

```



5\. Save and close Notepad

6\. Go back to project root:

```cmd

cd ..

```



\### 2.4 Test Locally (Optional) THIS ONE FAILED: RE CHECK AND ASK AI 



```cmd

npm run dev

```

\- Frontend: http://localhost:5173

\- Backend: http://localhost:3001



Press `Ctrl + C` to stop the servers.



\## Part 3: Push to GitHub



\### 3.1 Initialize Git Repository



```cmd

git init

git add .

git commit -m "Initial Finance Tracker setup"

```



\### 3.2 Create GitHub Repository



1\. Go to \[https://github.com](https://github.com)

2\. Click "New repository"

3\. Name: `finance-tracker`

4\. Make it Public

5\. Click "Create repository"



\### 3.3 Push to GitHub



Replace `yourusername` with your actual GitHub username:



```cmd

git remote add origin https://github.com/yourusername/finance-tracker.git

git branch -M main

git push -u origin main

```



\## Part 4: Deploy Backend to Render



\### 4.1 Create Render Account



1\. Go to \[https://render.com](https://render.com)

2\. Sign up with your GitHub account



\### 4.2 Create Web Service



1\. Click "New +" → "Web Service"

2\. Connect your GitHub repository

3\. Select `finance-tracker` repository



\### 4.3 Configure Service



Fill in these exact settings:



\- \*\*Name\*\*: `finance-tracker-backend`

\- \*\*Environment\*\*: `Node`

\- \*\*Region\*\*: `US East (Ohio)` (or closest to you)

\- \*\*Branch\*\*: `main`

\- \*\*Root Directory\*\*: `backend`

\- \*\*Build Command\*\*: `npm install`

\- \*\*Start Command\*\*: `npm start`



\### 4.4 Add Environment Variables



In the "Environment" section, add these variables one by one:



```

NODE\_ENV=production

PORT=10000

JWT\_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random-at-least-32-characters

FRONTEND\_URL=https://your-app-name.vercel.app

DATABASE\_URL=./database.sqlite

STRIP

