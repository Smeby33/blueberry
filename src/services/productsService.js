import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query,
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import database from './database.js';

const { db } = database;
const COLLECTION_NAME = 'products';

/**
 * Service pour la gestion des produits
 */

// Ajouter un nouveau produit
export const addProduct = async (productData) => {
  try {
    console.log('[ProductsService] Ajout d\'un produit:', productData);
    
    const productToAdd = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), productToAdd);
    console.log('[ProductsService] Produit ajouté avec l\'ID:', docRef.id);
    
    return { id: docRef.id, ...productToAdd };
  } catch (error) {
    console.error('[ProductsService] Erreur lors de l\'ajout du produit:', error);
    throw error;
  }
};

// Obtenir tous les produits
export const getProducts = async () => {
  try {
    console.log('[ProductsService] Récupération de tous les produits');
    
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('[ProductsService] Produits récupérés:', products.length);
    return products;
  } catch (error) {
    console.error('[ProductsService] Erreur lors de la récupération des produits:', error);
    throw error;
  }
};

// Obtenir les produits par catégorie
export const getProductsByCategory = async (categoryId) => {
  try {
    console.log('[ProductsService] Récupération des produits pour la catégorie:', categoryId);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('category', '==', categoryId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('[ProductsService] Produits trouvés pour la catégorie:', products.length);
    return products;
  } catch (error) {
    console.error('[ProductsService] Erreur lors de la récupération des produits par catégorie:', error);
    throw error;
  }
};

// Obtenir les produits disponibles
export const getAvailableProducts = async () => {
  try {
    console.log('[ProductsService] Récupération des produits disponibles');
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('available', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('[ProductsService] Produits disponibles:', products.length);
    return products;
  } catch (error) {
    console.error('[ProductsService] Erreur lors de la récupération des produits disponibles:', error);
    throw error;
  }
};

// Obtenir les produits spéciaux/recommandés
export const getSpecialProducts = async () => {
  try {
    console.log('[ProductsService] Récupération des produits spéciaux');
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isSpecial', '==', true),
      where('available', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('[ProductsService] Produits spéciaux trouvés:', products.length);
    return products;
  } catch (error) {
    console.error('[ProductsService] Erreur lors de la récupération des produits spéciaux:', error);
    throw error;
  }
};

// Obtenir un produit par ID
export const getProductById = async (productId) => {
  try {
    console.log('[ProductsService] Récupération du produit avec l\'ID:', productId);
    
    const docRef = doc(db, COLLECTION_NAME, productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const product = { id: docSnap.id, ...docSnap.data() };
      console.log('[ProductsService] Produit trouvé:', product);
      return product;
    } else {
      console.log('[ProductsService] Aucun produit trouvé avec cet ID');
      return null;
    }
  } catch (error) {
    console.error('[ProductsService] Erreur lors de la récupération du produit:', error);
    throw error;
  }
};

// Mettre à jour un produit
export const updateProduct = async (productId, productData) => {
  try {
    console.log('[ProductsService] Mise à jour du produit:', productId, productData);
    
    const productToUpdate = {
      ...productData,
      updatedAt: serverTimestamp()
    };
    
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, productToUpdate);
    
    console.log('[ProductsService] Produit mis à jour avec succès');
    return { id: productId, ...productToUpdate };
  } catch (error) {
    console.error('[ProductsService] Erreur lors de la mise à jour du produit:', error);
    throw error;
  }
};

// Supprimer un produit
export const deleteProduct = async (productId) => {
  try {
    console.log('[ProductsService] Suppression du produit:', productId);
    
    const docRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(docRef);
    
    console.log('[ProductsService] Produit supprimé avec succès');
    return true;
  } catch (error) {
    console.error('[ProductsService] Erreur lors de la suppression du produit:', error);
    throw error;
  }
};

// Mettre à jour le statut de disponibilité d'un produit
export const toggleProductAvailability = async (productId, available) => {
  try {
    console.log('[ProductsService] Changement de disponibilité du produit:', productId, available);
    
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, {
      available: available,
      updatedAt: serverTimestamp()
    });
    
    console.log('[ProductsService] Disponibilité du produit mise à jour');
    return true;
  } catch (error) {
    console.error('[ProductsService] Erreur lors du changement de disponibilité:', error);
    throw error;
  }
};

// Mettre à jour le statut spécial d'un produit
export const toggleProductSpecial = async (productId, isSpecial) => {
  try {
    console.log('[ProductsService] Changement du statut spécial du produit:', productId, isSpecial);
    
    const docRef = doc(db, COLLECTION_NAME, productId);
    await updateDoc(docRef, {
      isSpecial: isSpecial,
      updatedAt: serverTimestamp()
    });
    
    console.log('[ProductsService] Statut spécial du produit mis à jour');
    return true;
  } catch (error) {
    console.error('[ProductsService] Erreur lors du changement de statut spécial:', error);
    throw error;
  }
};

// Obtenir le nombre total de produits
export const getProductsCount = async () => {
  try {
    console.log('[ProductsService] Calcul du nombre total de produits');
    
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const count = querySnapshot.size;
    
    console.log('[ProductsService] Nombre total de produits:', count);
    return count;
  } catch (error) {
    console.error('[ProductsService] Erreur lors du calcul du nombre de produits:', error);
    throw error;
  }
};

// Rechercher des produits par nom
export const searchProducts = async (searchTerm) => {
  try {
    console.log('[ProductsService] Recherche de produits avec le terme:', searchTerm);
    
    // Firebase ne supporte pas la recherche full-text native
    // On récupère tous les produits et on filtre côté client
    const allProducts = await getProducts();
    
    const filteredProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    console.log('[ProductsService] Produits trouvés:', filteredProducts.length);
    return filteredProducts;
  } catch (error) {
    console.error('[ProductsService] Erreur lors de la recherche de produits:', error);
    throw error;
  }
};
