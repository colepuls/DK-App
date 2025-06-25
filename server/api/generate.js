const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = 'mistral' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Use external Ollama service (you'll need to set this up separately)
    const ollamaUrl = process.env.OLLAMA_URL || 'https://your-ollama-service.com';
    
    const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama request failed: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    res.json({ response: data.response });
    
  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}; 