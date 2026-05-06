const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// ============ YOUR CREDENTIALS ============
const MANAGEMENT_EMAIL = "dicapriowissam@gmail.com";   // Where feedback emails go
const SENDER_EMAIL = "setramreclamation@gmail.com";    // Your Gmail that sends
const DEEPSEEK_API_KEY = "sk-8a71717d64fb4501b8068777c5415b22";

// ============ DATA STORAGE (Vercel uses /tmp) ============
// Since Vercel doesn't persist files across deployments, we'll keep in memory
// and optionally use Vercel KV or just store in /tmp (temporary)
let feedbacksStore = [];

const FEEDBACKS_FILE = '/tmp/feedbacks.json';

function loadFeedbacks() {
  try {
    if (fs.existsSync(FEEDBACKS_FILE)) {
      const data = fs.readFileSync(FEEDBACKS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed.feedbacks) {
        feedbacksStore = parsed.feedbacks;
        return parsed;
      }
    }
  } catch(e) { console.error(e); }
  return { feedbacks: feedbacksStore };
}

function saveFeedback(feedback) {
  const db = loadFeedbacks();
  feedback.id = Date.now().toString();
  feedback.createdAt = new Date().toISOString();
  feedback.status = 'pending';
  feedbacksStore.unshift(feedback);
  fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify({ feedbacks: feedbacksStore }, null, 2));
  return feedback;
}

function getAllFeedbacks() {
  loadFeedbacks();
  return feedbacksStore;
}

function updateStatus(id, status) {
  const fb = feedbacksStore.find(f => f.id === id);
  if (fb) { fb.status = status; fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify({ feedbacks: feedbacksStore }, null, 2)); return true; }
  return false;
}

// ============ DEEPSEEK AI (Derja) ============
async function generateDerjaQuestions(feedback) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Bearer 
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'أنت مساعد ذكي لترامواي مستغانم. تحدث بالدارجة الجزائرية. اسأل 3 أسئلة مفيدة.' },
          { role: 'user', content: الملاحظة: ""\n\nاكتب 3 أسئلة فقط بالدارجة الجزائرية، كل سؤال في سطر منفصل. }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    const data = await response.json();
    const content = data.choices[0].message.content;
    let questions = content.split('\n').filter(q => q.trim() && (q.includes('؟') || q.includes('?')));
    if (questions.length === 0) questions = [content.trim()];
    return questions.slice(0, 3);
  } catch (error) {
    console.error('DeepSeek error:', error);
    return ["شنو وقت المشكلة بالضبط؟", "في أي محطة طرالك هاد المشكل؟", "شنو رأيك كيفاش نحسنو الخدمة؟"];
  }
}

// ============ EMAIL SENDING using Gmail SMTP (works on Vercel) ============
async function sendFeedbackEmail(feedbackData) {
  const emailPass = process.env.EMAIL_PASS;
  if (!emailPass) {
    console.log("⚠️ EMAIL_PASS not set. Email not sent.");
    return false;
  }

  // Use SMTP instead of direct service
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: SENDER_EMAIL,
      pass: emailPass
    }
  });

  const emailHtml = 
    <!DOCTYPE html>
    <html dir="rtl">
    <head><meta charset="UTF-8"></head>
    <body>
      <h2>🚊 ملاحظة جديدة من </h2>
      <p><strong>البريد:</strong> </p>
      <p><strong>الملاحظة:</strong> </p>
      <hr>
      <p><strong>التاريخ:</strong> </p>
    </body>
    </html>
  ;

  try {
    await transporter.sendMail({
      from: \"SETRAM" <\>\,
      to: MANAGEMENT_EMAIL,
      subject: [SETRAM] ملاحظة جديدة من ,
      html: emailHtml
    });
    console.log("✅ Email sent to", MANAGEMENT_EMAIL);
    return true;
  } catch (error) {
    console.error("Email send error:", error.message);
    return false;
  }
}

// ============ API ROUTES ============
app.get('/api/stations', (req, res) => {
  res.json([
    "محطة الحافلات", "لاصال", "خروبة", "بن عسكور", "صافي", "جامعة مستغانم",
    "حي بلخير", "حي 20 أوت", "حي 5 جويلية", "حي البرتقال", "حي الأمير عبد القادر",
    "محطة SNTF", "وسط المدينة", "ساحة 24 فيفري", "حي بن زرجب", "مستشفى مستغانم",
    "حي تيجاني", "حي 11 ديسمبر"
  ]);
});

app.post('/api/questions', async (req, res) => {
  const { feedback } = req.body;
  if (!feedback) return res.status(400).json({ error: 'Feedback required' });
  const questions = await generateDerjaQuestions(feedback);
  res.json({ questions });
});

app.post('/api/feedback', async (req, res) => {
  const { name, email, role, initialFeedback, answers, station, severity } = req.body;
  if (!name || !email || !initialFeedback) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const feedbackData = { name, email, role: role || 'مسافر', initialFeedback, answers: answers || [], station: station || 'غير محدد', severity: severity || 'medium' };
  const saved = saveFeedback(feedbackData);
  const emailSent = await sendFeedbackEmail(feedbackData);
  res.json({ success: true, feedbackId: saved.id, emailSent });
});

app.get('/api/feedbacks', (req, res) => {
  res.json({ feedbacks: getAllFeedbacks() });
});

app.put('/api/feedbacks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  res.json({ success: updateStatus(id, status) });
});

app.get('/api/dashboard/stats', (req, res) => {
  const feedbacks = getAllFeedbacks();
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    highUrgency: feedbacks.filter(f => f.severity === 'high').length,
    thisMonth: feedbacks.filter(f => new Date(f.createdAt).getMonth() === new Date().getMonth()).length
  };
  res.json(stats);
});

// Export for Vercel serverless (no app.listen)
module.exports = app;
