import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase config (copied from src/services/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBWTCzjO-doUGjOKzf-7bLb0zUeaHFpo-c",
  authDomain: "hojattop-e7a20.firebaseapp.com",
  projectId: "hojattop-e7a20",
  storageBucket: "hojattop-e7a20.firebasestorage.app",
  messagingSenderId: "877658490157",
  appId: "1:877658490157:web:19eaa92366fbdee70b7fa4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newToilet = {
  name: "Japan Digital University Toilet",
  address: "87M4+62G, Tashkent, Узбекистан",
  latitude: 41.33288159828243,
  longitude: 69.25466457100332,
  rating: 0,
  reviewCount: 0,
  features: {
    isAccessible: true, // Assuming default features, can be updated later
    hasBabyChanging: false,
    hasAblution: true,
    isFree: true
  },
  openHours: "08:00 - 20:00", // Default hours
  photos: [],
  lastUpdated: Date.now()
};

async function addToilet() {
  try {
    const docRef = await addDoc(collection(db, "toilets"), newToilet);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

addToilet();
