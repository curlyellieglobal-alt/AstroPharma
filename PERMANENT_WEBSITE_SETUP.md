# Making AstroPharma a Permanent Live Website

## Executive Summary

This guide transforms your AstroPharma project from a development application into a professional, permanent website accessible to the public. The process involves deploying to a production hosting environment, configuring a custom domain, setting up security certificates, and establishing ongoing maintenance procedures.

---

## Part 1: Hosting Provider Selection and Setup

### Why Railway for AstroPharma?

Railway is an excellent choice for the AstroPharma project because it provides seamless integration with GitHub, automatic deployments, built-in MySQL database support, and a straightforward pricing model. The platform handles infrastructure complexity, allowing you to focus on your application.

### Step 1: Create a Railway Account

Visit [Railway.app](https://railway.app) and sign up using your GitHub account. This integration ensures automatic deployments whenever you push code to your GitHub repository.

### Step 2: Create a New Project

After logging in, click **"New Project"** and select **"Deploy from GitHub Repo"**. Choose the AstroPharma repository and the main branch. Railway will automatically detect your project configuration and begin the initial build.

### Step 3: Add MySQL Database Service

Click **"+ New"** in your Railway project dashboard and select **"Database"** followed by **"MySQL"**. Railway will provision a production-grade MySQL instance with automatic backups and monitoring. Once created, navigate to the MySQL service settings and locate the `DATABASE_URL` connection string.

---

## Part 2: Environment Configuration for Production

### Understanding Environment Variables

Your application requires specific environment variables to function in production. These variables control database connections, authentication, security settings, and API integrations.

### Required Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | MySQL database connection | `mysql://user:pass@host:3306/db` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Authentication token secret | Long random string (32+ chars) |
| `VITE_APP_ID` | Manus application identifier | Your Manus app ID |
| `OAUTH_SERVER_URL` | OAuth authentication server | `https://auth.manus.im` |
| `OWNER_OPEN_ID` | Owner identification | Your Manus owner ID |
| `BUILT_IN_FORGE_API_URL` | Storage API endpoint | `https://api.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | Storage API authentication | Your Manus API key |

### Configuring Variables in Railway

Navigate to your application service in Railway and click the **"Variables"** tab. Add each variable from the table above. For sensitive values like `JWT_SECRET`, generate a cryptographically secure random string using:

```bash
openssl rand -base64 32
```

Never share these values, and consider rotating `JWT_SECRET` every 90 days for enhanced security.

---

## Part 3: Database Setup and Migration

### Running Initial Migrations

After configuring environment variables, Railway will automatically redeploy your application. Once deployment completes successfully, access the application terminal through the deployment details page.

Execute the database migration command to create all necessary tables:

```bash
npm run db:push
```

This command uses Drizzle ORM to synchronize your database schema with the application requirements. Verify successful completion by checking for any error messages.

### Verifying Database Setup

Connect to your MySQL database using a database client to verify that all tables were created correctly. You should see tables for users, products, orders, and other core entities defined in your schema.

---

## Part 4: Custom Domain Configuration

### Registering a Domain

Purchase a domain from a registrar such as GoDaddy, Namecheap, or Google Domains. Choose a domain that reflects your business and is easy to remember.

### Connecting Domain to Railway

In your Railway project settings, locate the **"Domains"** section. Click **"+ Add Domain"** and enter your domain name. Railway will provide DNS records that you need to configure with your domain registrar.

### Updating DNS Records

Log into your domain registrar's control panel and navigate to DNS settings. Add the DNS records provided by Railway. The exact records depend on your registrar, but typically include:

- **CNAME record** pointing your domain to Railway's infrastructure
- **MX records** for email (if needed)
- **TXT records** for verification and security

DNS changes typically propagate within 24 hours, though some registrars process changes faster.

### Verifying Domain Connection

After DNS propagation completes, visit your domain in a web browser to confirm the website loads correctly. You should see your AstroPharma application without any SSL warnings.

---

## Part 5: SSL/TLS Security Certificate

### Automatic Certificate Setup

Railway automatically provisions free SSL/TLS certificates using Let's Encrypt. Once your domain is connected, Railway generates and manages the certificate automatically, renewing it before expiration.

### Verifying HTTPS

Visit your domain using `https://yourdomain.com` and verify that:

- The page loads without security warnings
- The browser shows a padlock icon indicating a secure connection
- The certificate details show valid dates and your domain name

### Enforcing HTTPS

Configure your application to redirect all HTTP traffic to HTTPS. This ensures users always access your site securely. Most hosting providers, including Railway, handle this automatically.

---

## Part 6: Application Deployment and Verification

### Automatic Deployment Process

When you push code to the main branch of your GitHub repository, Railway automatically detects the changes and initiates a deployment. The process includes:

1. **Build Phase:** Your application is compiled and dependencies are installed
2. **Test Phase:** Build artifacts are verified
3. **Deploy Phase:** The new version is deployed to production
4. **Health Check:** Railway verifies the application is responding correctly

### Monitoring Deployment

Access the **"Deployments"** tab in Railway to monitor the deployment progress. You can view real-time logs showing the build process, any errors encountered, and the deployment status.

### Verifying Application Functionality

After deployment completes, thoroughly test your application:

- Navigate through all pages and features
- Test user authentication and login functionality
- Verify product listings and shopping cart operations
- Test payment processing if applicable
- Check that all forms submit correctly
- Verify email notifications are sent

### Performance Monitoring

Railway provides built-in monitoring tools showing application performance metrics including response times, error rates, and resource usage. Review these metrics regularly to identify performance bottlenecks.

---

## Part 7: Ongoing Maintenance and Management

### Regular Updates

Keep your application secure and performant by regularly updating dependencies. Execute the following command monthly:

```bash
npm update
```

Review the update log for any breaking changes and test thoroughly before deploying to production.

### Security Monitoring

Enable security alerts in your GitHub repository to be notified of vulnerabilities in your dependencies. Address critical vulnerabilities immediately by updating the affected packages.

### Database Maintenance

Monitor database performance and execute optimization queries periodically. Railway provides database management tools accessible through the MySQL service dashboard.

### Backup Strategy

Railway automatically backs up your MySQL database daily. Test the backup restoration process quarterly to ensure you can recover data if needed. Download periodic backups for off-site storage as an additional safeguard.

### Uptime Monitoring

Use a third-party uptime monitoring service such as UptimeRobot to monitor your website availability. Configure alerts to notify you immediately if your site becomes unavailable.

---

## Part 8: Analytics and Performance Tracking

### Setting Up Google Analytics

Add Google Analytics to your website to track visitor behavior, traffic sources, and user engagement. This data helps you understand your audience and optimize your site accordingly.

### Search Engine Optimization

Submit your sitemap to Google Search Console to help search engines index your content. Monitor search performance, fix crawl errors, and track keyword rankings over time.

### Performance Optimization

Use tools like Google PageSpeed Insights to identify performance issues. Optimize images, minify CSS and JavaScript, and implement caching strategies to improve page load times.

---

## Part 9: Security Best Practices

### Application Security

Implement security headers to protect against common web vulnerabilities. Configure your application to set headers such as `X-Frame-Options`, `X-Content-Type-Options`, and `Content-Security-Policy`.

### API Security

Validate all user input to prevent injection attacks. Implement rate limiting on API endpoints to prevent abuse. Use HTTPS for all API communications.

### Database Security

Use strong, randomly generated passwords for database access. Restrict database connections to your application only. Enable encryption for database connections.

### Regular Security Audits

Periodically audit your application for security vulnerabilities. Use tools like OWASP ZAP or Burp Suite to identify potential issues. Address any findings promptly.

---

## Part 10: Scaling for Growth

### Monitoring Resource Usage

As your application grows, monitor CPU, memory, and database usage. Railway provides scaling options to increase resources as needed.

### Database Optimization

Implement database indexing for frequently queried columns. Monitor slow queries and optimize them for better performance.

### Content Delivery Network

Consider implementing a CDN like Cloudflare to cache static assets and improve global performance.

### Load Balancing

If traffic increases significantly, implement load balancing to distribute traffic across multiple application instances.

---

## Troubleshooting Common Issues

### Application Won't Start

Check the deployment logs for error messages. Verify that all required environment variables are configured correctly. Ensure the database connection string is valid and the database is accessible.

### Database Connection Errors

Verify the `DATABASE_URL` is correct and includes all necessary components. Confirm the MySQL database is running and accessible from your application. Check that the database user has appropriate permissions.

### Slow Performance

Monitor application logs for errors or warnings. Check database query performance and add indexes if needed. Review resource usage and consider scaling up if necessary.

### SSL Certificate Issues

Railway automatically manages SSL certificates, but if issues occur, check that your domain DNS is configured correctly. Verify the domain is properly connected in Railway settings.

---

## Useful Resources

- **Railway Documentation:** https://docs.railway.app
- **Node.js Best Practices:** https://nodejs.org/en/docs/
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **Google Analytics Help:** https://support.google.com/analytics
- **OWASP Security Guidelines:** https://owasp.org/

---

## Checklist for Going Live

- [ ] Environment variables configured in Railway
- [ ] Database migrations completed successfully
- [ ] Custom domain registered and DNS configured
- [ ] SSL certificate active and verified
- [ ] Application tested thoroughly
- [ ] Analytics configured
- [ ] Monitoring and alerts set up
- [ ] Backup strategy verified
- [ ] Security measures implemented
- [ ] Team trained on deployment procedures

---

## Next Steps

1. **Immediate:** Deploy your application to Railway following the steps above
2. **Week 1:** Configure custom domain and verify functionality
3. **Week 2:** Set up monitoring, analytics, and security measures
4. **Ongoing:** Monitor performance, apply updates, and optimize based on user feedback

Your AstroPharma website is now ready to serve your customers as a permanent, professional online presence.
