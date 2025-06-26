# 🌙 DK-App - Dream Journal

A beautiful and intuitive dream journal app that helps you capture, analyze, and understand your dreams through AI-powered insights and stunning visualizations. Features include mood analysis, dream interpretation, statistics, and now **immersive 3D dream scenery visualization**.

![Dream Journal App](https://img.shields.io/badge/React%20Native-0.79.4-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-53.0.12-black?style=for-the-badge&logo=expo)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎤 Voice Input Features](#-voice-input-features)
- [📱 App Screens](#-app-screens)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Configuration](#️-configuration)
- [🧪 Testing](#-testing)
- [📊 API Integration](#-api-integration)
- [🎯 Key Features Summary](#-key-features-summary)
- [🌟 Why DK-App?](#-why-dk-app)
- [🌟 New Feature: 3D Dream Scenery Viewer](#-new-feature-3d-dream-scenery-viewer)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 📝 **Dream Journaling**
- **Rich Text Dreams**: Create detailed dream entries with full formatting
- **🎤 Voice-to-Text**: Speak your dreams naturally - no typing required
- **Smart Organization**: Edit, delete, and search through your dream collection
- **Mood Tracking**: Categorize dreams by emotion (Joyful, Sad, Neutral, Strange, Scary)
- **Date & Time Stamps**: Automatic tracking of when dreams occurred
- **AI Mood Analysis**: Automatic mood detection using Google Gemini AI

### 📊 **Analytics & Insights**
- **Dream Statistics Dashboard**: Comprehensive overview of your dream patterns
- **Mood Distribution**: Beautiful pie charts showing emotional trends
- **Activity Tracking**: Bar charts displaying dream frequency over time
- **Dream Length Analysis**: Line charts tracking the complexity of your dreams
- **Monthly Averages**: Track your consistency in dream recording
- **Most Common Patterns**: Identify recurring themes and emotions

### 🤖 **AI Dream Assistant**
- **Dream Interpretation**: Get AI-powered insights about your dreams
- **Personalized Analysis**: Receive tailored interpretations based on your dream patterns
- **Pattern Recognition**: AI identifies recurring themes and symbols
- **Contextual Help**: Get app usage tips and dream journaling advice

### 🎨 **Beautiful Design**
- **Dark Theme**: Easy on the eyes with purple accent colors
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Responsive Layout**: Optimized for all screen sizes and orientations
- **Intuitive Navigation**: Bottom tab navigation for seamless browsing
- **Modern UI**: Clean, minimalist design with excellent usability
- **Gesture Support**: Swipe navigation between screens

## 🎤 Voice Input Features

Transform your dream journaling experience with advanced voice capabilities:

- **🎤 One-Tap Voice Input**: Tap the microphone icon anywhere to start recording
- **Dream Descriptions**: Speak your dreams naturally - perfect for capturing details while they're fresh
- **Dream Titles**: Voice input for quick title creation
- **Cross-Platform Support**: Works seamlessly on iOS, Android, and web
- **Real-Time Transcription**: See your words appear as you speak
- **Smart Punctuation**: Automatic spacing and punctuation for natural flow

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
- Swipe navigation between tabs
- Mood-based color coding

### ✏️ **Create Screen**
- Add new dream entries with voice or text input
- Mood selection with intuitive icons
- Rich text formatting options
- Auto-save functionality
- AI-powered mood analysis
- Speech-to-text integration

### 📈 **Stats Screen**
- Comprehensive analytics dashboard
- Interactive charts and graphs
- Dream pattern insights
- Progress tracking over time
- Mood distribution visualization
- Dream frequency analysis

### 🤖 **AI Help Screen**
- Ask questions about your dreams
- Get personalized interpretations
- Voice-enabled AI interactions
- Pattern recognition insights
- Contextual app help
- Dream journaling tips

### 👁️ **View Screen**
- Detailed dream viewing experience
- Full dream content with formatting
- Edit and delete options
- Share functionality
- AI analysis integration
- Mood and timestamp display

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

### **AI Integration**
- **Google Gemini API** - AI-powered mood analysis and dream interpretation
- **Custom API Wrapper** - Robust error handling and retry logic

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

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (for iOS development)
- **Android Studio** (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/colepuls/dk-app.git
   cd dk-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

### Development Setup

1. **Install Expo Go** on your mobile device for testing
2. **Scan the QR code** from the Expo development server
3. **Enable live reload** for real-time development
4. **Use Expo DevTools** for debugging and performance monitoring

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-1.5-flash

# App Configuration
APP_NAME=DK-App
APP_VERSION=1.0.0
```

### API Configuration

The app uses Google Gemini API for AI features. To configure:

1. **Get a Gemini API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Update the API key** in `apis/GeminiAPI.js`
3. **Test the connection** by creating a new dream entry

### Platform-Specific Setup

#### iOS
- Requires **Xcode** and **iOS Simulator**
- Run `npx expo run:ios` for native iOS build
- Configure signing and capabilities in Xcode

#### Android
- Requires **Android Studio** and **Android SDK**
- Run `npx expo run:android` for native Android build
- Configure signing and permissions in Android Studio

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
- **Unit Testing**: Utility functions and helpers

### Running Specific Tests

```bash
# Run specific test file
npm test -- ModalPositioning.test.js

# Run tests with coverage
npm test -- --coverage

# Run tests in verbose mode
npm test -- --verbose
```

## 📊 API Integration

### Google Gemini API

The app integrates with Google Gemini for AI-powered features:

- **Mood Analysis**: Automatic dream mood categorization
- **Dream Interpretation**: Intelligent dream analysis and insights
- **Pattern Recognition**: Identification of recurring themes
- **Contextual Help**: Personalized assistance based on user data

### API Features

- **Robust Error Handling**: Automatic retries and fallback responses
- **Request Timeout Management**: 30-second timeout with AbortController
- **Rate Limiting**: Built-in request throttling
- **Response Caching**: Optimized for performance

### API Usage Examples

```javascript
// Generate mood for dream content
const mood = await generateMoodTag(dreamText);

// Analyze dream with context
const analysis = await analyzeDream(dreamText, dreamHistory);

// Get contextual help
const help = await getDreamHelp(question, userDreams);
```

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
| 🔄 **Swipe Navigation** | Intuitive gesture-based navigation |
| 🎯 **Mood Analysis** | AI-powered emotional categorization |

## 🌟 Why DK-App?

- **🎤 Voice-First Design**: Capture dreams naturally through speech
- **🤖 AI-Powered Insights**: Understand your dreams with intelligent analysis
- **📊 Beautiful Analytics**: Visualize your dream patterns and trends
- **🎨 Stunning UI**: Modern, intuitive interface that's a joy to use
- **📱 Cross-Platform**: Seamless experience across all devices
- **🔒 Privacy-Focused**: Your dreams stay on your device
- **⚡ Fast & Responsive**: Smooth performance with React Native
- **🔄 Gesture Support**: Intuitive swipe navigation
- **🎯 Smart Organization**: AI-powered mood analysis and categorization

## 🌟 New Feature: 3D Dream Scenery Viewer

Experience your dreams like never before with our new **3D Dream Scenery Viewer**! Each dream gets its own unique 3D environment generated based on the dream content and mood.

### ✨ Features

- **Unique 3D Environments**: Every dream gets a custom 3D scene based on its content
- **Mood-Based Color Palettes**: Visual atmosphere matches the dream's emotional tone
- **360° Rotation**: Full panoramic view of your dream world
- **Interactive Controls**: Touch and drag to explore, pinch to zoom
- **Environment Detection**: Automatically detects dream themes like:
  - 🌌 **Space**: Cosmic environments with stars and planets
  - 🌊 **Underwater**: Aquatic scenes with water particles and seaweed
  - 🌲 **Forest**: Mystical woodlands with trees and nature
  - 🏙️ **City**: Urban landscapes with buildings and streets
  - 🕳️ **Underground**: Cave systems with stalactites
  - ☁️ **Sky**: Floating islands and clouds
  - 🌀 **Dreamscape**: Abstract shapes and surreal elements

### 🎮 How to Use

1. **View a Dream**: Open any dream from your journal
2. **Access 3D Viewer**: Tap the "View 3D Scenery" button
3. **Explore**: 
   - Touch and drag to rotate the view
   - Pinch to zoom in/out
   - Use controls to pause rotation or toggle fullscreen
4. **Fallback Mode**: If 3D rendering isn't supported, tap "2D" for a beautiful 2D representation

### 🎨 Environment Generation

The app analyzes your dream content to create unique environments:

- **Content Analysis**: Scans dream text for environmental keywords
- **Mood Integration**: Uses dream mood to determine color schemes
- **Random Elements**: Adds variety with procedurally generated objects
- **Performance Optimized**: Smooth 60fps rendering on mobile devices

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow existing code formatting and patterns
- **Testing**: Add tests for new features
- **Documentation**: Update documentation for new functionality
- **Performance**: Ensure new features don't impact app performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React Native and Expo**

*Transform your dream journaling experience with AI-powered insights and beautiful design.*

## 📊 Performance & Optimization

DK-App is built with performance in mind:

### **React Native Optimizations**
- **Hermes Engine**: Fast JavaScript execution
- **Fabric Renderer**: New architecture for improved performance
- **Turbo Modules**: Native module system for faster bridge communication
- **Image Optimization**: Efficient loading and caching

### **Memory Management**
- **AsyncStorage**: Efficient local data persistence
- **Lazy Loading**: Components loaded on demand
- **Animation Cleanup**: Proper disposal of animation resources
- **Gesture Optimization**: Smooth touch interactions

### **Bundle Size**
- **Tree Shaking**: Removes unused code
- **Code Splitting**: Modular component loading
- **Asset Optimization**: Compressed images and icons

## 🔧 Development Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android device/emulator
npm run ios           # Run on iOS device/simulator
npm run web           # Run in web browser

# Testing
npm test              # Run test suite
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Setup & Configuration
npm run setup-speech  # Configure speech recognition API
npm run doctor        # Check development environment
npm run prebuild      # Generate native code
npm run build         # Create production build

# Server Development (in /server directory)
cd server
npm start             # Start API server
npm run dev           # Start with auto-reload
npm run health        # Check server health
```

## 🏗️ Architecture Overview

### **Client Architecture**
```
┌─────────────────────────────────────┐
│             App.js                  │
│         (Navigation Root)           │
└─────────────────┬───────────────────┘
                  │
          ┌───────▼───────┐
          │  Tab Navigator │
          └───────┬───────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐ ┌──────▼──┐ ┌────▼────┐
│ Home  │ │ Create  │ │  Stats  │
│Screen │ │ Screen  │ │ Screen  │
└───────┘ └─────────┘ └─────────┘
```

### **Data Flow**
```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│              │    │             │    │              │
│ User Input   ├───►│ Components  ├───►│ AsyncStorage │
│              │    │             │    │              │
└──────────────┘    └─────────────┘    └──────────────┘
                            │
                    ┌───────▼────────┐
                    │   AI Services  │
                    │ (Gemini/Ollama)│
                    └────────────────┘
```

## 🛡️ Security & Privacy

DK-App prioritizes user privacy and data security:

### **Data Privacy**
- **Local Storage**: Dreams stored locally on device
- **No Cloud Sync**: Personal data never leaves your device
- **Minimal Permissions**: Only requires microphone for voice input
- **Anonymous Analytics**: No personal data in crash reports

### **API Security**
- **HTTPS Only**: All API communications encrypted
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Sanitized user inputs
- **Error Handling**: No sensitive data in error messages

### **Third-Party Services**
- **Google Gemini**: Used only for AI analysis, no data stored
- **Expo Services**: Standard development tools, minimal data

## 🎯 Roadmap

### **Upcoming Features**
- [ ] **Cloud Backup**: Optional encrypted cloud storage
- [ ] **Dream Sharing**: Share dreams with friends (anonymized)
- [ ] **Advanced Analytics**: Deeper pattern recognition
- [ ] **Lucid Dream Training**: Guided techniques and reminders
- [ ] **Dream Dictionary**: Symbol and theme explanations
- [ ] **Export Options**: PDF, text, and image exports

### **Technical Improvements**
- [ ] **Offline AI**: Local model integration
- [ ] **Multi-language**: Internationalization support
- [ ] **Accessibility**: Enhanced screen reader support
- [ ] **Performance**: Further optimization and caching
- [ ] **Testing**: Increased test coverage

## 📱 Platform Support

| Platform | Status | Version | Notes |
|----------|--------|---------|-------|
| **iOS** | ✅ Supported | 13.0+ | Full feature support |
| **Android** | ✅ Supported | 7.0+ | Full feature support |
| **Web** | ✅ Supported | Modern browsers | Limited voice features |
| **macOS** | 🔄 In Progress | 11.0+ | Via Catalyst |
| **Windows** | 📋 Planned | 10+ | Future release |

## 🔧 Troubleshooting

### **Common Issues**

#### Voice Input Not Working
1. Check microphone permissions
2. Ensure device has speech recognition enabled
3. Try restarting the app
4. Verify internet connection for AI features

#### App Crashes on Startup
1. Clear app data and cache
2. Reinstall the app
3. Check device compatibility
4. Report issue with device details

#### AI Features Unavailable
1. Check internet connection
2. Verify API configuration
3. Check server health status
4. Try again after a few minutes

### **Debug Mode**
Enable debug logging by setting `__DEV__` to true:
```javascript
// In App.js
console.log('Debug mode enabled');
```

### **Support Channels**
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community support and questions
- **Email**: Direct developer contact

### 📞 Support

- **Issues**: [GitHub Issues](https://github.com/colepuls/dk-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/colepuls/dk-app/discussions)
- **Email**: [cole@colepuls.com](mailto:cole@colepuls.com)

### 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **Expo** for the amazing development platform
- **React Native** community for excellent tools and libraries
- **Lucide** for beautiful icons
- **React Three Fiber** for 3D visualization capabilities

## 📜 Voice Input Setup

The app includes voice input functionality that works with device keyboards and optional cloud speech recognition.

### Device Keyboard Voice Input (Recommended)
1. **Enable keyboard voice input** on your device
2. **Open any text field** in the app
3. **Tap the microphone icon** on your keyboard
4. **Speak naturally** and watch text appear

### Optional: Google Cloud Speech-to-Text Setup

For enhanced voice recognition, you can configure Google Cloud Speech-to-Text:

1. **Get a Google Cloud API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Speech-to-Text API
   - Create API credentials

2. **Configure the app**:
   ```bash
   npm run setup-speech
   ```

3. **Add your API key** when prompted

### 2. Configure the API Key

1. Open `apis/SpeechRecognitionAPI.js`
2. Replace `YOUR_GOOGLE_CLOUD_API_KEY` with your actual API key:
   ```javascript
   const GOOGLE_CLOUD_API_KEY = 'your-actual-api-key-here';
   ```

### 3. Usage

- Tap the microphone button to start recording
- Speak your dream clearly
- Tap the button again to stop recording and get the transcription
- The transcribed text will be added to your dream entry

### 4. Cost Considerations

Google Cloud Speech-to-Text API has a free tier:
- First 60 minutes per month are free
- After that, it's approximately $0.006 per 15 seconds

For personal use, this is typically very affordable.

## Support

If you encounter any issues or have questions about setting up the voice input feature, please:

1. Check the [Google Cloud Speech-to-Text documentation](https://cloud.google.com/speech-to-text/docs/quickstart)
2. Ensure your API key is properly configured
3. Verify that the Speech-to-Text API is enabled in your Google Cloud project
4. Check that you have sufficient quota/credits in your Google Cloud account

For other issues, please open an issue on GitHub.
