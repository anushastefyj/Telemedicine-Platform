# Deployment Guide: Railway + MongoDB Atlas

This document outlines the step-by-step procedure to deploy the production-ready CareSync Telemedicine Platform backend with its connected services to the cloud.

---

## 1. MongoDB Atlas Setup

MongoDB Atlas will serve as our secure, cloud-hosted database.

1. **Sign Up/Log In**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. **Create a Database Cluster**:
   - Choose the free shared tier (M0).
   - Select your preferred cloud provider (AWS/GCP/Azure) and a region closest to your target audience.
3. **Database User Configuration**:
   - Navigate to **Database Access** under the Security tab.
   - Click **Add New Database User**.
   - Select **Read and write to any database** privileges, enter a username and strong password, and click **Add User**.
4. **Network Access / IP Whitelisting**:
   - Navigate to **Network Access** under Security.
   - Click **Add IP Address**.
   - Choose **Allow Access From Anywhere** (`0.0.0.0/0`) since Railway uses dynamic IPs to connect to external databases, or obtain specific IP blocks if needed.
5. **Get Connection String**:
   - Go to **Database** under Deployment.
   - Click **Connect** on your cluster.
   - Choose **Drivers** under Connect to your application.
   - Copy the connection string. It will look like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password you set for the database user.

---

## 2. Third-Party API Credentials

Before deploying, make sure you have active accounts for:
*   **Stripe**: Create a developer account at [Stripe Dashboard](https://dashboard.stripe.com/) to fetch your `STRIPE_SECRET_KEY`.
*   **Cloudinary**: Sign up at [Cloudinary](https://cloudinary.com/) and copy your Cloud Name, API Key, and API Secret from the dashboard console.
*   **Nodemailer SMTP**: Setup an SMTP server (e.g. [Mailtrap](https://mailtrap.io/) for development, or a transactional provider like SendGrid, Mailgun, or AWS SES for production) to grab host, port, user, and password credentials.
*   **Gemini AI**: Generate an API key at Google AI Studio to populate `GEMINI_API_KEY`.

---

## 3. Deploying to Railway

Railway is a cloud platform that allows you to provision infrastructure directly from your GitHub repository using Docker.

### Option A: Via Railway CLI (Local Terminal)
1. **Install CLI**:
   ```bash
   npm i -g @railway/cli
   ```
2. **Login**:
   ```bash
   railway login
   ```
3. **Initialize Project**:
   Run in the project root folder:
   ```bash
   railway init
   ```
4. **Deploy**:
   ```bash
   railway up
   ```

### Option B: Via GitHub Integration (Recommended)
1. **Push Code**: Make sure your local repository changes are pushed to GitHub.
2. **Create Project**: Log in to [Railway.app](https://railway.app) and click **New Project** -> **Deploy from GitHub repo**.
3. **Select Repository**: Select your Telemedicine Platform repository.
4. **Automatic Detection**: Railway will automatically detect the `Dockerfile` at the root directory and use it to build your container environment.

---

## 4. Configure Environment Variables on Railway

In your Railway project panel, click on your service card, go to the **Variables** tab, and add the following keys matching the production values:

| Variable | Description |
| :--- | :--- |
| `PORT` | Set to `5000` (or leave default, Railway binds this automatically) |
| `NODE_ENV` | `production` |
| `MONGO_URI` | The connection string obtained from MongoDB Atlas in Step 1 |
| `JWT_SECRET` | A secure, random string used to sign user auth tokens |
| `JWT_EXPIRES_IN` | `7d` |
| `STRIPE_SECRET_KEY` | Your live or test Stripe secret token |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary Secret Key |
| `EMAIL_HOST` | E.g. `smtp.sendgrid.net` or your SMTP server address |
| `EMAIL_PORT` | SMTP Port (usually `587` or `465`) |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `FROM_EMAIL` | E.g. `CareSync Notifications <no-reply@yourdomain.com>` |
| `GEMINI_API_KEY` | Google Gemini API secret key |

Once the environment variables are saved, Railway will automatically trigger a rebuild and redeployment of your backend app. 

### 5. Verification
Click on the generated domains under the **Settings** tab in Railway to verify access:
- **Health check**: `https://<your-railway-domain>/health`
- **Swagger Documentation**: `https://<your-railway-domain>/api-docs`
