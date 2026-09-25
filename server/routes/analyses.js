const express = require('express');
const { z } = require('zod');
const { GoogleGenAI } = require('@google/genai');
const supabase = require('../utils/supabase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const analyzeSchema = z.object({
  message: z.string().min(1).max(5000),
});

// Use the recommended `@google/genai` library
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a phishing and social engineering detection assistant. Analyze the message and respond ONLY with valid JSON matching this exact shape, no markdown formatting, no extra text:
{
  "risk_score": <integer 0-100>,
  "category": "<one of: legitimate, spam, phishing, spoofing>",
  "red_flags": ["<short plain-English red flag>", ...up to 5],
  "explanation": "<one paragraph, plain English, explaining the verdict>"
}
If the message is safe, red_flags should be an empty array and risk_score should be low.`;

// POST /api/analyze
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { message } = analyzeSchema.parse(req.body);

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    let jsonStr = response.text;
    
    // Strip markdown code fences if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', jsonStr);
      return res.status(502).json({ error: 'Failed to parse analysis result from AI.' });
    }

    // Insert into Supabase
    const { data: savedAnalysis, error } = await supabase
      .from('analyses')
      .insert([{
        user_id: req.userId,
        message_content: message,
        risk_score: parsedResult.risk_score,
        category: parsedResult.category,
        red_flags: parsedResult.red_flags,
        explanation: parsedResult.explanation
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (savedAnalysis) {
      savedAnalysis.message = savedAnalysis.message_content;
    }

    res.json(savedAnalysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analyses
router.get('/analyses', authMiddleware, async (req, res) => {
  try {
    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map message_content to message for frontend
    const formattedAnalyses = analyses.map(a => ({
      ...a,
      message: a.message_content
    }));
    
    res.json(formattedAnalyses);
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/analyses/:id
router.delete('/analyses/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete only if user_id matches
    const { data, error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(403).json({ error: 'Forbidden or not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analyses/stats
router.get('/analyses/stats', authMiddleware, async (req, res) => {
  try {
    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: true }); // needed for trend logic

    if (error) throw error;

    if (!analyses || analyses.length === 0) {
      return res.json({
        total: 0,
        flaggedPercent: 0,
        commonRedFlag: null,
        trend: []
      });
    }

    const total = analyses.length;
    const flagged = analyses.filter(a => a.category !== 'legitimate').length;
    const flaggedPercent = Math.round((flagged / total) * 100);

    // Find most common red flag
    const flagCounts = {};
    analyses.forEach(a => {
      if (Array.isArray(a.red_flags)) {
        a.red_flags.forEach(flag => {
          flagCounts[flag] = (flagCounts[flag] || 0) + 1;
        });
      }
    });
    
    let commonRedFlag = null;
    let maxCount = 0;
    for (const [flag, count] of Object.entries(flagCounts)) {
      if (count > maxCount) {
        maxCount = count;
        commonRedFlag = flag;
      }
    }

    // Trend: last 7 days
    const trendMap = {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    analyses.forEach(a => {
      const d = new Date(a.created_at);
      if (d >= sevenDaysAgo) {
        // use YYYY-MM-DD
        const dateStr = d.toISOString().split('T')[0];
        if (!trendMap[dateStr]) {
          trendMap[dateStr] = { count: 0, totalScore: 0 };
        }
        trendMap[dateStr].count += 1;
        trendMap[dateStr].totalScore += a.risk_score || 0;
      }
    });

    const trend = Object.entries(trendMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        riskScore: data.count
      }));

    res.json({
      total,
      flaggedPercent,
      commonRedFlag,
      trend
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
