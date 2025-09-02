# RestaurantOS Deployment Guide

## 🚀 Deployment Options

### 1. **Bolt Hosting** (Recommended)
- **Automatic Deployment**: Deploy directly from this interface
- **Global CDN**: Fast content delivery worldwide
- **SSL Certificates**: Automatic HTTPS setup
- **Custom Domains**: Connect your own domain
- **Zero Configuration**: No server management required

### 2. **Vercel** (Alternative)
- **Git Integration**: Deploy from GitHub automatically
- **Serverless Functions**: API endpoints if needed
- **Preview Deployments**: Test changes before going live
- **Analytics**: Built-in performance monitoring

### 3. **Netlify** (Alternative)
- **Continuous Deployment**: Auto-deploy from Git
- **Form Handling**: Built-in form processing
- **Split Testing**: A/B testing capabilities
- **Edge Functions**: Serverless computing

---

## 🔧 Pre-Deployment Checklist

### Environment Setup
- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Sample data loaded (optional)
- [ ] SSL certificates ready

### Code Preparation
- [ ] All TypeScript errors resolved
- [ ] Build process successful (`npm run build`)
- [ ] Tests passing (if applicable)
- [ ] Performance optimized
- [ ] Security review completed

### Database Preparation
- [ ] Production database created
- [ ] Migration scripts executed
- [ ] Row Level Security policies enabled
- [ ] Backup strategy implemented
- [ ] Monitoring configured

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Supabase Production Database

#### Create Production Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and region
4. Set strong database password
5. Wait for project initialization (2-3 minutes)

#### Deploy Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy content from `supabase/migrations/create_complete_restaurant_schema.sql`
3. Paste and execute the SQL script
4. Verify all tables are created in Table Editor
5. Check Row Level Security policies are enabled

#### Configure Authentication
1. Go to Authentication → Settings
2. Disable email confirmations for faster testing
3. Configure redirect URLs for your domain
4. Set up email templates (optional)

### Step 2: Configure Environment Variables

#### Production Environment File
```env
# Production Supabase
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Application Settings
VITE_APP_NAME=YourRestaurantName
VITE_TENANT_ID=your_tenant_id
VITE_LOCATION_ID=your_location_id

# Production APIs (if applicable)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_ANALYTICS_ID=GA-PROD-ID
```

### Step 3: Build and Deploy

#### Using Bolt Hosting
1. Click "Deploy" button in this interface
2. Wait for build and deployment to complete
3. Test the deployed application
4. Configure custom domain (optional)

#### Using Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# ... add all required variables

# Redeploy with environment variables
vercel --prod
```

#### Using Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build application
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
# Site settings → Environment variables
```

### Step 4: Post-Deployment Configuration

#### Domain Setup
1. **Custom Domain**: Point your domain to deployment URL
2. **SSL Certificate**: Ensure HTTPS is enabled
3. **DNS Configuration**: Set up proper DNS records
4. **Redirect Rules**: Configure www redirects

#### Performance Optimization
1. **CDN Configuration**: Enable global content delivery
2. **Caching Rules**: Set appropriate cache headers
3. **Compression**: Enable gzip/brotli compression
4. **Image Optimization**: Configure automatic image optimization

#### Monitoring Setup
1. **Uptime Monitoring**: Set up uptime checks
2. **Error Tracking**: Configure Sentry or similar
3. **Performance Monitoring**: Set up Core Web Vitals tracking
4. **Analytics**: Configure Google Analytics or similar

---

## 🔍 Testing Deployment

### Functional Testing Checklist

#### Customer Flow
- [ ] QR code scanning works
- [ ] Menu loads correctly
- [ ] Items can be added to cart
- [ ] Orders can be placed
- [ ] Order tracking works
- [ ] Payment processing works

#### Staff Flow
- [ ] Login works with demo credentials
- [ ] Dashboard loads correctly
- [ ] Orders appear in management interface
- [ ] Kitchen dashboard shows orders
- [ ] Order status can be updated
- [ ] Real-time updates work

