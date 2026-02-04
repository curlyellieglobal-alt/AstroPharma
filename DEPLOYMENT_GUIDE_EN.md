# CurlyEllie Deployment Guide on Railway

## Introduction

This guide provides comprehensive instructions for deploying the CurlyEllie website on the Railway platform. The project is built with Node.js and React, using MySQL as the database.

## Prerequisites

Before starting, ensure you have:

- An active GitHub account
- An active Railway account
- A GitHub repository containing the project code (https://github.com/curlyellieglobal-alt/AstroPharma)
- Basic knowledge of Git and GitHub

## Deployment Steps

### Step 1: Create a New Project on Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in using your GitHub account
3. Click **"New Project"**
4. Select **"Deploy from GitHub Repo"**

### Step 2: Connect Your GitHub Repository

1. Choose the **"AstroPharma"** repository from the list
2. Select the **"main"** branch
3. Click **"Deploy"**

Railway will automatically start building the project.

### Step 3: Add MySQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** then **"MySQL"**
3. A new MySQL database will be created automatically

### Step 4: Get Database Connection Details

1. Click on the MySQL service that was created
2. Go to the **"Variables"** or **"Connect"** tab
3. Find **"DATABASE_URL"** or **"Connection String"**
4. Copy this value (usually starts with `mysql://`)

### Step 5: Configure Environment Variables

1. Click on your application service
2. Go to the **"Variables"** tab
3. Add the following variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `mysql://user:password@host:port/database` | Copy from database |
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `3000` | Default port |
| `JWT_SECRET` | `your_jwt_secret_here` | Strong secret key (use a long random value) |
| `VITE_APP_ID` | `your_app_id_here` | Application ID from Manus |
| `OAUTH_SERVER_URL` | `https://auth.manus.im` | Authentication server |
| `OWNER_OPEN_ID` | `your_owner_open_id` | Owner ID from Manus |
| `BUILT_IN_FORGE_API_URL` | `https://api.manus.im` | Storage server (optional) |
| `BUILT_IN_FORGE_API_KEY` | `your_api_key_here` | API key (optional) |

**Important Note:** Keep these variables confidential, especially `JWT_SECRET` and `BUILT_IN_FORGE_API_KEY`.

### Step 6: Start Deployment

After adding all environment variables, Railway will automatically:

1. Build the project
2. Deploy the application

Monitor the progress in the **"Deployments"** tab.

### Step 7: Run Database Migrations

After successful deployment:

1. Click on the latest successful deployment in **"Deployments"**
2. Click **"Connect"** then **"New Terminal"**
3. Run the following command:

```bash
npm run db:push
```

This will create all required tables in the database.

### Step 8: Verify Deployment

1. Wait for the deployment to complete successfully
2. Click the application URL (usually at the top of the page)
3. Verify that the website works correctly

## Troubleshooting

### Issue: 502 Bad Gateway

**Solution:**
- Check the deployment logs
- Verify all environment variables are correctly set
- Ensure `DATABASE_URL` is exactly correct
- Try redeploying

### Issue: Database Connection Failed

**Solution:**
- Verify `DATABASE_URL` contains correct credentials
- Ensure MySQL database is running properly
- Confirm MySQL service is connected to the same project

### Issue: `npm run db:push` Command Failed

**Solution:**
- Ensure you're in the correct terminal (application, not database)
- Verify `drizzle-kit` is installed in `package.json`
- Try running the command again

## Additional Information

### Redeploying

To redeploy after making changes:

1. Push changes to GitHub
2. Railway will automatically detect changes and redeploy

### Monitoring Logs

Monitor application logs through:

1. Click on your application service
2. Go to the **"Logs"** tab
3. View all events and errors

### Managing Environment Variables

To modify environment variables:

1. Go to the **"Variables"** tab
2. Edit the required value
3. Railway will automatically redeploy

## Support and Help

If you encounter issues:

1. Check [Railway Official Documentation](https://docs.railway.app)
2. Review deployment logs and errors
3. Verify all requirements are met

---

**Note:** This guide assumes default settings. Some steps may vary based on your specific needs.
