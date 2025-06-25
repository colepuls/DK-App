# 🌙 DK-App - Dream Journal

A beautiful and intuitive dream journal app that helps you capture, analyze, and understand your dreams through AI-powered insights and stunning visualizations.

![Dream Journal App](https://img.shields.io/badge/React%20Native-0.79.4-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-53.0.12-black?style=for-the-badge&logo=expo)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey?style=for-the-badge)

## ✨ Features

### 📝 **Dream Journaling**
- **Rich Text Dreams**: Create detailed dream entries with full formatting
- **🎤 Voice-to-Text**: Speak your dreams naturally - no typing required
- **Smart Organization**: Edit, delete, and search through your dream collection
- **Mood Tracking**: Categorize dreams by emotion (Joyful, Sad, Neutral, Strange, Scary)
- **Date & Time Stamps**: Automatic tracking of when dreams occurred

### 📊 **Analytics & Insights**
- **Dream Statistics Dashboard**: Comprehensive overview of your dream patterns
- **Mood Distribution**: Beautiful pie charts showing emotional trends
- **Activity Tracking**: Bar charts displaying dream frequency over time
- **Dream Length Analysis**: Line charts tracking the complexity of your dreams
- **Monthly Averages**: Track your consistency in dream recording
- **Most Common Patterns**: Identify recurring themes and emotions

### 🤖 **AI Dream Assistant**
- **Dream Interpretation**: Get AI-powered insights about your dreams
- **Voice Questions**: Ask questions about your dreams using natural speech
- **Personalized Analysis**: Receive tailored interpretations based on your dream patterns
- **Pattern Recognition**: AI identifies recurring themes and symbols

### 🎨 **Beautiful Design**
- **Dark Theme**: Easy on the eyes with purple accent colors
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Responsive Layout**: Optimized for all screen sizes and orientations
- **Intuitive Navigation**: Bottom tab navigation for seamless browsing
- **Modern UI**: Clean, minimalist design with excellent usability

## 🎤 Voice Input Features

Transform your dream journaling experience with advanced voice capabilities:

- **🎤 One-Tap Voice Input**: Tap the microphone icon anywhere to start recording
- **Dream Descriptions**: Speak your dreams naturally - perfect for capturing details while they're fresh
- **Dream Titles**: Voice input for quick title creation
- **AI Interactions**: Ask questions about your dreams using voice commands
- **Cross-Platform Support**: Works seamlessly on iOS, Android, and web
- **Real-Time Transcription**: See your words appear as you speak

### Voice Input Guide:
1. **Tap the microphone** in any text input area
2. **Follow on-screen prompts** for optimal recording
3. **Speak clearly and naturally** - the app adapts to your voice
4. **Review and edit** the transcribed text if needed
5. **Save your dream** with voice-generated content

## 📱 App Screens

### 🏠 **Home Screen**
- Browse your complete dream journal
- Search and filter dreams by date, mood, or keywords
- Quick access to recent dreams
- Beautiful card-based layout

### ✏️ **Create Screen**
- Add new dream entries with voice or text input
- Mood selection with intuitive icons
- Rich text formatting options
- Auto-save functionality

### 📈 **Stats Screen**
- Comprehensive analytics dashboard
- Interactive charts and graphs
- Dream pattern insights
- Progress tracking over time

### 🤖 **AI Help Screen**
- Ask questions about your dreams
- Get personalized interpretations
- Voice-enabled AI interactions
- Pattern recognition insights

### 👁️ **View Screen**
- Detailed dream viewing experience
- Full dream content with formatting
- Edit and delete options
- Share functionality

## 🛠️ Technology Stack

### **Frontend**
- **React Native 0.79.4** - Cross-platform mobile development
- **Expo 53.0.12** - Development platform and tools
- **React Navigation 7.x** - Navigation and routing
- **React Native Reanimated 3.17.4** - Smooth animations
- **React Native Chart Kit 6.12.0** - Beautiful data visualizations

### **Voice & Audio**
- **Expo AV 15.1.6** - Audio recording and playback
- **Expo Speech 13.1.7** - Text-to-speech capabilities
- **React Native Gesture Handler 2.24.0** - Touch interactions

### **Data & Storage**
- **AsyncStorage 2.1.2** - Local data persistence
- **React Native Get Random Values 1.11.0** - Secure random generation

### **UI & Design**
- **Lucide React Native 0.519.0** - Beautiful icon library
- **Expo Linear Gradient 14.1.5** - Gradient effects
- **React Native SVG 15.11.2** - Vector graphics support

### **Testing**
- **Jest 29.7.0** - Unit testing framework
- **React Native Testing Library 13.2.0** - Component testing

## 📁 Project Structure

```
DK-App/
├── 📱 screens/              # Main application screens
│   ├── Home.js             # Dream journal list and search
│   ├── Create.js           # New dream creation interface
│   ├── Stats.js            # Analytics and charts
│   ├── Help.js             # AI assistant interface
│   └── View.js             # Individual dream detail view
├── 🧩 components/           # Reusable UI components
│   ├── Card.js             # Dream card component
│   ├── Modal.js            # Modal dialogs
│   ├── Navigator.js        # Navigation components
│   ├── SpeechToText.js     # Voice input functionality
│   ├── EditDreamModal.js   # Dream editing interface
│   ├── SaveDreamModal.js   # Dream saving interface
│   ├── SuccessModal.js     # Success notifications
│   └── Header.js           # App header component
├── 🔌 apis/                # API integrations
│   ├── GeminiAPI.js        # Google Gemini AI integration
│   └── Ollama.js           # Local AI model integration
├── 🧪 __tests__/           # Test files
│   ├── ModalPositioning.test.js
│   └── Stats.test.js
├── 🖼️ assets/              # Images, icons, and static files
├── 🖥️ ios/                 # iOS-specific configuration
├── 🗄️ server/              # Backend API server
└── 📄 Configuration files  # Package.json, app.json, etc.
```

## 🧪 Testing

The app includes comprehensive testing with Jest and React Native Testing Library:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

### Test Coverage
- **Component Testing**: Modal positioning and interactions
- **Statistics Testing**: Chart rendering and data calculations
- **Integration Testing**: Voice input and AI interactions

## 🎯 Key Features Summary

| Feature | Description |
|---------|-------------|
| 🌙 **Dream Journaling** | Create, edit, and organize dream entries |
| 🎤 **Voice Input** | Speak your dreams with real-time transcription |
| 📊 **Analytics** | Beautiful charts and dream pattern insights |
| 🤖 **AI Assistant** | Get interpretations and ask questions about dreams |
| 🎨 **Dark Theme** | Beautiful UI with purple accent colors |
| 📱 **Cross-Platform** | Works on iOS, Android, and web |
| 🔍 **Search & Filter** | Find dreams by date, mood, or keywords |
| 📈 **Progress Tracking** | Monitor your dream journaling consistency |

## 🌟 Why DK-App?

- **🎤 Voice-First Design**: Capture dreams naturally through speech
- **🤖 AI-Powered Insights**: Understand your dreams with intelligent analysis
- **📊 Beautiful Analytics**: Visualize your dream patterns and trends
- **🎨 Stunning UI**: Modern, intuitive interface that's a joy to use
- **📱 Cross-Platform**: Seamless experience across all devices
- **🔒 Privacy-Focused**: Your dreams stay on your device
- **⚡ Fast & Responsive**: Smooth performance with React Native

---

**Built with ❤️ using React Native and Expo**

*Transform your dream journaling experience with AI-powered insights and beautiful design.*
