import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Récupère toutes les catégories (pour stats dynamiques)
export const getAllCategories = async () => {
  try {
    console.log('[categories.js] Tentative de récupération des catégories Firestore...');
    const querySnapshot = await getDocs(collection(db, 'categories'));
    console.log('[categories.js] Nombre de documents récupérés:', querySnapshot.size);
    const categories = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`[categories.js] Catégorie trouvée: id=${doc.id}, data=`, data);
      categories.push({ id: doc.id, ...data });
    });
    console.log('[categories.js] Catégories finales:', categories);
    return categories;
  } catch (error) {
    console.error('[categories.js] Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};
