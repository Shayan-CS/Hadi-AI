# Deployment Guide

This guide covers deploying the Hadi AI application to production.

## Overview

The application consists of two parts:
1. **Backend API** - Node.js/Express server
2. **Frontend** - React SPA

## Backend Deployment Options

### Option 1: Railway.app (Recommended)

1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

3. Navigate to backend directory:
   ```bash
   cd backend/api
   ```

4. Initialize Railway project:
   ```bash
   railway init
   ```

5. Add environment variables:
   ```bash
   railway variables set PORT=5000
   railway variables set NODE_ENV=production
   railway variables set SUPABASE_URL=your_url
   railway variables set SUPABASE_ANON_KEY=your_key
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
   railway variables set FRONTEND_URL=https://your-frontend-url.com
   ```

6. Deploy:
   ```bash
   railway up
   ```

### Option 2: Heroku

1. Install Heroku CLI
2. Create app:
   ```bash
   heroku create hadi-ai-api
   ```

3. Set environment variables:
   ```bash
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_ANON_KEY=your_key
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
   heroku config:set FRONTEND_URL=https://your-frontend-url.com
   ```

4. Create Procfile:
   ```
   web: npm start
   ```

5. Deploy:
   ```bash
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. Connect your GitHub repository
2. Select the backend/api directory
3. Set build command: `npm install && npm run build`
4. Set run command: `npm start`
5. Add environment variables in dashboard
6. Deploy

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

3. Create `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your backend URL)

### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

4. Add environment variables in Netlify dashboard

### Option 3: GitHub Pages with CloudFlare

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy to GitHub Pages
3. Use CloudFlare for environment variable injection

## Production Checklist

### Security
- [ ] Enable HTTPS on both backend and frontend
- [ ] Update CORS settings to allow only your frontend domain
- [ ] Rotate and secure all API keys
- [ ] Enable email confirmation in Supabase
- [ ] Set up rate limiting on API
- [ ] Enable Supabase RLS policies
- [ ] Review authentication settings

### Performance
- [ ] Enable caching headers
- [ ] Compress responses (gzip)
- [ ] Optimize images
- [ ] Enable CDN for static assets
- [ ] Monitor API response times
- [ ] Set up database connection pooling

### Monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure logging
- [ ] Set up uptime monitoring
- [ ] Enable Supabase monitoring
- [ ] Configure alerts for errors

### Backend Configuration
- [ ] Set NODE_ENV to 'production'
- [ ] Configure proper CORS origins
- [ ] Set up health check endpoint
- [ ] Enable request logging
- [ ] Configure proper error handling

### Frontend Configuration
- [ ] Update API_URL to production backend
- [ ] Enable production builds
- [ ] Configure proper redirects
- [ ] Test all authentication flows
- [ ] Verify asset loading

## Environment Variables

### Backend (.env.production)
```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env.production)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-api.railway.app/api
```

## Custom Domain Setup

### Backend
1. Add custom domain in hosting platform
2. Configure DNS records
3. Enable SSL certificate
4. Update FRONTEND_URL env variable
5. Update CORS settings

### Frontend
1. Add custom domain in hosting platform
2. Configure DNS records:
   - A record pointing to hosting IP
   - Or CNAME to hosting domain
3. Enable SSL certificate
4. Update API_URL if needed

## Post-Deployment Testing

1. **Authentication Flow**
   - Sign up with new email
   - Verify email works
   - Sign in successfully
   - Sign out works

2. **Flashcard Features**
   - Load flashcards page
   - Generate flashcards
   - View flashcards
   - Navigate between cards
   - Flip cards

3. **Protected Routes**
   - Try accessing dashboard without auth
   - Verify redirect to signin
   - Test token expiration

4. **Error Handling**
   - Test with invalid credentials
   - Test network errors
   - Verify error messages display

## Rollback Plan

If issues occur:

1. **Frontend**: Revert to previous deployment in hosting dashboard
2. **Backend**: Roll back to previous version
3. **Database**: Supabase handles versioning automatically
4. Check logs for errors
5. Verify environment variables

## Monitoring Tools

Recommended services:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Uptime Robot** - Uptime monitoring
- **Supabase Dashboard** - Database monitoring
- **Google Analytics** - Usage analytics

## Backup Strategy

1. **Database**: Supabase automatic backups
2. **Code**: Git version control
3. **Environment Variables**: Keep secure backup
4. **Static Assets**: Version control or CDN backup

## Scaling Considerations

As usage grows:

1. **Backend**
   - Enable horizontal scaling
   - Use connection pooling
   - Add Redis for caching
   - Implement rate limiting

2. **Frontend**
   - Use CDN for assets
   - Enable code splitting
   - Optimize bundle size
   - Implement lazy loading

3. **Database**
   - Monitor query performance
   - Add indexes as needed
   - Upgrade Supabase plan if needed
   - Consider read replicas

## Cost Optimization

### Free Tier Limits
- **Supabase Free**: 500MB database, 2GB bandwidth
- **Vercel Free**: 100GB bandwidth
- **Railway Free**: $5 credit/month

### Upgrade Triggers
- Database size > 500MB
- API calls > 50k/month
- Bandwidth > 100GB/month

## Support

For deployment issues:
- Check platform documentation
- Review logs in hosting dashboard
- Verify environment variables
- Test locally with production env variables
- Contact hosting support if needed
