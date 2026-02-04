# Quick Start: Deploy AstroPharma as a Permanent Website

## 5-Minute Overview

This guide gets your AstroPharma website live in production with minimal steps. Follow each section in order.

---

## Step 1: Verify Your GitHub Repository (2 minutes)

Your code is already in GitHub at: `https://github.com/curlyellieglobal-alt/AstroPharma`

Ensure the repository is set to public or that you have Railway access configured. The main branch should contain your latest production-ready code.

---

## Step 2: Create Railway Project (3 minutes)

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub Repo"**
4. Choose **"AstroPharma"** repository
5. Select **"main"** branch
6. Click **"Deploy"**

Railway will automatically start building your application.

---

## Step 3: Add Database (2 minutes)

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"MySQL"**
3. Wait for database to be provisioned
4. Click on the MySQL service
5. Copy the `DATABASE_URL` value from the Variables tab

---

## Step 4: Configure Environment Variables (3 minutes)

Click on your application service and go to **"Variables"** tab. Add these variables:

```
DATABASE_URL=<paste the value from Step 3>
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate using: openssl rand -base64 32>
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://auth.manus.im
OWNER_OPEN_ID=your_owner_open_id
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_manus_api_key
```

After adding variables, Railway will automatically redeploy.

---

## Step 5: Run Database Migrations (2 minutes)

1. Go to **"Deployments"** tab
2. Click on the latest successful deployment
3. Click **"Connect"** → **"New Terminal"**
4. Run: `npm run db:push`
5. Wait for completion

---

## Step 6: Verify Application is Live (1 minute)

1. Go back to your Railway project
2. Look for the public URL (usually shown at the top)
3. Click the URL to visit your live website
4. Verify all pages load correctly

**Congratulations! Your website is now live!**

---

## Step 7: Add Custom Domain (Optional, 5 minutes)

1. Register a domain at GoDaddy, Namecheap, or similar
2. In Railway, go to **"Settings"** → **"Domains"**
3. Click **"+ Add Domain"**
4. Enter your domain name
5. Update DNS records at your domain registrar with the values Railway provides
6. Wait 24 hours for DNS propagation
7. Visit your domain to confirm it works

---

## Step 8: Enable HTTPS (Automatic)

Railway automatically provisions SSL certificates for your domain. Once DNS propagates, your site will be accessible via HTTPS.

---

## Monitoring Your Live Site

### Check Deployment Status
- Go to Railway dashboard
- View **"Deployments"** tab
- Check logs for any errors

### Monitor Performance
- Railway shows CPU, memory, and network usage
- Monitor these metrics regularly

### Update Your Code
- Make changes in GitHub
- Push to main branch
- Railway automatically redeploys

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Application won't start | Check deployment logs for errors. Verify all environment variables are set. |
| Database connection fails | Verify `DATABASE_URL` is correct. Confirm MySQL service is running. |
| Domain not working | Check DNS records are correct. Wait 24-48 hours for propagation. |
| Slow performance | Check Railway metrics. Scale up if needed. Optimize database queries. |

---

## Next Steps

1. **Immediate:** Follow steps 1-6 above
2. **Today:** Set up custom domain (Step 7)
3. **This week:** Configure monitoring and backups
4. **Ongoing:** Monitor performance and apply updates

---

## Important Security Notes

- Never commit `.env` files to Git
- Keep `JWT_SECRET` and API keys confidential
- Rotate `JWT_SECRET` every 90 days
- Enable two-factor authentication on GitHub and Railway
- Monitor deployment logs for security issues

---

## Support

- **Railway Docs:** https://docs.railway.app
- **Project Repo:** https://github.com/curlyellieglobal-alt/AstroPharma
- **Manus Documentation:** https://help.manus.im

Your AstroPharma website is now live and ready to serve customers!
