# DK-App - Dream Journal

A beautiful and intuitive dream journal app built with React Native and Expo.

## Features

### 📝 Dream Journal
- Create and save your dreams with rich text
- **🎤 Speech-to-Text**: Speak your dreams instead of typing them
- Edit and delete dream entries
- Search through your dream collection
- Filter dreams by mood (Joyful, Sad, Neutral, Strange, Scary)

### 📊 Dream Statistics
- **Total Dreams Count**: Track how many dreams you've recorded
- **Mood Distribution**: Beautiful pie chart showing the distribution of dream moods
- **Most Common Mood**: Identify your most frequent dream emotion
- **Average Dreams per Month**: Track your dream recording consistency
- **Recent Activity**: Bar chart showing dream activity over the last 7 days
- **Dream Lengths**: Line chart displaying word count of your dreams

### 🤖 AI Assistant
- Get AI-powered insights about your dreams
- Ask questions about dream interpretation (with voice input support)
- Receive personalized dream analysis

### 🎨 Beautiful UI/UX
- Dark theme with purple accent colors
- Smooth animations and transitions
- Responsive design for all screen sizes
- Intuitive navigation with bottom tabs

## Voice Input Feature

The app now supports speech-to-text functionality:

- **🎤 Microphone Button**: Tap the microphone icon to enable voice input
- **Dream Description**: Speak your dream details instead of typing
- **Dream Titles**: Voice input for dream titles when saving
- **AI Questions**: Ask questions about your dreams using voice
- **Cross-Platform**: Works on iOS, Android, and web platforms
- **Easy Instructions**: Clear guidance on how to use voice input

### How to Use Voice Input:
1. Tap the microphone button in any text input area
2. Follow the on-screen instructions
3. Use your device's built-in speech recognition
4. Speak clearly and naturally
5. Your speech will be converted to text automatically

## Screenshots

The app features:
- **Home Screen**: Browse and search your dream journal
- **Create Screen**: Add new dream entries with voice input
- **Stats Screen**: View beautiful charts and statistics
- **AI Help Screen**: Get AI assistance with dream interpretation

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Run on iOS or Android using Expo Go app

## Dependencies

- React Native
- Expo
- React Navigation
- React Native Reanimated (for animations)
- React Native Chart Kit (for statistics)
- AsyncStorage (for local data persistence)
- Lucide React Native (for icons)
- Expo Linear Gradient

## Testing

Run tests with:
```bash
npm test
```

## Project Structure

```
DK-App/
├── screens/          # Main app screens
│   ├── Home.js      # Dream journal list
│   ├── Create.js    # New dream creation
│   ├── Stats.js     # Statistics and charts
│   ├── Help.js      # AI assistant
│   └── View.js      # Dream detail view
├── components/       # Reusable components
├── assets/          # Images and icons
└── server/          # Backend API (if applicable)
```

## Contributing

Feel free to submit issues and enhancement requests!
