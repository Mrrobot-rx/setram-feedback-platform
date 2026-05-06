/**
 * SETRAM Feedback API - Vercel Serverless Handler
 * Handles feedback submission, AI analysis, and email routing
 * Uses DeepSeek API for AI analysis
 */

import axios from 'axios';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Generate clarifying questions using DeepSeek AI
 */
async function generateClarifyingQuestions(feedback) {
    try {
        const response = await axios.post('https://api.deepseek.com/chat/completions', {
            model: 'deepseek-chat',
            messages: [{
                role: 'system',
                content: `You are an AI assistant for SETRAM Mostaganem tramway feedback system. 
Generate exactly 3 clarifying questions to better understand the customer's feedback.
Return ONLY valid JSON with no markdown:
{"questions":["Q1","Q2","Q3"]}`
            },
            {
                role: 'user',
                content: `Feedback: ${feedback}`
            }],
            temperature: 0.7,
            max_tokens: 500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const text = response.data.choices[0].message.content;
        const clean = text.replace(/```json|```/g, '').trim();
        return JSON.parse(clean).questions;
    } catch (error) {
        console.error('Error generating questions:', error.message);
        return [
            'Can you provide more specific details?',
            'When did this occur?',
            'What would be an ideal resolution?'
        ];
    }
}

/**
 * Generate Q&A documentation from conversation using DeepSeek
 */
async function generateQADocumentation(feedback, answers) {
    try {
        const conversationText = `
Initial Feedback: ${feedback}

Questions and Answers:
${answers.map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`).join('\n\n')}
`;

        const response = await axios.post('https://api.deepseek.com/chat/completions', {
            model: 'deepseek-chat',
            messages: [{
                role: 'system',
                content: `You are a professional documentation specialist. 
Create a structured Q&A documentation from the feedback conversation.
Return ONLY valid JSON:
{
  "title":"Issue Title",
  "summary":"1-2 sentence summary",
  "category":"Safety|Maintenance|Hygiene|Staff|Schedule|Other",
  "severity":"Low|Medium|High|Critical",
  "qa_pairs":[{"question":"Q","answer":"A"}],
  "recommendations":["rec1","rec2"],
  "department":"Operations|Safety|Maintenance|CustomerService"
}`
            },
            {
                role: 'user',
                content: conversationText
            }],
            temperature: 0.7,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const text = response.data.choices[0].message.content;
        const clean = text.replace(/```json|```/g, '').trim();
        return JSON.parse(clean);
    } catch (error) {
        console.error('Error generating Q&A:', error.message);
        return {
            title: 'Feedback Received',
            summary: feedback.substring(0, 100),
            category: 'Other',
            severity: 'Medium',
            qa_pairs: answers,
            recommendations: ['Review and respond within 48 hours'],
            department: 'CustomerService'
        };
    }
}

/**
 * Analyze feedback sentiment using DeepSeek
 */
async function analyzeFeedbackSentiment(feedback) {
    try {
        const response = await axios.post('https://api.deepseek.com/chat/completions', {
            model: 'deepseek-chat',
            messages: [{
                role: 'system',
                content: `Analyze feedback and return ONLY valid JSON:
{
  "sentiment":"positive|neutral|negative",
  "urgency":true|false,
  "priority":"HIGH|MEDIUM|LOW",
  "keywords":["key1","key2"]
}`
            },
            {
                role: 'user',
                content: feedback
            }],
            temperature: 0.7,
            max_tokens: 300
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const text = response.data.choices[0].message.content;
        const clean = text.replace(/```json|```/g, '').trim();
        return JSON.parse(clean);
    } catch (error) {
        console.error('Error analyzing sentiment:', error.message);
        return {
            sentiment: 'neutral',
            urgency: false,
            priority: 'MEDIUM',
            keywords: []
        };
    }
}

/**
 * Generate professional email template
 */
function generateEmailTemplate(feedback, qaDoc, sentiment) {
    const urgencyColor = sentiment.urgency ? '#dc2626' : '#16a34a';
    const urgencyLabel = sentiment.urgency ? 'URGENT' : 'STANDARD';

    const qaHtml = qaDoc.qa_pairs.map((pair, idx) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; font-weight: 600; color: #003087; width: 30%;">Q${idx + 1}: ${pair.question}</td>
            <td style="padding: 12px; color: #475569;">${pair.answer}</td>
        </tr>
    `).join('');

    const recommendationsHtml = qaDoc.recommendations.map(rec => `
        <li style="margin: 8px 0; color: #475569;">• ${rec}</li>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', sans-serif; color: #0f172a; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; }
        .header { background: linear-gradient(135deg, #003087 0%, #001a4a 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 24px; border-radius: 0 0 8px 8px; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: 12px; margin: 8px 0; }
        .badge-urgent { background: #fee2e2; color: #dc2626; }
        .badge-standard { background: #dcfce7; color: #16a34a; }
        .qa-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .section-title { font-size: 16px; font-weight: 700; color: #003087; margin: 20px 0 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        .footer { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 20px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0 0 8px; font-size: 24px;">🚊 SETRAM Feedback Report</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 14px;">Mostaganem Tramway Network</p>
        </div>
        
        <div class="content">
            <div class="badge badge-${sentiment.urgency ? 'urgent' : 'standard'}">${urgencyLabel} - ${sentiment.priority}</div>
            
            <div class="section-title">📋 Feedback Summary</div>
            <p style="color: #475569; margin: 12px 0;">${qaDoc.summary}</p>
            
            <div class="section-title">📊 Classification</div>
            <table style="width: 100%; margin: 12px 0;">
                <tr>
                    <td style="padding: 8px; font-weight: 600; width: 40%;">Category:</td>
                    <td style="padding: 8px; color: #475569;">${qaDoc.category}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Severity:</td>
                    <td style="padding: 8px; color: #475569;">${qaDoc.severity}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Department:</td>
                    <td style="padding: 8px; color: #475569;">${qaDoc.department}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: 600;">Sentiment:</td>
                    <td style="padding: 8px; color: #475569;">${sentiment.sentiment}</td>
                </tr>
            </table>
            
            <div class="section-title">❓ Q&A Documentation</div>
            <table class="qa-table">
                ${qaHtml}
            </table>
            
            <div class="section-title">💡 Recommendations</div>
            <ul style="margin: 12px 0; padding-left: 20px;">
                ${recommendationsHtml}
            </ul>
            
            <div class="footer">
                <p style="margin: 0;"><strong>Submitted:</strong> ${new Date().toLocaleString('fr-DZ')}</p>
                <p style="margin: 8px 0 0;">This is an automated report from the SETRAM AI Feedback System powered by DeepSeek AI.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Send professional email to manager
 */
async function sendProfessionalEmail(feedback, qaDoc, sentiment) {
    try {
        const htmlContent = generateEmailTemplate(feedback, qaDoc, sentiment);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.URGENT_EMAIL_RECIPIENT,
            subject: `[${sentiment.urgency ? 'URGENT' : 'FEEDBACK'}] ${qaDoc.title} - SETRAM Mostaganem`,
            html: htmlContent,
            priority: sentiment.urgency ? 'high' : 'normal'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { name, email, role, initialFeedback, answers } = req.body;

        if (!initialFeedback || !answers || answers.length === 0) {
            return res.status(400).json({ error: 'Invalid feedback data' });
        }

        // Generate Q&A documentation
        const qaDoc = await generateQADocumentation(initialFeedback, answers);

        // Analyze sentiment
        const sentiment = await analyzeFeedbackSentiment(initialFeedback);

        // Send professional email
        const emailResult = await sendProfessionalEmail(initialFeedback, qaDoc, sentiment);

        res.status(200).json({
            success: true,
            feedbackId: uuidv4(),
            qaDoc,
            sentiment,
            emailSent: emailResult.success
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}
