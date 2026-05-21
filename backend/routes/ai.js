/**
 * AI Routes
 * Groq LLaMA 3-70B powered analysis and ARIA chatbot
 */

const express = require('express');
const router = express.Router();
const { analyzeSpaceData, generateChatResponse } = require('../ai/analyzer');
const nasa = require('../services/nasa');
const { getCache, setCache } = require('../services/cache');

// GET /api/ai/insights - Full AI analysis of current space conditions
router.get('/insights', async (req, res) => {
  try {
    // Check insight cache (15 min TTL)
    const cached = getCache('ai_insights');
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const nasaData = await nasa.getDashboardData();
    const insights = await analyzeSpaceData(nasaData);

    setCache('ai_insights', insights, 900); // 15 minute cache
    res.json({ success: true, data: insights, cached: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/chat - ARIA chatbot
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }
  if (message.length > 500) {
    return res.status(400).json({ success: false, error: 'Message too long (max 500 chars)' });
  }

  try {
    // Get current context for AI
    const cached = getCache('ai_insights');
    const context = cached || {};

    const response = await generateChatResponse(message, context);
    res.json({ success: true, ...response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
