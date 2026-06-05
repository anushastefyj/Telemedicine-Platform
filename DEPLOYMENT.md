# Telemedicine Platform Backend: Render Deployment Guide

This guide explains how to deploy this production-ready backend application to **Render** integrated with **MongoDB Atlas**.

---

## 1. MongoDB Atlas Setup
1. Log in to your [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas).
2. Provision a shared cluster (free tier).
3. Under **Security** -> **Database Access**, create a database user with read/write privileges. Save the password securely.
4. Under **Security** -> **Network Access**, whitelist `0.0.0.0/0` (allow all traffic) since Render uses dynamic IP configurations.
5. In **Deployment** -> **Database**, click **Connect** -> **Drivers** and copy your URI connection string. It will look like:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/telemedicine?retryWrites=true&w=majority`

---

## 2. Render Cloud Setup
1. Log in to [Render.com](https://render.com).
2. Click **New** -> **Blueprint Route** (or **Web Service**).
3. Connect your GitHub repository containing this project.
4. If deploying as a Blueprint:
   Render will parse your `render.yaml` configuration automatically.
5. If deploying as a manual **Web Service**:
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`
   - Select **Docker** (since there is a multi-stage Dockerfile present) or **Node** environment.

---

## 3. Environment Variables Configuration
In the Render Service Dashboard, navigate to the **Environment** tab and add the following keys:

| Variable | Recommended Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A secure, random string for JWT signatures |
| `JWT_EXPIRES_IN` | `7d` |
| `ALLOWED_ORIGINS` | Your frontend production URL (e.g. `https://your-frontend.onrender.com`) |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret key |
| `EMAIL_HOST` | Your email SMTP server address |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `FROM_EMAIL` | E.g. `CareSync Alerts <noreply@yourdomain.com>` |
| `OPENAI_API_KEY` | Your OpenAI API secret key |

---

## 4. Stripe Webhooks Configuration
1. Go to your [Stripe Developer Dashboard](https://dashboard.stripe.com/test/webhooks).
2. Click **Add Endpoint**.
3. Set **Endpoint URL** to:
   `https://<your-render-app-name>.onrender.com/api/payments/confirm` (or your dedicated payment callback endpoint).
4. Select the event types to listen to (e.g. `payment_intent.succeeded`).
5. Retrieve your Webhook Signing Secret (`whsec_...`) and configure it if your backend implements a direct raw webhook handler.
