/**
 * Health Check API - Vercel Serverless Handler
 */

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'SETRAM Feedback Platform',
        version: '2.0.0'
    });
}
