# Dreamio

A cross-platform dream journal application built with React Native and Expo. Dreamio helps you capture, analyze, and understand your dreams with AI-powered insights.

![React Native](https://img.shields.io/badge/React%20Native-0.79.4-blue?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-53.0.12-black?style=for-the-badge&logo=expo)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey?style=for-the-badge)

## Features

- User Authentication: Secure login and signup with Firebase Authentication
- Record and manage dream entries
- Voice-to-text input for easy dream capture
- Mood tracking and categorization
- AI-powered dream analysis using Google Gemini
- Statistical insights and visualizations
- Search and filter functionality
- Dark theme with modern UI design

## Screenshots

<div align="center">
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.37.55.png" width="250" alt="App Screenshot 1"/>
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.38.04.png" width="250" alt="App Screenshot 2"/>
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.39.29.png" width="250" alt="App Screenshot 3"/>
</div>

<div align="center">
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.40.12.png" width="250" alt="App Screenshot 4"/>
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.40.21.png" width="250" alt="App Screenshot 5"/>
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.40.36.png" width="250" alt="App Screenshot 6"/>
</div>

<div align="center">
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.40.44.png" width="250" alt="App Screenshot 7"/>
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.41.04.png" width="250" alt="App Screenshot 8"/>
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.41.20.png" width="250" alt="App Screenshot 9"/>
</div>

<div align="center">
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.41.29.png" width="250" alt="App Screenshot 10"/>
  <img src="screenshots/Simulator Screenshot - iPhone Xs Max - 2025-07-01 at 17.41.36.png" width="250" alt="App Screenshot 11"/>
</div>

## Tech Stack

- React Native 0.79.4
- Expo 53.0.12
- React Navigation
- Firebase Authentication
- AsyncStorage for data persistence
- Google Gemini API for AI features

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/colepuls/dreamio.git
cd dreamio
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase Authentication:
   - Follow the [Firebase Setup Guide](FIREBASE_SETUP.md) to configure authentication
   - Update the `firebase.js` file with your Firebase configuration

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

## Authentication

The app includes Firebase Authentication with the following features:

- Login Screen: Email and password authentication
- Signup Screen: Account creation with password confirmation
- Form Validation: Real-time validation with error messages
- Secure Logout: Logout functionality with confirmation dialog
- Auto-redirect: Automatic navigation based on authentication state

For detailed setup instructions, see [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

---

**Made by Cole Puls**
