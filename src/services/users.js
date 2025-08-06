import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Récupère tous les utilisateurs (pour stats nouveaux clients)
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('[users.js] Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};
