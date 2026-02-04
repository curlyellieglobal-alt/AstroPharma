# AstroPharma Production Deployment Checklist

## Overview

This checklist ensures your AstroPharma website is properly configured and deployed as a permanent, production-ready website. Follow each section carefully to guarantee a secure, stable, and professional online presence.

---

## Phase 1: Pre-Deployment Verification

### Code Quality and Security

- [ ] **Review all environment variables** - Ensure no sensitive data is hardcoded in the source code
- [ ] **Run security audit** - Execute `npm audit` to check for vulnerable dependencies
- [ ] **Update dependencies** - Run `npm update` to ensure all packages are current
- [ ] **Test all features** - Verify that all website functionality works as expected
- [ ] **Check error handling** - Ensure proper error messages are displayed to users
- [ ] **Verify CORS settings** - Confirm Cross-Origin Resource Sharing is properly configured
- [ ] **Review database schema** - Ensure all tables and relationships are correct

### Performance Optimization

- [ ] **Optimize images** - Compress all images for faster loading
- [ ] **Minify CSS and JavaScript** - Verify build process produces minified files
- [ ] **Enable caching** - Configure browser caching headers
- [ ] **Test page load speed** - Use tools like Google PageSpeed Insights
- [ ] **Check database indexes** - Ensure critical queries use proper indexes

### SEO and Accessibility

- [ ] **Add meta tags** - Include proper title, description, and keywords
- [ ] **Configure sitemap** - Ensure `sitemap.xml` is generated correctly
- [ ] **Set up robots.txt** - Configure search engine crawling rules
- [ ] **Test accessibility** - Verify WCAG 2.1 compliance
- [ ] **Check mobile responsiveness** - Test on various devices and screen sizes

---

## Phase 2: Hosting Infrastructure Setup

### Choose a Hosting Provider

**Recommended Options:**

| Provider | Pros | Cons | Best For |
|----------|------|------|----------|
| **Railway** | Easy setup, GitHub integration, MySQL support | Limited free tier | Quick deployment, startups |
| **Vercel** | Excellent for React, serverless, free tier | Limited backend support | Frontend-heavy applications |
| **AWS** | Scalable, feature-rich, global CDN | Complex setup, steeper learning curve | Enterprise applications |
| **DigitalOcean** | Affordable, straightforward, good documentation | Requires more manual setup | Developers who prefer control |
| **Heroku** | Simple deployment, good for prototypes | Expensive, slower performance | Rapid prototyping |

**Recommended for AstroPharma:** Railway (already configured) or AWS EC2 with RDS for MySQL.

### Database Setup

- [ ] **Create MySQL database** - Use a managed service (Railway MySQL, AWS RDS, or similar)
- [ ] **Set secure password** - Use a strong, randomly generated password
- [ ] **Enable backups** - Configure automated daily backups
- [ ] **Test connection** - Verify `DATABASE_URL` works correctly
- [ ] **Run migrations** - Execute `npm run db:push` to create tables
- [ ] **Verify data integrity** - Confirm all tables were created successfully

### Environment Variables Configuration

Create a secure `.env` file (never commit to Git) with the following variables:

```env
# Database Configuration
DATABASE_URL=mysql://username:password@hostname:3306/database_name

# Authentication Configuration
JWT_SECRET=generate_a_long_random_string_here_min_32_chars
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://auth.manus.im
OWNER_OPEN_ID=your_owner_open_id

# Storage Configuration
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_manus_api_key

# Environment Settings
NODE_ENV=production
PORT=3000
```

**Security Tips:**
- Generate `JWT_SECRET` using: `openssl rand -base64 32`
- Never share these values with anyone
- Use different values for development and production
- Rotate `JWT_SECRET` periodically

---

## Phase 3: Deployment Configuration

### Build and Deploy

- [ ] **Test build locally** - Run `npm run build` and verify no errors
- [ ] **Check build output** - Ensure `dist/` directory contains all necessary files
- [ ] **Verify start script** - Confirm `npm run start` works correctly
- [ ] **Test in production mode** - Run application with `NODE_ENV=production`
- [ ] **Deploy to hosting** - Push to GitHub and trigger deployment

