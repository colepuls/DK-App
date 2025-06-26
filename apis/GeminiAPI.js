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
const GEMINI_API_KEY = 'AIzaSyCPb0P5DEiw1H4ZwYkw-jWnKRBty68m-Cs';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-1.5-flash'; // Fast and cost-effective model

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
            maxOutputTokens: 500,    // Limit response length for cost control
            temperature: 0.7,        // Balanced creativity vs consistency
            topP: 0.8,              // Nucleus sampling for quality
            topK: 40                // Top-k sampling for diversity
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
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
        return 'Request timed out. Please try again.';
      }
      
      // Retry on other errors
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
  const rewritePrompt = `You are a professional editor helping to improve the writing quality of a dream journal entry. 

Your task is to rewrite the following dream text to:
1. Fix any grammar errors
2. Improve sentence structure and flow
3. Make the writing more clear and engaging
4. Preserve ALL original details and meaning exactly
5. Keep the same emotional tone and personal voice
6. Maintain the dream's authenticity and personal experience

IMPORTANT: Do not add any new details, change the meaning, or alter the dream's content. Only improve the writing quality.

Original dream text: "${dreamText}"

Please provide the improved version while keeping all the original details intact.`;

  try {
    const response = await queryGemini(rewritePrompt, null, retries);
    return response.trim();
  } catch (error) {
    console.error('Error rewriting dream:', error);
    return dreamText; // Return original text if rewrite fails
  }
};

// Backward compatibility - export the old function names
export const queryOllama = queryGemini; 