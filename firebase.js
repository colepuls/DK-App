import { initializeApp } from 'firebase/app';
import { getAuth, OAuthProvider, signInWithCredential } from 'firebase/auth';
import Constants from 'expo-constants';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvnwpMdsMSsSRae5VSCEMRS2BJAu32PDw",
  authDomain: "dream-journal-89e70.firebaseapp.com",
  projectId: "dream-journal-89e70",
  storageBucket: "dream-journal-89e70.firebasestorage.app",
  messagingSenderId: "492956305928",
  appId: "1:492956305928:web:954f16bdd69428b7ea5fbd",
  measurementId: "G-XNE0LEE1NB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Apple OAuth Provider with proper configuration
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Check if we're in development mode
const isDevelopment = __DEV__ || Constants.appOwnership === 'expo';

// Custom Apple Sign-In function that handles development vs production environments
export const signInWithApple = async (identityToken, nonce) => {
  console.log('Starting Apple Sign-In process...');
  console.log('Development mode:', isDevelopment);
  
  try {
    // Create a fresh OAuthProvider instance for each sign-in attempt
    const provider = new OAuthProvider('apple.com');
    
    // Add scopes
    provider.addScope('email');
    provider.addScope('name');
    
    // Create credential
    const credential = provider.credential({
      idToken: identityToken,
      rawNonce: nonce,
    });
    
    console.log('Credential created successfully');
    
    // Sign in with credential
    const result = await signInWithCredential(auth, credential);
    console.log('Apple Sign-In successful:', result.user.email);
    
    return result;
  } catch (error) {
    console.error('Apple Sign-In failed:', error);
    
    // If the error is related to audience mismatch, provide a helpful message
    if (error.code === 'auth/invalid-credential' && error.message.includes('audience')) {
      throw new Error('Apple Sign-In is not available in development mode. Please use a production build or email/password sign-in.');
    }
    
    throw error;
  }
};

export default app; 