### Post-Deployment Verification

- [ ] **Check application health** - Visit the deployed URL and verify it loads
- [ ] **Test all routes** - Navigate through all pages and features
- [ ] **Verify database connection** - Confirm data is being saved and retrieved
- [ ] **Check error logs** - Review deployment logs for any warnings
- [ ] **Test API endpoints** - Verify backend endpoints respond correctly
- [ ] **Monitor performance** - Check application response times

---

## Phase 4: Domain and SSL Configuration

### Custom Domain Setup

- [ ] **Register domain** - Purchase a domain from a registrar (GoDaddy, Namecheap, etc.)
- [ ] **Update DNS records** - Point domain to your hosting provider
- [ ] **Wait for DNS propagation** - Allow 24-48 hours for changes to propagate
- [ ] **Verify domain** - Confirm the domain resolves to your website

### SSL/TLS Certificate

- [ ] **Enable HTTPS** - Most hosting providers provide free SSL certificates
- [ ] **Verify certificate** - Check that HTTPS works and certificate is valid
- [ ] **Set up redirects** - Redirect HTTP traffic to HTTPS
- [ ] **Test security** - Use SSL Labs to verify certificate configuration

### Email Configuration (if needed)

- [ ] **Set up email service** - Configure SendGrid, AWS SES, or similar
- [ ] **Test email sending** - Send test emails to verify functionality
- [ ] **Configure SPF/DKIM** - Set up email authentication records
- [ ] **Monitor email delivery** - Track email sending and bounces

---

## Phase 5: Security Hardening

### Application Security

- [ ] **Enable CORS** - Configure allowed origins
- [ ] **Set security headers** - Add X-Frame-Options, X-Content-Type-Options, etc.
- [ ] **Implement rate limiting** - Prevent abuse and DDoS attacks
- [ ] **Validate input** - Ensure all user inputs are properly validated
- [ ] **Sanitize output** - Prevent XSS attacks
- [ ] **Use HTTPS only** - Disable HTTP connections
- [ ] **Implement CSRF protection** - Add CSRF tokens to forms

### Database Security

- [ ] **Use strong passwords** - Ensure database password is complex
- [ ] **Limit database access** - Restrict connections to application only
- [ ] **Enable encryption** - Use SSL for database connections
- [ ] **Regular backups** - Verify automated backup system works
- [ ] **Test recovery** - Confirm backups can be restored

### API Security

- [ ] **Implement authentication** - Verify all endpoints require proper auth
- [ ] **Use API keys** - Secure external API calls with keys
- [ ] **Log API access** - Monitor API usage for suspicious activity
- [ ] **Rate limit APIs** - Prevent abuse of API endpoints
- [ ] **Validate API requests** - Check request format and content

---

## Phase 6: Monitoring and Maintenance

### Performance Monitoring

- [ ] **Set up monitoring** - Use tools like New Relic, DataDog, or similar
- [ ] **Configure alerts** - Set up alerts for errors and performance issues
- [ ] **Monitor uptime** - Use uptime monitoring service (UptimeRobot, etc.)
- [ ] **Track metrics** - Monitor response times, error rates, and resource usage
- [ ] **Review logs regularly** - Check application and server logs

### Regular Maintenance

- [ ] **Update dependencies** - Run `npm update` monthly
- [ ] **Security patches** - Apply security updates immediately
- [ ] **Database maintenance** - Run optimization queries periodically
- [ ] **Backup verification** - Test backup restoration monthly
- [ ] **Performance tuning** - Optimize slow queries and endpoints

### Incident Response

- [ ] **Create incident response plan** - Document procedures for common issues
- [ ] **Set up escalation** - Define who to contact for critical issues
- [ ] **Document solutions** - Keep a log of issues and their resolutions
- [ ] **Test recovery procedures** - Regularly practice disaster recovery

---

## Phase 7: Analytics and SEO

### Analytics Setup

- [ ] **Install Google Analytics** - Track website traffic and user behavior
- [ ] **Configure conversion tracking** - Set up goals and events
- [ ] **Set up Search Console** - Monitor search performance and indexing
- [ ] **Monitor user flow** - Understand how users navigate your site
- [ ] **Track key metrics** - Monitor bounce rate, session duration, etc.

