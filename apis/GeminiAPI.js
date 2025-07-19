/**
 * Google Gemini API Integration for Dream Journaling App
 * 
 * This module provides AI-powered functionality for the Dream Journal app,
 * including mood analysis, dream interpretation, and intelligent assistance.
 * Uses Google's Gemini 1.5 Flash model for fast, cost-effective AI processing.
 * 
 * Key Features:
 * - Dream mood analysis and categorization
 * - Dream interpretation and insights
 * - Contextual help system
 * - Robust error handling and retry logic
 * - Request timeout management
 * 
 * @author Cole Puls
 * @version 1.0.0
 * @since 2024
 */

// API Configuration
const GEMINI_API_KEY = 'SECRET';
const GEMINI_BASE_URL = 'SECRET';
const GEMINI_MODEL = 'gemini-1.5-pro'; // Best model for comprehensive analysis

// Rate limiting configuration
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500; // Reduced to 0.5 seconds between requests for upgraded plan
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 120; // Increased for upgraded plan

/**
 * Main query function for interacting with Gemini API
 * 
 * Handles all communication with the Gemini API including error handling,
 * retry logic, and timeout management. Uses AbortController for request cancellation.
 * 
 * @param {string} prompt - The text prompt to send to Gemini
 * @param {Object} context - Optional context data (currently unused)
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<string>} AI response text or error message
 */
