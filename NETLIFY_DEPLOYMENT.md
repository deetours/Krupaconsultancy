# 🚀 Netlify Deployment Guide for Krupa Consultancy

## ✅ Pre-Deployment Checklist

- [x] `netlify.toml` created ✓
- [x] `next.config.mjs` updated with `output: 'standalone'` ✓
- [x] Code pushed to GitHub ✓
- [x] Project builds successfully locally ✓

---

## 📋 Step-by-Step Netlify Deployment

### Step 1: Go to Netlify Dashboard
1. Visit [https://netlify.com](https://netlify.com)
2. Sign in or create a free account
3. Click **"New site from Git"**

### Step 2: Connect Your GitHub Repository
1. Select **GitHub** as your Git provider
2. Click **"Authorize Netlify"** and sign in to GitHub
3. Search for **"Krupaconsultancy"** repository
4. Select **"deetours/Krupaconsultancy"** repository
5. Click **"Install"** and **"Connect"**

### Step 3: Configure Build Settings
Netlify should auto-detect the configuration from `netlify.toml`, but verify these settings:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** `18.17.0` (or higher)
- **Functions directory:** `netlify/functions`

### Step 4: Add Environment Variables
In Netlify Dashboard → **Site Settings → Build & Deploy → Environment:**

Add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://cqvkeejqmegisyjgqgrm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxdmtlZWpxbWVnaXN5amdxZ3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTE5NjQsImV4cCI6MjA4MzcyNzk2NH0.iy7llvtd6QOth2B_meQcv64N1EdWSLVW81i3K9GlgN0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENROUTER_API_KEY=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
```

**Note:** Replace these with your actual credentials from Supabase and OpenRouter.

### Step 5: Deploy
1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once complete, you'll get a live URL like:
   ```
   https://yourproject.netlify.app
   ```

### Step 6: Verify Deployment

Once deployed, test these endpoints:

```bash
# Test the homepage
curl https://yourproject.netlify.app

# Test API endpoint
curl https://yourproject.netlify.app/api/test

# Test extraction endpoint
curl -X POST https://yourproject.netlify.app/api/ai/extract \
  -H "Content-Type: application/json" \
  -d '{"file_name":"test.pdf"}'

# Test dashboard
curl https://yourproject.netlify.app/api/dashboard/admin
```

---

## 🔗 Connecting Custom Domain (Optional)

1. In Netlify Dashboard → **Domain Settings**
2. Add your custom domain (e.g., `krupaconsultancy.com`)
3. Update DNS records at your domain provider:
   - Point `A` record to Netlify's IP
   - Or use Netlify's DNS nameservers
4. Enable HTTPS (automatic with Let's Encrypt)

---

## 📊 Monitoring & Troubleshooting

### Check Build Logs
1. Go to **Deployments** tab
2. Click the latest deployment
3. View full build logs

### Common Issues

| Issue | Solution |
|-------|----------|
| **Build fails** | Check `.env.local` - ensure all required vars are set in Netlify Dashboard |
| **404 on API routes** | Verify `netlify.toml` has `@netlify/plugin-nextjs` |
| **Slow build** | Check if dependencies are being installed correctly; may need to clear cache |
| **CORS errors** | Add CORS headers to `next.config.mjs` or API routes |

### View Real-time Logs
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# View logs
netlify logs
```

---

## 📈 Performance Tips

1. **Enable Function Caching:**
   - Netlify Dashboard → Build & Deploy → Post Processing
   - Enable "Next.js Image Optimization"

2. **Set Build Timeouts:**
   - Default: 15 minutes
   - Increase if needed in Site Settings

3. **Enable Branch Deploys:**
   - Automatically deploy PRs for testing
   - Netlify Dashboard → Deploy Settings

4. **Monitor Serverless Function Usage:**
   - Netlify Dashboard → Analytics
   - Check function invocations and execution time

---

## 🚀 Automatic Deployments

Your site is now configured to automatically deploy when you push to the `main` branch:

```bash
# Push code
git add .
git commit -m "Update feature"
git push origin main

# Netlify automatically detects the change and deploys!
```

---

## 📞 Support

- **Netlify Docs:** https://docs.netlify.com
- **Next.js on Netlify:** https://docs.netlify.com/frameworks/next-js/overview/
- **Contact Netlify Support:** https://netlify.com/support

---

## ✅ Final Checklist

- [ ] GitHub repo connected to Netlify
- [ ] Environment variables set
- [ ] Build completes successfully
- [ ] Homepage loads without errors
- [ ] API routes respond correctly
- [ ] Database queries work (Supabase connected)
- [ ] File uploads work (Supabase Storage)
- [ ] Custom domain configured (if desired)
- [ ] HTTPS enabled
- [ ] Monitoring setup complete

---

**Your site is now live and automatically deploying on every push to main!** 🎉
