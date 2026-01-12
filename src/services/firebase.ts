// Firebase configuration for HojaTTop
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWTCzjO-doUGjOKzf-7bLb0zUeaHFpo-c",
  authDomain: "hojattop-e7a20.firebaseapp.com",
  projectId: "hojattop-e7a20",
  storageBucket: "hojattop-e7a20.firebasestorage.app",
  messagingSenderId: "877658490157",
  appId: "1:877658490157:web:19eaa92366fbdee70b7fa4"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Auth временно отключён - будет добавлен позже с @react-native-firebase/auth
export const auth = null as any

export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

// Collection names as constants to avoid typos
export const COLLECTIONS = {
  TOILETS: 'toilets',
  REVIEWS: 'reviews',
  USERS: 'users'
}