export const queryGemini = async (prompt, context = null, retries = 2) => {
  // Rate limiting: ensure minimum interval between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${waitTime}ms before next request...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Set up request timeout using AbortController
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
            maxOutputTokens: 800,    // Increased for more detailed analysis
            temperature: 0.8,        // Slightly more creative for dream analysis
            topP: 0.9,              // Higher quality responses
            topK: 40                // Top-k sampling for diversity
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt + 1) * 1000;
          
          if (attempt < retries) {
            console.log(`Rate limited. Waiting ${waitTime}ms before retry (attempt ${attempt + 1}/${retries + 1})...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract response text from Gemini API response structure
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
      
    } catch (error) {
      console.error(`Error querying Gemini (attempt ${attempt + 1}/${retries + 1}):`, error);
      
      // Handle timeout errors specifically
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          console.log(`Request timed out, retrying (attempt ${attempt + 1}/${retries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
        throw new Error('Request timed out. Please try again.');
      }
      
      // Retry on other errors
      if (attempt < retries) {
        console.log(`Retrying request (attempt ${attempt + 1}/${retries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // Provide more specific error messages
      if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message.includes('403')) {
        throw new Error('API access denied. Please check your API key.');
      } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
        throw new Error('AI service temporarily unavailable. Please try again in a moment.');
      } else {
        throw new Error('Error connecting to AI service. Please check your internet connection.');
      }
    }
  }
  
  throw new Error('Error connecting to AI service.');
};

/**
 * Generate mood tag for dream content using AI analysis
 * 
 * Analyzes dream text and categorizes it into standardized mood categories.
 * Uses a comprehensive prompt to consider emotional tone, intensity, and overall feeling.
 * Maps server responses to client-side mood categories for consistency.
 * 
 * @param {string} dreamText - The dream content to analyze
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<string>} Categorized mood tag (Joyful, Sad, Neutral, Strange, Scary)
 */
export const generateMoodTag = async (dreamText, retries = 2) => {
  const moodPrompt = `You are an expert at analyzing emotional content in dreams. Analyze the following dream and determine the most accurate mood tag.

Consider these factors:
- **Primary emotional tone**: What is the dominant feeling?
- **Intensity level**: How strong are the emotions?
- **Overall atmosphere**: What's the general mood/feeling?
- **Complexity**: Are there mixed or conflicting emotions?

Available mood tags (choose the most fitting):
- **Joyful**: peaceful, happy, exciting, hopeful, grateful, loving, confident, content
- **Sad**: sad, lonely, depressed, guilty, disappointed, heartbroken
- **Scary**: scary, anxious, fearful, terrified, panicked, stressed
- **Strange**: mysterious, surreal, bizarre, confusing, curious, puzzling
- **Neutral**: calm, neutral, indifferent, balanced, mixed (conflicting emotions)

Dream: "${dreamText}"

Respond with ONLY the single most appropriate mood tag from the categories above, nothing else.`;

  try {
    const response = await queryGemini(moodPrompt);
    const mood = response.trim().toLowerCase();
    
    // Map server mood categories to client categories for consistency
    const moodMapping = {
      // Positive emotions -> Joyful
      'peaceful': 'Joyful',
      'joyful': 'Joyful',
      'exciting': 'Joyful',
      'curious': 'Strange',
      'hopeful': 'Joyful',
      'grateful': 'Joyful',
      'loving': 'Joyful',
      'confident': 'Joyful',
      
      // Negative emotions -> Scary or Sad
      'scary': 'Scary',
      'scared': 'Scary',
      'anxious': 'Scary',
      'sad': 'Sad',
      'angry': 'Sad',
      'confused': 'Strange',
      'frustrated': 'Sad',
      'lonely': 'Sad',
      'guilty': 'Sad',
      
      // Unusual emotions -> Strange
      'mysterious': 'Strange',
      'surreal': 'Strange',
      'bizarre': 'Strange',
      
      // Intense emotions -> Scary
      'overwhelming': 'Scary',
      'intense': 'Scary',
      
      // Neutral emotions -> Neutral
      'calm': 'Neutral',
      'neutral': 'Neutral',
      'mixed': 'Neutral'
    };
    
    return moodMapping[mood] || 'Neutral'; // Default to Neutral if mood not recognized
  } catch (error) {
    console.error('Error generating mood tag:', error);
    return 'Neutral'; // Safe fallback
  }
};

/**
 * Analyze dream content and provide insights
 * 
 * Provides intelligent interpretation of dream content with context from
 * previous dreams. Offers meaningful insights about patterns, emotions,
 * and potential meanings.
 * 
 * @param {string} dreamText - The dream content to analyze
 * @param {Array} dreamHistory - Array of previous dream objects for context
 * @returns {Promise<string>} AI-generated dream analysis and insights
 */
export const analyzeDream = async (dreamText, dreamHistory = []) => {
  const analysisPrompt = `You are an expert dream analyst with deep knowledge of psychology, symbolism, and dream interpretation. 

${dreamHistory.length > 0 ? `Context from recent dreams: ${dreamHistory.slice(-3).map(d => d.title).join(', ')}` : ''}

Analyze this dream: "${dreamText}"

Provide a comprehensive analysis including:
1. **Symbolic Meanings**: What do the key elements in this dream represent?
2. **Emotional Patterns**: What emotions are present and what might they indicate?
3. **Personal Context**: How might this dream relate to the dreamer's current life situation?
4. **Recurring Themes**: Are there patterns connecting to previous dreams?
5. **Actionable Insights**: What practical steps or reflections might be helpful?

Keep your response insightful, supportive, and around 3-4 sentences. Focus on being helpful rather than definitive.`;

  try {
    const response = await queryGemini(analysisPrompt);
    return response;
  } catch (error) {
    console.error('Error analyzing dream:', error);
    throw new Error('Unable to analyze dream at this time.');
  }
};

/**
 * Enhanced help system with dream context
 * 
 * Provides contextual assistance based on user's dream journal data.
 * Offers personalized advice about app usage, dream journaling tips,
 * and pattern recognition.
 * 
 * @param {string} question - User's help question
 * @param {Array} dreamData - Array of user's dream objects for context
 * @returns {Promise<string>} AI-generated help response
 */
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

/**
 * Helper function to calculate mood distribution from dream data
 * 
 * Analyzes the user's dream collection to provide context for AI responses.
 * Creates a summary of mood patterns for personalized assistance.
 * 
 * @param {Array} dreams - Array of dream objects with mood properties
 * @returns {string} Formatted string of mood counts
 */
const getMoodDistribution = (dreams) => {
  const moodCounts = {};
  dreams.forEach(dream => {
    moodCounts[dream.mood] = (moodCounts[dream.mood] || 0) + 1;
  });
  return Object.entries(moodCounts)
    .map(([mood, count]) => `${mood}: ${count}`)
    .join(', ');
};

/**
 * Rewrite dream content to improve English grammar and writing quality
 * 
 * Uses AI to enhance the writing while preserving all original details and meaning.
 * Focuses on grammar correction, sentence structure, and flow improvement.
 * 
 * @param {string} dreamText - The original dream content to rewrite
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<string>} AI-improved version of the dream text
 */
export const rewriteDream = async (dreamText, retries = 2) => {
  const rewritePrompt = `You are an expert writer specializing in dream journal entries. 

Rewrite the following dream description to be more clear, engaging, and well-written while preserving ALL the original details, emotions, and meaning:

"${dreamText}"

Your improvements should:
- **Enhance clarity**: Make the narrative flow better
- **Preserve authenticity**: Keep the dreamer's unique voice and perspective
- **Maintain details**: Don't add or remove any specific elements
- **Improve readability**: Better grammar, structure, and flow
- **Keep emotions intact**: Preserve the emotional tone and intensity

Return only the improved version, nothing else.`;

  try {
    const response = await queryGemini(rewritePrompt, null, retries);
    return response.trim();
  } catch (error) {
    console.error('Error rewriting dream:', error);
    throw new Error('Unable to improve writing at this time.');
  }
};

 
