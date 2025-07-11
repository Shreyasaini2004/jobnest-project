# Deployment Guide

## Frontend (Vercel) Setup

### 1. Environment Variables
Set these environment variables in your Vercel project settings:

```bash
VITE_API_URL=https://your-render-backend-url.onrender.com
```

### 2. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Domain Configuration
Your Vercel domain should be added to the CORS origins in your backend.

## Backend (Render) Setup

### 1. Environment Variables
Set these in your Render service:

```bash
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=production
```

### 2. Build Settings
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### 3. CORS Configuration
Your backend already includes CORS configuration for Vercel domains. If you need to add a new domain, update the CORS origins in `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://your-vercel-domain.vercel.app",
    "https://your-vercel-domain-pbpi697pb-tsinghalbe22s-projects.vercel.app"
  ],
  credentials: true
}));
```

## Testing the Deployment

1. **Check API Connection**: Visit your Vercel app and check the browser console for API connection logs
2. **Test Authentication**: Try logging in to ensure the API calls work
3. **Test Job Application**: Submit a job application to verify the endpoint works

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure your Vercel domain is in the CORS origins list
2. **API Timeout**: The timeout is set to 30 seconds for production
3. **Environment Variables**: Double-check that `VITE_API_URL` is set correctly in Vercel

### Debug Steps:

1. Check browser console for API call logs
2. Verify the backend URL in the logs matches your Render URL
3. Test the API endpoint directly: `https://your-render-url.onrender.com/api/hello`

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Environment variables set in Render
- [ ] CORS origins updated with Vercel domain
- [ ] API endpoints tested
- [ ] Authentication flow tested
- [ ] Job application submission tested 