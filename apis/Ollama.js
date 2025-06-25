// Enhanced API for Dream Journaling App
export const queryOllama = async (prompt, context = null, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout (2 minutes)

      const response = await fetch('http://192.168.1.79:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt: prompt,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const text = await response.text();
      console.log('RAW:', text);
      const data = JSON.parse(text);
      
      // Check if the response contains an error
      if (data.error) {
        console.error('Server error:', data.error, data.message);
        // Return fallback response if available
        if (data.fallback) {
          return data.fallback;
        }
        // If it's a timeout and we have retries left, try again
        if (data.error === 'Request timeout' && attempt < retries) {
          console.log(`Retrying request (attempt ${attempt + 1}/${retries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          continue;
        }
        return 'Error connecting to AI server.';
      }
      
      return data.response;
    } catch (error) {
      console.error(`Error querying Ollama (attempt ${attempt + 1}/${retries + 1}):`, error);
      
      // If it's a timeout and we have retries left, try again
      if (error.name === 'AbortError' && attempt < retries) {
        console.log(`Request timed out, retrying (attempt ${attempt + 1}/${retries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        continue;
      }
      
      if (error.name === 'AbortError') {
        return 'Request timed out. Please try again.';
      }
      return 'Error connecting to AI server.';
    }
  }
  
  return 'Error connecting to AI server.';
};

// Enhanced mood tag generation with standardized categories
export const generateMoodTag = async (dreamText, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout (2 minutes)

      // Use the dedicated mood endpoint
      const moodResponse = await fetch('http://192.168.1.79:3000/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const moodData = await moodResponse.json();
      
      // Check if the response contains an error
      if (moodData.error) {
        console.error('Mood generation error:', moodData.error, moodData.message);
        // Return fallback mood if available
        if (moodData.mood) {
          return capitalizeMood(moodData.mood);
        }
        // If it's a timeout and we have retries left, try again
        if (moodData.error === 'Request timeout' && attempt < retries) {
          console.log(`Retrying mood generation (attempt ${attempt + 1}/${retries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          continue;
        }
        return 'Neutral'; // Default fallback
      }
      
      const mood = moodData.mood;
      
      // Map server mood categories to client categories
      const moodMapping = {
        'peaceful': 'Joyful',
        'joyful': 'Joyful',
        'exciting': 'Joyful',
        'curious': 'Strange',
        'hopeful': 'Joyful',
        'grateful': 'Joyful',
        'loving': 'Joyful',
        'confident': 'Joyful',
        'scary': 'Scary',
        'scared': 'Scary',
        'anxious': 'Scary',
        'sad': 'Sad',
        'angry': 'Sad',
        'confused': 'Strange',
        'frustrated': 'Sad',
        'lonely': 'Sad',
        'guilty': 'Sad',
        'mysterious': 'Strange',
        'surreal': 'Strange',
        'bizarre': 'Strange',
        'overwhelming': 'Scary',
        'intense': 'Scary',
        'calm': 'Neutral',
        'neutral': 'Neutral',
        'mixed': 'Neutral'
      };
      
      // Map the server mood to client mood
      const mappedMood = moodMapping[mood.toLowerCase()] || 'Neutral';
      
      return mappedMood;
    } catch (error) {
      console.error(`Error generating mood tag (attempt ${attempt + 1}/${retries + 1}):`, error);
      
      // If it's a timeout and we have retries left, try again
      if (error.name === 'AbortError' && attempt < retries) {
        console.log(`Mood generation timed out, retrying (attempt ${attempt + 1}/${retries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        continue;
      }
      
      if (error.name === 'AbortError') {
        return 'Neutral'; // Return neutral mood on timeout
      }
      return 'Neutral';
    }
  }
  
  return 'Neutral'; // Default fallback after all retries
};

// Helper function to capitalize mood
const capitalizeMood = (mood) => {
  return mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
};

// Enhanced dream analysis with insights
export const analyzeDream = async (dreamText, dreamHistory = []) => {
  const analysisPrompt = `You are a dream analysis expert helping users understand their dreams. 

${dreamHistory.length > 0 ? `Previous dreams context: ${dreamHistory.slice(-3).map(d => d.title).join(', ')}` : ''}

Analyze this dream: "${dreamText}"

Provide insights on:
1. Possible meanings or interpretations
2. Recurring themes or patterns
3. Emotional significance
4. Any actionable insights for the dreamer

Keep your response helpful, supportive, and not too long (2-3 sentences).`;

  try {
    const response = await queryOllama(analysisPrompt);
    return response;
  } catch (error) {
    console.error('Error analyzing dream:', error);
    return 'Unable to analyze dream at this time.';
  }
};

// Enhanced help system with dream context
export const getDreamHelp = async (question, dreamData = []) => {
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

  try {
    const response = await queryOllama(helpPrompt);
    return response;
  } catch (error) {
    console.error('Error getting help:', error);
    return 'Unable to provide help at this time.';
  }
};

// Helper function to get mood distribution
const getMoodDistribution = (dreams) => {
  const moodCounts = {};
  dreams.forEach(dream => {
    // Handle dual moods by counting each part separately
    const moods = dream.mood ? dream.mood.split(', ') : ['Neutral'];
    moods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
  });
  
  return Object.entries(moodCounts)
    .map(([mood, count]) => `${mood}: ${count}`)
    .join(', ');
};
