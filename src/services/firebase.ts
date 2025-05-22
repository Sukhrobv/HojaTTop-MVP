// Firebase configuration for HojaTTop
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// import { getAuth } from 'firebase/auth' // Commented out for now
// import { getStorage } from 'firebase/storage' // Commented out for now

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWTCzjO-doUGjOKzf-7bLb0zUeaHFpo-c",
  authDomain: "hojattop-e7a20.firebaseapp.com",
  projectId: "hojattop-e7a20",
  storageBucket: "hojattop-e7a20.firebasestorage.app",
  messagingSenderId: "877658490157",
  appId: "1:877658490157:web:19eaa92366fbdee70b7fa4"
  // Note: measurementId not needed for React Native
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize only Firestore for now
export const db = getFirestore(app)
// export const auth = getAuth(app) // Will enable when needed
// export const storage = getStorage(app) // Will enable when needed

// Export the app instance if needed
export default app

// Collection names as constants to avoid typos
export const COLLECTIONS = {
  TOILETS: 'toilets',
  REVIEWS: 'reviews',
  USERS: 'users'
} as const