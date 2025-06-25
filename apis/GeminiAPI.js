// Google Gemini API for Dream Journaling App
const GEMINI_API_KEY = 'AIzaSyCPb0P5DEiw1H4ZwYkw-jWnKRBty68m-Cs';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-1.5-flash'; // Fast and cost-effective model

// Main query function
export const queryGemini = async (prompt, context = null, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
            topP: 0.8,
            topK: 40
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
      
    } catch (error) {
      console.error(`Error querying Gemini (attempt ${attempt + 1}/${retries + 1}):`, error);
      
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          console.log(`Request timed out, retrying (attempt ${attempt + 1}/${retries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
        return 'Request timed out. Please try again.';
      }
      
      if (attempt < retries) {
        console.log(`Retrying request (attempt ${attempt + 1}/${retries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      return 'Error connecting to AI service. Please check your internet connection.';
    }
  }
  
  return 'Error connecting to AI service.';
};

// Mood tag generation with standardized categories
export const generateMoodTag = async (dreamText, retries = 2) => {
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

  try {
    const response = await queryGemini(moodPrompt);
    const mood = response.trim().toLowerCase();
    
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
    
    return moodMapping[mood] || 'Neutral';
  } catch (error) {
    console.error('Error generating mood tag:', error);
    return 'Neutral';
  }
};

// Dream analysis with insights
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
    const response = await queryGemini(analysisPrompt);
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
    const response = await queryGemini(helpPrompt);
    return response;
  } catch (error) {
    console.error('Error getting help:', error);
    return 'Unable to provide help at this time. Please try again later.';
  }
};

// Helper function to get mood distribution
const getMoodDistribution = (dreams) => {
  const moodCounts = {};
  dreams.forEach(dream => {
    moodCounts[dream.mood] = (moodCounts[dream.mood] || 0) + 1;
  });
  return Object.entries(moodCounts)
    .map(([mood, count]) => `${mood}: ${count}`)
    .join(', ');
};

// Backward compatibility - export the old function names
export const queryOllama = queryGemini; 