#### Admin Flow
- [ ] Menu management works
- [ ] Staff management functions
- [ ] Analytics display correctly
- [ ] Customization tools work
- [ ] Settings can be updated

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Real-time updates < 1 second delay
- [ ] Mobile responsiveness works
- [ ] Cross-browser compatibility
- [ ] Offline functionality (basic)

---

## 🛡️ Security Configuration

### Production Security Checklist

#### Database Security
- [ ] Row Level Security enabled on all tables
- [ ] Service role key secured (not exposed to frontend)
- [ ] Database password is strong and unique
- [ ] Backup encryption enabled
- [ ] Access logs enabled

#### Application Security
- [ ] Environment variables secured
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Content Security Policy implemented

#### Access Control
- [ ] Default admin account secured
- [ ] Staff accounts have minimum required permissions
- [ ] Session timeouts configured
- [ ] Failed login attempt limits set
- [ ] Audit logging enabled

---

## 📊 Monitoring & Maintenance

### Health Checks

#### Application Health
```typescript
// Health check endpoint
const healthCheck = async () => {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
    
    if (error) throw error
    
    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    }
  } catch (err) {
    return {
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString()
    }
  }
}
```

#### Monitoring Metrics
- **Response Times**: API and page load times
- **Error Rates**: 4xx and 5xx error percentages
- **Database Performance**: Query execution times
- **Real-time Connections**: WebSocket connection health
- **User Activity**: Active users and session duration

### Backup Strategy

#### Database Backups
- **Automatic Backups**: Daily automated backups via Supabase
- **Point-in-Time Recovery**: Restore to any point in time
- **Cross-Region Replication**: Backup to different geographic region
- **Backup Testing**: Regular restore testing

#### Application Backups
- **Code Repository**: Git-based version control
- **Asset Backups**: Regular backup of uploaded images
- **Configuration Backups**: Environment and settings backup
- **Documentation Backups**: Keep documentation up to date

---

## 🔄 Update & Maintenance Procedures

### Application Updates

#### Code Updates
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies
npm install

# 3. Run tests
npm test

# 4. Build application
npm run build

# 5. Deploy to staging
vercel --prod --target staging

# 6. Test staging deployment
# Run full test suite

# 7. Deploy to production
vercel --prod
```

#### Database Updates
```sql
-- 1. Create migration file
-- supabase/migrations/add_new_feature.sql

-- 2. Test migration on staging
-- Run migration on staging database

-- 3. Backup production database
-- Create backup before migration

-- 4. Run migration on production
-- Execute migration script

-- 5. Verify migration success
-- Check all tables and data integrity
```

### Maintenance Windows
- **Scheduled Maintenance**: Monthly maintenance windows
- **Emergency Updates**: Critical security patches
- **Feature Releases**: Quarterly feature deployments
- **Database Maintenance**: Weekly optimization tasks

---

## 📞 Support & Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite
npm run build
```

#### Database Connection Issues
```typescript
// Test Supabase connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('count')
      .single()
    
    console.log('Database connected:', !error)
  } catch (err) {
    console.error('Database connection failed:', err)
  }
}
```

#### Real-time Issues
```typescript
// Debug real-time subscriptions
const debugSubscription = supabase
  .channel('debug')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    console.log('Real-time event:', payload)
  })
  .subscribe((status) => {
    console.log('Subscription status:', status)
  })
```

### Support Resources
- **Documentation**: Complete setup and usage guides
- **GitHub Issues**: Bug reports and feature requests
- **Email Support**: Direct technical assistance
- **Community Forum**: User discussions and solutions
- **Video Tutorials**: Step-by-step video guides

---

## 🎯 Success Metrics

### Deployment Success Criteria
- [ ] Application loads without errors
- [ ] All pages render correctly
- [ ] Database connections work
- [ ] Real-time features function
- [ ] Payment processing works
- [ ] Mobile responsiveness verified
- [ ] Performance targets met
- [ ] Security checks passed

### Post-Deployment Monitoring
- **Uptime**: Target 99.9% availability
- **Performance**: < 3 second page load times
- **Error Rate**: < 1% error rate
- **User Satisfaction**: > 4.5/5 rating
- **Conversion Rate**: Order completion rate > 85%

---

*This deployment guide ensures a smooth transition from development to production with minimal downtime and maximum reliability.*