// Import des dépendances Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase (vraies informations)
const firebaseConfig = {
  apiKey: "AIzaSyDFFmCrgXI2iofAgsw7TmI9YvtTz6cRFZM",
  authDomain: "blueberry-13263.firebaseapp.com",
  projectId: "blueberry-13263",
  storageBucket: "blueberry-13263.firebasestorage.app",
  messagingSenderId: "492567658355",
  appId: "1:492567658355:web:3a9dd29014d649fa414f06",
  measurementId: "G-0XH9VBLM0S"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export des services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuration Cloudinary (vraies informations)
export const cloudinaryConfig = {
  cloudName: 'dat3przfh',
  uploadPreset: 'profile_pictures',
  apiKey: '783896378371361',
  apiSecret: 'pNmSftmlYYYlKs9n8d-6AVS4Gfo'
};

export default app;
