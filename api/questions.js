/**
 * SETRAM Questions API - Vercel Serverless Handler
 * Generates clarifying questions using DeepSeek AI
 */

import axios from 'axios';

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
        // Fallback questions if API fails
        return [
            'Can you provide more specific details?',
            'When did this occur?',
            'What would be an ideal resolution?'
        ];
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
        const { feedback } = req.body;
        
        if (!feedback) {
            return res.status(400).json({ error: 'Feedback required' });
        }

        const questions = await generateClarifyingQuestions(feedback);
        res.status(200).json({ questions });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}
