import { db } from './database.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Récupère les infos de l'entreprise (on suppose un seul doc: id 'main')
export async function getEntrepriseInfo() {
  const ref = doc(db, 'entreprise', 'main');
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// Met à jour les infos de l'entreprise (id 'main')
export async function updateEntrepriseInfo(data) {
  const ref = doc(db, 'entreprise', 'main');
  await setDoc(ref, data, { merge: true });
}
