/**
 * Dream Journal API Server
 * 
 * Express.js backend server providing AI-powered dream analysis capabilities
 * for the Dream Journal mobile application. Integrates with Ollama for local
 * AI model processing and provides robust error handling with fallbacks.
 * 
 * Key Features:
 * - Dream mood analysis using local AI models
 * - Dream interpretation and insights
 * - Health monitoring for AI services
 * - Comprehensive error handling and timeouts
 * - CORS support for cross-origin requests
 * 
 * @author Cole Puls
 * @version 1.0.0
 * @since 2024
 */

const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration constants
const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'mistral';
const REQUEST_TIMEOUT = 120000; // 2 minutes
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Health Check Endpoint
 * 
 * Basic health check to verify the API server is running.
 * Useful for monitoring and load balancer health checks.
 * 
 * @route GET /health
 * @returns {Object} Server status and message
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Dream Journal API is running' });
});

/**
 * Ollama Service Health Check
 * 
 * Verifies that the Ollama AI service is running and accessible.
 * Returns available models and service status for debugging.
 * 
 * @route GET /health/ollama
 * @returns {Object} Ollama service status and available models
 */
app.get('/health/ollama', async (req, res) => {
  try {
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT)
    });
    
    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      res.json({ 
        status: 'OK', 
        message: 'Ollama is running',
        models: data.models || []
      });
    } else {
      res.status(503).json({ 
        status: 'ERROR', 
        message: 'Ollama is not responding properly',
        statusCode: ollamaResponse.status
      });
    }
  } catch (error) {
    console.error('Ollama health check failed:', error);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Ollama is not accessible',
      error: error.message
    });
  }
});

/**
 * General AI Text Generation Endpoint
 * 
 * Processes general AI text generation requests using Ollama.
 * Supports custom model selection and includes comprehensive error handling.
 * 
 * @route POST /api/generate
 * @param {string} prompt - The text prompt to send to the AI model
 * @param {string} [model=mistral] - AI model to use for generation
 * @returns {Object} AI-generated response text
 * @throws {400} Missing prompt parameter
 * @throws {503} Ollama service unavailable
 * @throws {408} Request timeout
 * @throws {500} Internal server error
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model = DEFAULT_MODEL } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Processing request for model: ${model}, prompt length: ${prompt.length}`);

    // Make request to Ollama with timeout
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    console.log(`Successfully processed request, response length: ${data.response?.length || 0}`);
    res.json({ response: data.response });
    
  } catch (error) {
    console.error('Error in /api/generate:', error);
    
    // Handle different types of errors with appropriate responses
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.error('Ollama connection refused - service may not be running');
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Ollama is not running. Please start Ollama or check your connection.',
        fallback: 'Unable to process request at this time.'
      });
    }
    
    if (error.name === 'AbortError') {
      console.error('Request timed out after 120 seconds');
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'AI service took too long to respond.',
        fallback: 'Unable to process request at this time.'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

/**
 * Dream Mood Analysis Endpoint
 * 
 * Analyzes dream content to determine emotional mood categories.
 * Uses specialized prompting to categorize dreams into predefined mood tags
 * for consistent classification across the application.
 * 
 * @route POST /api/mood
 * @param {string} dreamText - The dream content to analyze for mood
 * @returns {Object} Detected mood tag from available categories
 * @throws {400} Missing dream text parameter
 * @throws {503} Ollama service unavailable (returns 'neutral' fallback)
 * @throws {408} Request timeout (returns 'neutral' fallback)
 * @throws {500} Internal server error (returns 'neutral' fallback)
 */
