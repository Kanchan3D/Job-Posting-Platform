# Backend Deployment to Vercel - Setup Guide

## Quick Setup Steps

### 1. Deploy Backend to Vercel

```bash
# Login to Vercel
vercel login

# Deploy backend (from backend directory)
cd backend
vercel --prod
```

### 2. Set Environment Variables in Vercel Dashboard

Go to your Vercel Project Settings → Environment Variables and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Set by vercel.json |
| `MONGODB_URI` | Your MongoDB connection string | Keep it secret! |
| `JWT_SECRET` | A strong random secret | Use `openssl rand -base64 32` to generate |
| `GEMINI_API_KEY` | Your Google Gemini API key | Get from https://aistudio.google.com/app/apikeys |
| `FRONTEND_URL` | `https://your-frontend-url.vercel.app` | Update with your actual frontend URL |
| `ALLOWED_ORIGINS` | `https://your-frontend-url.vercel.app` | Can add multiple comma-separated URLs |
| `PORT` | `3000` | Default - usually managed by Vercel |

### 3. Update Frontend API URL

In `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.vercel.app'
```

Or set `VITE_API_URL` environment variable in frontend Vercel project settings.

### 4. Deploy Frontend

```bash
cd frontend
vercel --prod
```

## Troubleshooting

### Backend not starting
- Check logs: `vercel logs <project-name>`
- Verify all env variables are set correctly
- Ensure MongoDB connection string is valid

### CORS errors
- Update `FRONTEND_URL` and `ALLOWED_ORIGINS` in Vercel env vars
- Make sure frontend URL is exactly as deployed (with https://)

### Resume uploads failing
- Ensure `/backend/uploads/resumes` directory exists
- Increase Vercel serverless function timeout (if needed)
- Check file size limits in recommendations routes

### MongoDB connection timeouts
- Add your Vercel IP to MongoDB Atlas whitelist
- Use `0.0.0.0` to allow all IPs (less secure but easier for testing)

## Environment Variables Explanation

```
NODE_ENV=production          # Tell app it's in production
MONGODB_URI=...              # Connection string for database
JWT_SECRET=...               # Secret key for JWT tokens (make it strong!)
GEMINI_API_KEY=...          # Google API key for AI features
FRONTEND_URL=https://...    # Frontend domain for CORS
ALLOWED_ORIGINS=https://... # Which domains can access the API
```

## Vercel Deployment Architecture

```
Your Domain (Custom)
    ↓
Vercel Edge Network
    ↓
Backend Serverless Function (Node.js)
    ↓
MongoDB Atlas (Cloud Database)
Google Gemini API (Cloud AI)
```

## Key Changes Made

- ✅ Fixed `vercel.json` to point to `src/server.js`
- ✅ Updated build configuration to include source files
- ✅ Created `.env.production` for prod configuration
- ✅ Server listens on dynamic PORT (Vercel compatible)
- ✅ CORS configured with `FRONTEND_URL` env variable

## Post-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Backend URL working (check `/health` endpoint)
- [ ] Frontend can connect to backend API
- [ ] Resume uploads working
- [ ] MongoDB queries working
- [ ] CORS errors resolved
- [ ] Custom domain configured (if needed)

## Custom Domain Setup

1. Go to Vercel Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in backend env vars if needed

## Monitoring

Check logs:
```bash
vercel logs your-backend-project-name --tail
```

Monitor from Vercel Dashboard:
- Deployments tab - see build/deploy status
- Analytics tab - monitor traffic and performance
- Logs tab - real-time error logs

## Performance Tips

- MongoDB: Use connection pooling
- Resume files: Consider uploading to S3/Vercel Blob
- API calls: Implement caching where possible
- Gemini API: Cache AI analysis results (already implemented ✓)

## Rollback

If deployment fails:
```bash
vercel rollback
```

## Support

For issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test `/health` endpoint
4. Check MongoDB connectivity
5. Review CORS settings
