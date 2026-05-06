# SETRAM Feedback Platform - Vercel Deployment Guide

## ⚡ Quick Start (10 Minutes)

### Step 1: Create GitHub Repository

```bash
# Create a new repository on GitHub
# https://github.com/new
# Name: setram-feedback-platform
# Description: AI-Powered Feedback Platform for SETRAM Mostaganem
```

### Step 2: Push Code to GitHub

```bash
# From your project directory
cd /home/ubuntu/setram-vercel

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/setram-feedback-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Paste your GitHub repository URL
4. Click "Import"

### Step 4: Configure Environment Variables

In the Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

| Variable | Value |
|----------|-------|
| `EMAIL_USER` | your_email@gmail.com |
| `EMAIL_PASSWORD` | Your Gmail app password |
| `ANTHROPIC_API_KEY` | Your Claude API key |
| `URGENT_EMAIL_RECIPIENT` | dicapriowissam@gmail.com |

### Step 5: Deploy

Click the "Deploy" button. Vercel will automatically:
- Build your project
- Deploy to production
- Provide you with a live URL

---

## 🔑 Getting Required Keys

### Gmail App Password

1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the generated 16-character password
5. Add to Vercel as `EMAIL_PASSWORD`

### Claude API Key

1. Visit https://console.anthropic.com/
2. Click "Create new API key"
3. Copy the key
4. Add to Vercel as `ANTHROPIC_API_KEY`

---

## 📊 Your Live Platform

Once deployed, you'll get a URL like:

```
https://setram-feedback-platform.vercel.app
```

This is your live SETRAM Feedback Platform!

### Features Available:

✅ AI-powered chat interface  
✅ Automatic Q&A documentation  
✅ Sentiment analysis  
✅ Email routing to management  
✅ Real-time feedback processing  
✅ Professional email templates  

---

## 🔍 Monitoring Your Deployment

### View Logs

In Vercel dashboard:
1. Select your project
2. Go to **Deployments**
3. Click on a deployment
4. View **Build Logs** or **Runtime Logs**

### Check API Health

```bash
curl https://your-domain.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-05-06T09:00:00.000Z",
  "service": "SETRAM Feedback Platform",
  "version": "2.0.0"
}
```

---

## 🚀 Continuous Deployment

After initial setup, every time you push to GitHub:

```bash
git add .
git commit -m "Update feedback platform"
git push origin main
```

Vercel automatically deploys your changes!

---

## 🐛 Troubleshooting

### Deployment Failed

1. Check **Build Logs** in Vercel dashboard
2. Verify all environment variables are set
3. Ensure `package.json` and `vercel.json` are correct

### Email Not Sending

1. Verify `EMAIL_USER` and `EMAIL_PASSWORD` in environment
2. Check Gmail app password (not regular password)
3. Ensure 2FA is enabled on Gmail

### AI Analysis Failing

1. Verify `ANTHROPIC_API_KEY` is correct
2. Check API key has credits
3. View runtime logs for error details

---

## 📈 Next Steps

1. **Test the Platform**
   - Visit your Vercel URL
   - Submit test feedback
   - Verify email delivery

2. **Customize**
   - Update colors and branding
   - Modify email templates
   - Add your categories

3. **Monitor**
   - Set up Vercel alerts
   - Monitor API usage
   - Track email delivery

4. **Scale**
   - Add database for persistence
   - Implement dashboard
   - Add user authentication

---

## 💡 Pro Tips

- Use `vercel env pull` to sync environment variables locally
- Enable "Automatic Git Integration" for instant deployments
- Set up custom domain in Vercel settings
- Use Vercel Analytics to monitor traffic

---

## 📞 Support

**Vercel Docs:** https://vercel.com/docs  
**Claude API Docs:** https://docs.anthropic.com/  
**Gmail Support:** https://support.google.com/mail  

---

**Version:** 2.0.0  
**Platform:** Vercel Serverless  
**Status:** ✅ Ready to Deploy
