const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
app.use(cors());
app.use(express.json());

// ============ CONFIGURATION ============
const MANAGEMENT_EMAIL = "setramreclamation@gmail.com";
const SENDER_EMAIL = "setramreclamation@gmail.com";
const DEEPSEEK_API_KEY = "sk-8a71717d64fb4501b8068777c5415b22";

// In‑memory storage (data resets on redeploy – use Vercel KV for persistence later)
let feedbacks = [];

// ============ AI QUESTION GENERATION (Derja) ============
async function generateDerjaQuestions(feedback) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'أنت مساعد ذكي لترامواي مستغانم. تحدث بالدارجة الجزائرية. اطرح 3 أسئلة قصيرة.' },
          { role: 'user', content: `الملاحظة: "${feedback}"\n\nاكتب 3 أسئلة فقط بالدارجة الجزائرية، كل سؤال في سطر منفصل.` }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });
    const data = await response.json();
    const content = data.choices[0].message.content;
    let questions = content.split('\n').filter(q => q.trim() && (q.includes('؟') || q.includes('?')));
    if (questions.length === 0) questions = [content.trim()];
    return questions.slice(0, 3);
  } catch (error) {
    console.error('DeepSeek error, using fallback questions:', error.message);
    return ["شنو وقت المشكلة بالضبط؟", "في أي محطة طرالك هاد المشكل؟", "شنو رأيك كيفاش نحسنو الخدمة؟"];
  }
}

// ============ EMAIL SENDING ============
async function sendFeedbackEmail(feedbackData) {
  const emailPass = process.env.EMAIL_PASS;
  if (!emailPass) {
    console.log("⚠️ EMAIL_PASS not set. Email not sent.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: SENDER_EMAIL, pass: emailPass },
    timeout: 10000,
    socketTimeout: 10000
  });

  const html = `
    <div dir="rtl">
      <h2>🚊 ملاحظة جديدة من ${feedbackData.name}</h2>
      <p><strong>البريد:</strong> ${feedbackData.email}</p>
      <p><strong>الملاحظة:</strong> ${feedbackData.initialFeedback}</p>
      ${feedbackData.answers ? `<p><strong>ردود إضافية:</strong> ${JSON.stringify(feedbackData.answers)}</p>` : ''}
      <p><strong>التاريخ:</strong> ${new Date().toLocaleString('ar-DZ')}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"SETRAM Mostaganem" <${SENDER_EMAIL}>`,
      to: MANAGEMENT_EMAIL,
      subject: `[SETRAM] ملاحظة جديدة من ${feedbackData.name}`,
      html: html,
      text: feedbackData.initialFeedback
    });
    console.log("✅ Email sent to", MANAGEMENT_EMAIL);
    return true;
  } catch (error) {
    console.error("Email send error:", error.message);
    return false;
  }
}

// ============ API ROUTES ============
app.post('/api/questions', async (req, res) => {
  const { feedback } = req.body;
  if (!feedback) return res.status(400).json({ error: 'Feedback required' });
  const questions = await generateDerjaQuestions(feedback);
  res.json({ questions });
});

app.post('/api/feedback', async (req, res) => {
  const { name, email, role, initialFeedback, answers, station, severity } = req.body;
  if (!name || !email || !initialFeedback) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newFeedback = {
    id: Date.now().toString(),
    name,
    email,
    role: role || 'مسافر',
    initialFeedback,
    answers: answers || [],
    station: station || 'غير محدد',
    severity: severity || 'medium',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  feedbacks.unshift(newFeedback);

  // Try to send email (don't block response)
  const emailSent = await sendFeedbackEmail(newFeedback);

  res.json({
    success: true,
    feedbackId: newFeedback.id,
    emailSent: emailSent,
    message: 'تم استلام ملاحظتك بنجاح!'
  });
});

app.get('/api/feedbacks', (req, res) => {
  res.json({ feedbacks });
});

app.put('/api/feedbacks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const fb = feedbacks.find(f => f.id === id);
  if (fb) {
    fb.status = status;
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    highUrgency: feedbacks.filter(f => f.severity === 'high').length,
    thisMonth: feedbacks.filter(f => new Date(f.createdAt).getMonth() === new Date().getMonth()).length
  };
  res.json(stats);
});

app.get('/api/stations', (req, res) => {
  res.json([
    "محطة الحافلات", "لاصال", "خروبة", "بن عسكور", "صافي", "جامعة مستغانم",
    "حي بلخير", "حي 20 أوت", "حي 5 جويلية", "حي البرتقال", "حي الأمير عبد القادر",
    "محطة SNTF", "وسط المدينة", "ساحة 24 فيفري", "حي بن زرجب", "مستشفى مستغانم",
    "حي تيجاني", "حي 11 ديسمبر"
  ]);
});

module.exports = app;
