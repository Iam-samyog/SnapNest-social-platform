# Backend Environment Variables Configuration

This file documents all required environment variables for the SnapNest backend.

## Required Environment Variables

### Django Core
- `SECRET_KEY` - Django secret key (generate with: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
- `DEBUG` - Set to `False` in production
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts (e.g., `snapnest-backend-sbse.onrender.com,localhost`)

### Database
- `DATABASE_URL` - PostgreSQL connection string (format: `postgresql://user:password@host:port/database`)
  - On Render, this is automatically provided when you add a PostgreSQL database

### CORS Configuration
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of allowed frontend URLs (e.g., `https://snap-nest-social-platform-oo5n.vercel.app,http://localhost:3000`)
- `CORS_ALLOW_ALL_ORIGINS` - Set to `False` in production (only use `True` for development)

### Media Storage (Cloudinary)
- `CLOUDINARY_URL` - Cloudinary connection string (format: `cloudinary://api_key:api_secret@cloud_name`)
  - Get from: https://cloudinary.com/console

### Caching (Redis)
- `REDIS_URL` - Redis connection string (format: `redis://host:port/db`)
  - On Render, add a Redis instance and use the provided URL

### Email (Optional - for password reset)
- `EMAIL_HOST_USER` - SMTP username (e.g., Gmail address)
- `EMAIL_HOST_PASSWORD` - SMTP password (e.g., Gmail app password)
- `DEFAULT_FROM_EMAIL` - Default sender email address

### Social Authentication (Optional)
- `GOOGLE_CLIENT_ID` - Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 client secret
- `GITHUB_CLIENT_ID` - GitHub OAuth2 client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth2 client secret

## Example Configuration for Render

```bash
# Django Core
SECRET_KEY=your-generated-secret-key-here
DEBUG=False
ALLOWED_HOSTS=snapnest-backend-sbse.onrender.com

# Database (auto-provided by Render PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# CORS
CORS_ALLOWED_ORIGINS=https://snap-nest-social-platform-oo5n.vercel.app
CORS_ALLOW_ALL_ORIGINS=False

# Cloudinary
CLOUDINARY_URL=cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@your-cloud-name

# Redis
REDIS_URL=redis://red-xxxxxxxxxxxxx:6379

# Email (optional)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@snapnest.com
```

## How to Set Environment Variables on Render

1. Go to https://dashboard.render.com/
2. Select your backend service
3. Click on **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Enter the key and value
6. Click **Save Changes**
7. Render will automatically redeploy your service

## Generating a Secret Key

Run this command locally:

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

Copy the output and use it as your `SECRET_KEY`.

## Security Best Practices

1. **Never commit environment variables to Git**
2. **Use strong, random values for SECRET_KEY**
3. **Set DEBUG=False in production**
4. **Use specific CORS_ALLOWED_ORIGINS instead of CORS_ALLOW_ALL_ORIGINS=True**
5. **Rotate secrets regularly**
6. **Use environment-specific values** (different keys for dev/staging/prod)

## Troubleshooting

### "Invalid HTTP_HOST header"
- Check that `ALLOWED_HOSTS` includes your Render URL
- Make sure there are no extra spaces in the value

### "CORS policy" errors
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Ensure the URL matches exactly (including https://)
- No trailing slashes

### Database connection errors
- Verify `DATABASE_URL` is set correctly
- Check that PostgreSQL database is running on Render
- Ensure migrations have been run

### Redis connection errors
- Verify `REDIS_URL` is set correctly
- Check that Redis instance is running
- Alternatively, temporarily disable Redis-dependent features
