const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Dream Journal API is running' });
});

// Ollama health check endpoint
app.get('/health/ollama', async (req, res) => {
  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout for health check
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

// Main API endpoint for Ollama requests
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model = 'mistral' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Processing request for model: ${model}, prompt length: ${prompt.length}`);

    // Make request to Ollama
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(120000) // 120 second timeout (2 minutes)
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    console.log(`Successfully processed request, response length: ${data.response?.length || 0}`);
    res.json({ response: data.response });
    
  } catch (error) {
    console.error('Error in /api/generate:', error);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.error('Ollama connection refused - service may not be running');
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Ollama is not running. Please start Ollama or check your connection.',
        fallback: 'Unable to process request at this time.'
      });
    }
    
    // Check if it's a timeout
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

// Enhanced mood tag generation endpoint
app.post('/api/mood', async (req, res) => {
  try {
    const { dreamText } = req.body;
    
    if (!dreamText) {
      return res.status(400).json({ error: 'Dream text is required' });
    }

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

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: moodPrompt,
        stream: false
      }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(120000) // 120 second timeout (2 minutes)
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    res.json({ mood: data.response.trim().toLowerCase() });
    
  } catch (error) {
    console.error('Error in /api/mood:', error);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Ollama is not running. Please start Ollama or check your connection.',
        mood: 'neutral' // Fallback mood
      });
    }
    
    // Check if it's a timeout
    if (error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request timeout',
        message: 'AI service took too long to respond.',
        mood: 'neutral' // Fallback mood
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      mood: 'neutral' // Fallback mood
    });
  }
});

// Dream analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { dreamText, dreamHistory = [] } = req.body;
    
    if (!dreamText) {
      return res.status(400).json({ error: 'Dream text is required' });
    }

    const analysisPrompt = `You are a dream analysis expert helping users understand their dreams. 

${dreamHistory.length > 0 ? `Previous dreams context: ${dreamHistory.slice(-3).map(d => d.title).join(', ')}` : ''}

Analyze this dream: "${dreamText}"

Provide insights on:
1. Possible meanings or interpretations
2. Recurring themes or patterns
3. Emotional significance
4. Any actionable insights for the dreamer

Keep your response helpful, supportive, and not too long (2-3 sentences).`;

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: analysisPrompt,
        stream: false
      }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(120000) // 120 second timeout (2 minutes)
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    res.json({ analysis: data.response });
    
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Ollama is not running. Please start Ollama or check your connection.',
        fallback: 'Unable to analyze dream at this time.'
      });
    }
    
    // Check if it's a timeout
    if (error.name === 'AbortError') {
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

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: helpPrompt,
        stream: false
      }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(120000) // 120 second timeout (2 minutes)
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    res.json({ help: data.response });
    
  } catch (error) {
    console.error('Error in /api/help:', error);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Ollama is not running. Please start Ollama or check your connection.',
        fallback: 'Unable to provide help at this time.'
      });
    }
    
    // Check if it's a timeout
    if (error.name === 'AbortError') {
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