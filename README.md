# SETRAM Feedback Platform - Vercel Deployment

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Platform:** Vercel Serverless  

---

## 🚀 Quick Deployment

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/setram-vercel.git
cd setram-vercel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy your project.

### 5. Set Environment Variables in Vercel

In your Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add:
   - `EMAIL_USER` - Your Gmail address
   - `EMAIL_PASSWORD` - Your Gmail app password
   - `ANTHROPIC_API_KEY` - Your Claude API key
   - `URGENT_EMAIL_RECIPIENT` - Manager email (dicapriowissam@gmail.com)

---

## 📋 Project Structure

```
setram-vercel/
├── api/
│   ├── feedback.js      # Feedback submission endpoint
│   ├── questions.js     # AI questions generation
│   └── health.js        # Health check endpoint
├── public/
│   └── index.html       # Frontend application
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies
├── .env.example         # Environment template
└── README.md            # This file
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/questions` | Generate clarifying questions |
| POST | `/api/feedback` | Submit feedback with Q&A |
| GET | `/api/health` | Health check |

---

## 📧 Email Setup

### Gmail Configuration

1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the generated password to `EMAIL_PASSWORD` in .env

---

## 🤖 AI Configuration

Get your Claude API key from: https://console.anthropic.com/

Add to `ANTHROPIC_API_KEY` in .env

---

## 🎯 Features

✅ AI-powered chat interface  
✅ Automatic Q&A documentation  
✅ Sentiment analysis  
✅ Email routing to management  
✅ Local storage persistence  
✅ Professional email templates  
✅ Real-time feedback processing  
✅ Serverless architecture  

---

## 📊 How It Works

1. User submits initial feedback
2. AI generates 3 clarifying questions
3. User answers each question
4. System generates Q&A documentation
5. AI analyzes sentiment and urgency
6. Professional email sent to manager
7. Feedback stored locally
8. Success confirmation shown

---

## 🔐 Security

- Environment variables for secrets
- CORS enabled for cross-origin requests
- No hardcoded credentials
- Secure email transmission
- API key protection

---

## 📈 Monitoring

Monitor your Vercel deployment:
1. Go to https://vercel.com/dashboard
2. Select your project
3. View logs and analytics

---

## 🐛 Troubleshooting

### Email Not Sending

- Verify Gmail app password (not regular password)
- Check EMAIL_USER and EMAIL_PASSWORD in Vercel environment
- Ensure 2FA is enabled on Gmail account

### AI Analysis Failing

- Verify ANTHROPIC_API_KEY is correct
- Check API key has sufficient credits
- Review Vercel logs for error details

### CORS Issues

- Check API_BASE_URL in frontend matches deployment URL
- Verify CORS headers in API handlers

---

## 📞 Support

**Issues?** Check the logs in Vercel dashboard  
**Questions?** Email: dicapriowissam@gmail.com  

---

**Built with:** Node.js, Express, Claude AI, Vercel  
**Deployed:** Vercel Serverless Platform  
**Last Updated:** May 6, 2026
