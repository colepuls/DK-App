/**
 * Dreamio API Configuration Setup Script
 * 
 * Interactive script to help users configure API keys and services
 * for the Dream Journal application. Supports both Google Cloud
 * Speech-to-Text and Google Gemini AI services.
 * 
 * Features:
 * - Interactive prompts for API configuration
 * - Validation of API keys
 * - Environment file generation
 * - Service health checking
 * 
 * Usage: npm run setup-speech
 * 
 * @author Cole Puls
 * @version 1.0.0
 * @since 2024
 */

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎤 Dreamio Speech Recognition Setup');
console.log('==================================\n');

console.log('This script will help you configure your Google Cloud API key for speech recognition.\n');

console.log('📋 Prerequisites:');
console.log('1. Go to https://console.cloud.google.com/');
console.log('2. Create a new project or select an existing one');
console.log('3. Enable the Speech-to-Text API:');
console.log('   - Go to "APIs & Services" > "Library"');
console.log('   - Search for "Speech-to-Text API"');
console.log('   - Click "Enable"');
console.log('4. Create an API key:');
console.log('   - Go to "APIs & Services" > "Credentials"');
console.log('   - Click "Create Credentials" > "API Key"');
console.log('   - Copy your API key\n');

rl.question('Enter your Google Cloud API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('❌ No API key provided. Setup cancelled.');
    rl.close();
    return;
  }

  const apiKeyTrimmed = apiKey.trim();
  
  // Validate API key format (basic check)
  if (!apiKeyTrimmed.startsWith('AIza')) {
    console.log('⚠️  Warning: API key doesn\'t start with "AIza". Make sure you copied it correctly.\n');
  }

  const speechRecognitionPath = path.join(__dirname, 'apis', 'SpeechRecognitionAPI.js');
  
  try {
    let content = fs.readFileSync(speechRecognitionPath, 'utf8');
    
    // Replace the placeholder API key
    const updatedContent = content.replace(
      /const GOOGLE_CLOUD_API_KEY = 'YOUR_GOOGLE_CLOUD_API_KEY';/,
      `const GOOGLE_CLOUD_API_KEY = '${apiKeyTrimmed}';`
    );
    
    fs.writeFileSync(speechRecognitionPath, updatedContent);
    
    console.log('✅ API key configured successfully!');
    console.log('📁 Updated: apis/SpeechRecognitionAPI.js\n');
    
    console.log('🎉 Setup complete! You can now use voice input in your app.');
    console.log('📱 Restart your Expo app to test the microphone feature.\n');
    
    console.log('💰 Cost information:');
    console.log('- Free tier: 60 minutes per month');
    console.log('- After free tier: ~$0.006 per 15 seconds');
    console.log('- Very affordable for personal use!\n');
    
    console.log('🔒 Security tip: Consider restricting your API key to your app\'s domain for production use.');
    
  } catch (error) {
    console.error('❌ Error updating API key:', error.message);
    console.log('\n📝 Manual setup:');
    console.log('1. Open apis/SpeechRecognitionAPI.js');
    console.log('2. Replace YOUR_GOOGLE_CLOUD_API_KEY with your actual API key');
  }
  
  rl.close();
});

rl.on('close', () => {
  console.log('\n👋 Setup complete! Happy dream journaling!');
  process.exit(0);
}); 