app.post('/api/mood', async (req, res) => {
  try {
    const { dreamText } = req.body;
    
    if (!dreamText) {
      return res.status(400).json({ error: 'Dream text is required' });
    }

    // Comprehensive mood analysis prompt with clear categories
    const moodPrompt = `Analyze the following dream and determine the most accurate mood tag. 

Consider these factors:
- Emotional tone (fear, joy, confusion, peace, excitement, sadness, anger, wonder)
- Intensity level (mild, moderate, intense)
- Overall feeling (positive, negative, neutral, mixed)

Available mood tags: 
- peaceful, joyful, exciting, curious, hopeful, grateful, loving, confident
- scary, anxious, sad, angry, confused, frustrated, lonely, guilty
- mysterious, surreal, bizarre, overwhelming, intense, calm, neutral
- mixed (for dreams with conflicting emotions)

Dream: "${dreamText}"

Respond with ONLY the single most appropriate mood tag, nothing else.`;

    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt: moodPrompt,
        stream: false
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    res.json({ mood: data.response.trim().toLowerCase() });
    
  } catch (error) {
    console.error('Error in /api/mood:', error);
    
    // Provide fallback mood for all error cases
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Ollama is not running. Please start Ollama or check your connection.',
        mood: 'neutral'
      });
    }
    
    if (error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'AI service took too long to respond.',
        mood: 'neutral'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      mood: 'neutral'
    });
  }
});

/**
 * Dream Content Analysis Endpoint
 * 
 * Provides comprehensive analysis and interpretation of dream content.
 * Takes into account dream history for contextual insights and pattern recognition.
 * Returns structured analysis with themes, emotions, and potential meanings.
 * 
 * @route POST /api/analyze
 * @param {string} dreamText - The dream content to analyze
 * @param {Array} [dreamHistory=[]] - Previous dreams for context
 * @returns {Object} Detailed dream analysis and interpretation
 * @throws {400} Missing dream text parameter
 * @throws {503} AI service unavailable
 * @throws {408} Request timeout
 * @throws {500} Internal server error
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { dreamText, dreamHistory = [] } = req.body;
    
    if (!dreamText) {
      return res.status(400).json({ error: 'Dream text is required' });
    }

    // Create context from dream history for more personalized analysis
    const historyContext = dreamHistory.length > 0 
      ? `\n\nContext from recent dreams:\n${dreamHistory.slice(-3).map((d, i) => 
          `${i + 1}. ${d.title}: ${d.text.substring(0, 100)}...`
        ).join('\n')}`
      : '';

    const analysisPrompt = `You are a dream analysis expert helping users understand their dreams. 

${historyContext}

Analyze this dream: "${dreamText}"

Provide insights on:
1. Possible meanings or interpretations
2. Recurring themes or patterns
3. Emotional significance
4. Any actionable insights for the dreamer

Keep your response helpful, supportive, and not too long (2-3 sentences).`;

    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt: analysisPrompt,
        stream: false
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    res.json({ analysis: data.response });
    
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    
    // Handle different types of errors with appropriate responses
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.error('Ollama connection refused - service may not be running');
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Ollama is not running. Please start Ollama or check your connection.',
        fallback: 'Unable to analyze dream at this time.'
      });
    }
    
    if (error.name === 'AbortError') {
      console.error('Request timed out after 120 seconds');
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'AI service took too long to respond.',
        fallback: 'Unable to analyze dream at this time.'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Help endpoint with dream context
app.post('/api/help', async (req, res) => {
  try {
    const { question, dreamData = [] } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const getMoodDistribution = (dreams) => {
      const moodCounts = {};
      dreams.forEach(dream => {
        moodCounts[dream.mood] = (moodCounts[dream.mood] || 0) + 1;
      });
      
      return Object.entries(moodCounts)
        .map(([mood, count]) => `${mood}: ${count}`)
        .join(', ');
    };

    const helpPrompt = `You are a helpful assistant for a dream journaling app. 

Current dream statistics:
- Total dreams: ${dreamData.length}
- Mood distribution: ${getMoodDistribution(dreamData)}
- Recent dreams: ${dreamData.slice(-3).map(d => d.title).join(', ')}

User question: "${question}"

Provide helpful, specific advice about:
- How to use the app features
- Dream journaling tips
- Understanding dream patterns
- App navigation and functionality

Keep responses friendly and concise.`;

    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt: helpPrompt,
        stream: false
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    res.json({ help: data.response });
    
  } catch (error) {
    console.error('Error in /api/help:', error);
    
    // Handle different types of errors with appropriate responses
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.error('Ollama connection refused - service may not be running');
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Ollama is not running. Please start Ollama or check your connection.',
        fallback: 'Unable to provide help at this time.'
      });
    }
    
    if (error.name === 'AbortError') {
      console.error('Request timed out after 120 seconds');
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'AI service took too long to respond.',
        fallback: 'Unable to provide help at this time.'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Dream Journal API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}); 