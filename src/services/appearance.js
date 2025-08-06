import { db } from './database.js';
import { uploadImageToCloudinary } from './database.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Récupère les infos d'apparence de l'entreprise (dans le doc entreprise/main)
export async function getAppearanceInfo() {
  const ref = doc(db, 'entreprise', 'main');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    logo: data.logo || '',
    favicon: data.favicon || '',
    primaryColor: data.primaryColor || '#0B3B47',
    secondaryColor: data.secondaryColor || '#78013B',
    backgroundColor: data.backgroundColor || '#e2b7d3',
    fontFamily: data.fontFamily || 'Inter',
  };
}

// Met à jour les infos d'apparence (merge dans entreprise/main)
export async function updateAppearanceInfo(data) {
  const ref = doc(db, 'entreprise', 'main');
  await setDoc(ref, data, { merge: true });
}

// Upload d'une image (logo ou favicon) sur Cloudinary
export async function uploadAppearanceImage(imageFile) {
  return await uploadImageToCloudinary(imageFile);
}
