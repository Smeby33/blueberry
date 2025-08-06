import database from './database.js';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where 
} from 'firebase/firestore';

const { db } = database;
// Collection de référence
const categoriesCollection = collection(db, 'categories');

/**
 * Récupérer toutes les catégories triées par ordre
 */
export const getCategories = async () => {
  try {
    const q = query(categoriesCollection, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const categories = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('[CategoriesService] Catégories récupérées:', categories.length);
    return categories;
  } catch (error) {
    console.error('[CategoriesService] Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};

/**
 * Récupérer uniquement les catégories visibles
 */
export const getVisibleCategories = async () => {
  try {
    const q = query(
      categoriesCollection, 
      where('visible', '==', true),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const categories = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('[CategoriesService] Catégories visibles récupérées:', categories.length);
    return categories;
  } catch (error) {
    console.error('[CategoriesService] Erreur lors de la récupération des catégories visibles:', error);
    throw error;
  }
};

/**
 * Récupérer une catégorie par son ID
 */
export const getCategoryById = async (categoryId) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categoryDoc = await getDoc(categoryRef);
    
    if (categoryDoc.exists()) {
      return {
        id: categoryDoc.id,
        ...categoryDoc.data()
      };
    } else {
      console.log('[CategoriesService] Catégorie non trouvée:', categoryId);
      return null;
    }
  } catch (error) {
    console.error('[CategoriesService] Erreur lors de la récupération de la catégorie:', error);
    throw error;
  }
};

/**
 * Ajouter une nouvelle catégorie
 */
export const addCategory = async (categoryData) => {
  try {
    const newCategory = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Utiliser l'ID personnalisé si fourni, sinon laisser Firestore générer
    if (categoryData.id) {
      const categoryRef = doc(db, 'categories', categoryData.id);
      await setDoc(categoryRef, newCategory);
      console.log('[CategoriesService] Catégorie ajoutée avec ID personnalisé:', categoryData.id);
      return categoryData.id;
    } else {
      const docRef = await addDoc(categoriesCollection, newCategory);
      console.log('[CategoriesService] Catégorie ajoutée avec ID:', docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error('[CategoriesService] Erreur lors de l\'ajout de la catégorie:', error);
    throw error;
  }
};

/**
 * Mettre à jour une catégorie existante
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const updateData = {
      ...categoryData,
      updatedAt: new Date()
    };
    
    await updateDoc(categoryRef, updateData);
    console.log('[CategoriesService] Catégorie mise à jour:', categoryId);
  } catch (error) {
    console.error('[CategoriesService] Erreur lors de la mise à jour de la catégorie:', error);
    throw error;
  }
};

/**
 * Supprimer une catégorie
 */
export const deleteCategory = async (categoryId) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
    console.log('[CategoriesService] Catégorie supprimée:', categoryId);
  } catch (error) {
    console.error('[CategoriesService] Erreur lors de la suppression de la catégorie:', error);
    throw error;
  }
};

/**
 * Compter le nombre de produits par catégorie
 * Cette fonction sera appelée depuis le service des produits
 */
export const getCategoryItemCount = async (categoryId) => {
  try {
    // TODO: Implémenter quand la collection 'products' sera créée
    // const productsCollection = collection(db, 'products');
    // const q = query(productsCollection, where('categoryId', '==', categoryId));
    // const querySnapshot = await getDocs(q);
    // return querySnapshot.size;
    
    // Pour l'instant, retourner 0
    return 0;
  } catch (error) {
    console.error('[CategoriesService] Erreur lors du comptage des produits:', error);
    return 0;
  }
};