### SEO Optimization

- [ ] **Submit sitemap** - Add `sitemap.xml` to Search Console
- [ ] **Verify robots.txt** - Ensure search engines can crawl your site
- [ ] **Check indexing** - Verify pages are indexed in Google
- [ ] **Monitor rankings** - Track keyword rankings over time
- [ ] **Fix crawl errors** - Address any errors reported in Search Console

---

## Phase 8: Backup and Disaster Recovery

### Backup Strategy

- [ ] **Enable automated backups** - Configure daily backups for database
- [ ] **Store backups securely** - Use encrypted storage for backups
- [ ] **Test restoration** - Verify backups can be restored successfully
- [ ] **Document procedures** - Create clear backup and recovery procedures
- [ ] **Monitor backup status** - Set up alerts for failed backups

### Disaster Recovery Plan

- [ ] **Document recovery procedures** - Create step-by-step recovery guide
- [ ] **Identify critical systems** - Prioritize what needs to be recovered first
- [ ] **Estimate recovery time** - Define RTO (Recovery Time Objective)
- [ ] **Practice recovery** - Conduct regular disaster recovery drills
- [ ] **Maintain documentation** - Keep recovery plan up to date

---

## Phase 9: Team and Documentation

### Documentation

- [ ] **Create deployment guide** - Document how to deploy changes
- [ ] **Document architecture** - Explain system design and components
- [ ] **Create troubleshooting guide** - Document common issues and solutions
- [ ] **Maintain API documentation** - Keep API endpoints documented
- [ ] **Document environment setup** - Explain how to set up development environment

### Team Training

- [ ] **Train team members** - Ensure team understands deployment process
- [ ] **Share credentials securely** - Use password manager for sensitive data
- [ ] **Document access procedures** - Explain how to access production systems
- [ ] **Create runbooks** - Document procedures for common tasks
- [ ] **Schedule regular reviews** - Review and update documentation periodically

---

## Phase 10: Go-Live Checklist

### Final Pre-Launch

- [ ] **Conduct final testing** - Perform comprehensive testing of all features
- [ ] **Test on production** - Verify everything works in production environment
- [ ] **Verify analytics** - Confirm tracking is working correctly
- [ ] **Check email notifications** - Test all email functionality
- [ ] **Verify backups** - Confirm backups are running successfully

### Launch Day

- [ ] **Monitor closely** - Watch for errors and issues
- [ ] **Have support ready** - Ensure team is available for issues
- [ ] **Communicate status** - Keep stakeholders informed
- [ ] **Document issues** - Record any problems encountered
- [ ] **Celebrate launch** - Acknowledge successful deployment

### Post-Launch

- [ ] **Monitor for 24 hours** - Watch closely for any issues
- [ ] **Gather feedback** - Collect user feedback and issues
- [ ] **Fix critical issues** - Address any critical problems immediately
- [ ] **Plan improvements** - Identify areas for optimization
- [ ] **Review metrics** - Analyze initial performance data

---

## Useful Commands

### Local Testing

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server locally
NODE_ENV=production npm run start

# Run database migrations
npm run db:push

# Check for security vulnerabilities
npm audit

# Update dependencies
npm update
```

### Database Management

```bash
# Connect to database
mysql -h hostname -u username -p database_name

# Backup database
mysqldump -h hostname -u username -p database_name > backup.sql

# Restore database
mysql -h hostname -u username -p database_name < backup.sql
```

---

## Support Resources

- **Railway Documentation:** https://docs.railway.app
- **Node.js Best Practices:** https://nodejs.org/en/docs/guides/nodejs-web-app-automate-deployment/
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **Security Best Practices:** https://owasp.org/www-project-top-ten/
- **SSL/TLS Setup:** https://letsencrypt.org/

---

## Notes

- This checklist is comprehensive but not exhaustive. Adjust based on your specific needs.
- Regularly review and update this checklist as your application evolves.
- Keep all documentation up to date for team reference.
- Schedule regular reviews of security and performance settings.

**Last Updated:** February 2026
