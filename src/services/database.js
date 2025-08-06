// === TEST DE NOTIFICATION ===
/**
 * Test manuel de création de notification pour un utilisateur
 * @param {string} userId - L'ID de l'utilisateur cible
 */
export async function testNotification(userId) {
  const notif = {
    userId,
    title: 'Test de notification',
    message: 'Ceci est une notification de test générée manuellement.',
    createdAt: new Date(),
    read: false
  };
  console.log('[NOTIF][TEST] Tentative création notification test:', notif);
  try {
    const id = await addNotification(notif);
    console.log('[NOTIF][TEST] Notification test créée avec succès ! id:', id);
    return id;
  } catch (err) {
    console.error('[NOTIF][TEST] Erreur création notification test:', err);
    throw err;
  }
}
// ======== OPÉRATIONS SUR L'ENTREPRISE ========
/**
 * Récupère les informations de l'entreprise (document 'main' de la collection 'entreprise')
 */
export const getEntrepriseInfo = async () => {
  try {
    const entrepriseRef = doc(db, 'entreprise', 'main');
    const entrepriseSnap = await getDoc(entrepriseRef);
    if (entrepriseSnap.exists()) {
      return {
        id: entrepriseSnap.id,
        ...entrepriseSnap.data()
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
};
// Import des dépendances Firebase
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// === NOTIFICATIONS UTILITY ===
export async function addNotification(notif) {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notif,
      createdAt: notif.createdAt || serverTimestamp(),
      read: false
    });
    console.log('[NOTIF] Notification écrite dans Firestore, id:', docRef.id, notif);
    return docRef.id;
  } catch (err) {
    console.error('[NOTIF] Erreur Firestore lors de addNotification:', err, notif);
    throw err;
  }
}

import { initializeApp } from 'firebase/app';
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
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
// Configuration Cloudinary (vraies informations)
const cloudinaryConfig = {
// ...existing code...
  cloudName: 'dat3przfh',
  uploadPreset: 'profile_pictures',
  apiKey: '783896378371361',
  apiSecret: 'pNmSftmlYYYlKs9n8d-6AVS4Gfo'
};
/**
 * Structure de la base de données Firebase
 * 
 * Collections:
 * - users: Utilisateurs de l'application
 * - products: Produits du restaurant
 * - categories: Catégories de produits
 * - orders: Commandes des clients
 * - settings: Paramètres de l'application
 */
/**
 * Collection: users
 * Description: Stocke les informations des utilisateurs
 * Relations:
 * - Un utilisateur peut avoir plusieurs commandes (orders)
 */
const usersCollection = collection(db, 'users');
/**
 * Collection: products
 * Description: Stocke les informations des produits
 * Relations:
 * - Un produit appartient à une catégorie (categories)
 */
const productsCollection = collection(db, 'products');
/**
 * Collection: categories
 * Description: Stocke les catégories de produits
 * Relations:
 * - Une catégorie peut contenir plusieurs produits (products)
 */
const categoriesCollection = collection(db, 'categories');
/**
 * Collection: orders
 * Description: Stocke les commandes des clients
 * Relations:
 * - Une commande appartient à un utilisateur (users)
 * - Une commande contient plusieurs produits (products)
 */
const ordersCollection = collection(db, 'orders');
/**
 * Collection: settings
 * Description: Stocke les paramètres de l'application
 */
const settingsCollection = collection(db, 'settings');
// ======== OPÉRATIONS SUR LES UTILISATEURS ========
/**
 * Crée un nouvel utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 * @param {object} userData - Données supplémentaires de l'utilisateur
 */
export const createUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Mise à jour du profil utilisateur
    await updateProfile(user, {
      displayName: userData.name
    });
    // Ajout des informations supplémentaires dans la collection users
    await addDoc(usersCollection, {
      uid: user.uid,
      name: userData.name,
      email: user.email,
      phone: userData.phone || null,
      address: userData.address || null,
      role: userData.role || 'client',
      createdAt: serverTimestamp()
    });
    return user;
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère les informations d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 */
export const getUser = async userId => {
  try {
    const userQuery = query(usersCollection, where("uid", "==", userId));
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
};
/**
 * Met à jour les informations d'un utilisateur
 * @param {string} userId - ID du document de l'utilisateur
 * @param {object} userData - Nouvelles données de l'utilisateur
 */
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, userData);
    return true;
  } catch (error) {
    throw error;
  }
};
/**
 * Supprime un utilisateur
 * @param {string} userId - ID du document de l'utilisateur
 */
export const deleteUser = async userId => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return true;
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère tous les utilisateurs
 * @param {string} role - Filtre par rôle (optionnel)
 */
export const getAllUsers = async (role = null) => {
  try {
    let usersQuery;
    if (role) {
      usersQuery = query(usersCollection, where("role", "==", role));
    } else {
      usersQuery = query(usersCollection);
    }
    const querySnapshot = await getDocs(usersQuery);
    const users = [];
    querySnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return users;
  } catch (error) {
    throw error;
  }
};
// ======== OPÉRATIONS SUR LES PRODUITS ========
/**
 * Crée un nouveau produit
 * @param {object} productData - Données du produit
 * @param {File} imageFile - Fichier image du produit
 */
export const createProduct = async (productData, imageFile) => {
  try {
    // Upload de l'image sur Cloudinary
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImageToCloudinary(imageFile);
    }
    // Ajout du produit dans la collection products
    const productRef = await addDoc(productsCollection, {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      category: productData.category,
      image: imageUrl,
      available: productData.available || true,
      isSpecial: productData.isSpecial || false,
      createdAt: serverTimestamp()
    });
    return {
      id: productRef.id
    };
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère un produit par son ID
 * @param {string} productId - ID du produit
 */
export const getProduct = async productId => {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data()
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
};
/**
 * Met à jour un produit
 * @param {string} productId - ID du produit
 * @param {object} productData - Nouvelles données du produit
 * @param {File} imageFile - Nouveau fichier image (optionnel)
 */
export const updateProduct = async (productId, productData, imageFile = null) => {
  try {
    const productRef = doc(db, 'products', productId);
    // Si une nouvelle image est fournie, la télécharger
    if (imageFile) {
      // Récupération de l'ancien produit pour obtenir l'ancienne URL d'image
      const oldProductSnap = await getDoc(productRef);
      const oldImageUrl = oldProductSnap.data().image;
      // Suppression de l'ancienne image de Cloudinary si elle existe
      if (oldImageUrl) {
        await deleteImageFromCloudinary(oldImageUrl);
      }
      // Upload de la nouvelle image
      productData.image = await uploadImageToCloudinary(imageFile);
    }
    // Mise à jour du produit
    await updateDoc(productRef, productData);
    return true;
  } catch (error) {
    throw error;
  }
};
/**
 * Supprime un produit
 * @param {string} productId - ID du produit
 */
export const deleteProduct = async productId => {
  try {
    // Récupération du produit pour obtenir l'URL de l'image
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const imageUrl = productSnap.data().image;
      // Suppression de l'image de Cloudinary si elle existe
      if (imageUrl) {
        await deleteImageFromCloudinary(imageUrl);
      }
      // Suppression du produit
      await deleteDoc(productRef);
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère tous les produits
 * @param {string} categoryId - Filtre par catégorie (optionnel)
 */
export const getAllProducts = async (categoryId = null) => {
  try {
    let productsQuery;
    if (categoryId) {
      productsQuery = query(productsCollection, where("category", "==", categoryId));
    } else {
      productsQuery = query(productsCollection);
    }
    const querySnapshot = await getDocs(productsQuery);
    const products = [];
    querySnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return products;
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère les produits spéciaux/mis en avant
 */
export const getSpecialProducts = async () => {
  try {
    const specialProductsQuery = query(productsCollection, where("isSpecial", "==", true), where("available", "==", true));
    const querySnapshot = await getDocs(specialProductsQuery);
    const specialProducts = [];
    querySnapshot.forEach(doc => {
      specialProducts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return specialProducts;
  } catch (error) {
    throw error;
  }
};
// ======== OPÉRATIONS SUR LES CATÉGORIES ========
/**
 * Crée une nouvelle catégorie
 * @param {object} categoryData - Données de la catégorie
 */
export const createCategory = async categoryData => {
  try {
    const categoryRef = await addDoc(categoriesCollection, {
      name: categoryData.name,
      id: categoryData.id,
      // ID technique utilisé comme référence
      description: categoryData.description || "",
      order: categoryData.order || 0,
      visible: categoryData.visible !== undefined ? categoryData.visible : true,
      createdAt: serverTimestamp()
    });
    return {
      id: categoryRef.id
    };
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère une catégorie par son ID
 * @param {string} categoryId - ID de la catégorie
 */
export const getCategory = async categoryId => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categorySnap = await getDoc(categoryRef);
    if (categorySnap.exists()) {
      return {
        id: categorySnap.id,
        ...categorySnap.data()
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
};
/**
 * Met à jour une catégorie
 * @param {string} categoryId - ID de la catégorie
 * @param {object} categoryData - Nouvelles données de la catégorie
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await updateDoc(categoryRef, categoryData);
    return true;
  } catch (error) {
    throw error;
  }
};
/**
 * Supprime une catégorie
 * @param {string} categoryId - ID de la catégorie
 */
export const deleteCategory = async categoryId => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    await deleteDoc(categoryRef);
    return true;
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère toutes les catégories
 * @param {boolean} visibleOnly - Ne récupérer que les catégories visibles
 */
export const getAllCategories = async (visibleOnly = false) => {
  try {
    let categoriesQuery;
    if (visibleOnly) {
      categoriesQuery = query(categoriesCollection, where("visible", "==", true), orderBy("order", "asc"));
    } else {
      categoriesQuery = query(categoriesCollection, orderBy("order", "asc"));
    }
    const querySnapshot = await getDocs(categoriesQuery);
    const categories = [];
    querySnapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return categories;
  } catch (error) {
    throw error;
  }
};
// ======== OPÉRATIONS SUR LES COMMANDES ========
/**
 * Crée une nouvelle commande
 * @param {object} orderData - Données de la commande
 */
export const createOrder = async orderData => {
  try {
    // Calcul du total de la commande
    let total = 0;
    orderData.items.forEach(item => {
      total += item.price * item.quantity;
    });
    const orderRef = await addDoc(ordersCollection, {
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone || null,
      address: orderData.address || null,
      items: orderData.items,
      total: total,
      status: orderData.status || 'En attente',
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus || 'En attente',
      createdAt: serverTimestamp()
    });
    return {
      id: orderRef.id
    };
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère une commande par son ID
 * @param {string} orderId - ID de la commande
 */
export const getOrder = async orderId => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      return {
        id: orderSnap.id,
        ...orderSnap.data()
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
};
/**
 * Met à jour une commande
 * @param {string} orderId - ID de la commande
 * @param {object} orderData - Nouvelles données de la commande
 */
export const updateOrder = async (orderId, orderData) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, orderData);
    return true;
  } catch (error) {
    throw error;
  }
};
/**
 * Met à jour le statut d'une commande
 * @param {string} orderId - ID de la commande
 * @param {string} status - Nouveau statut
 */
export const updateOrderStatus = async (orderId, updateData) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    // Récupérer l'ancienne commande
    const prevSnap = await getDoc(orderRef);
    const prevOrder = prevSnap.exists() ? prevSnap.data() : {};

    await updateDoc(orderRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    // Récupérer la commande mise à jour
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      const order = orderSnap.data();
      // Notification pour changement de niveau
      if (updateData.niveau && updateData.niveau !== prevOrder.niveau) {
        const notif = {
          userId: order.userId || order.customerId,
          title: 'Niveau de commande mis à jour',
          message: `Le niveau de votre commande a été changé en : ${updateData.niveau}`,
          createdAt: serverTimestamp(),
          read: false
        };
        console.log('[NOTIF] Tentative création notification NIVEAU:', notif);
        try {
          await addNotification(notif);
          console.log('[NOTIF] Notification NIVEAU créée avec succès !');
        } catch (notifErr) {
          console.error('[NOTIF] Erreur création notification NIVEAU:', notifErr);
        }
      }
      // Notification pour changement de statut (optionnel)
      if (updateData.status && updateData.status !== prevOrder.status) {
        const notif = {
          userId: order.userId || order.customerId,
          title: 'Statut de commande mis à jour',
          message: `Le statut de votre commande a été changé en : ${updateData.status}`,
          createdAt: serverTimestamp(),
          read: false
        };
        console.log('[NOTIF] Tentative création notification STATUT:', notif);
        try {
          await addNotification(notif);
          console.log('[NOTIF] Notification STATUT créée avec succès !');
        } catch (notifErr) {
          console.error('[NOTIF] Erreur création notification STATUT:', notifErr);
        }
      }
    }
    return true;
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère toutes les commandes
 * @param {string} status - Filtre par statut (optionnel)
 * @param {string} customerId - Filtre par client (optionnel)
 * @param {number} limit - Limite de résultats (optionnel)
 */
export const getAllOrders = async (status = null, customerId = null, limitCount = null) => {
  try {
    let ordersQuery;
    if (status && customerId) {
      ordersQuery = query(ordersCollection, where("status", "==", status), where("customerId", "==", customerId), orderBy("createdAt", "desc"));
    } else if (status) {
      ordersQuery = query(ordersCollection, where("status", "==", status), orderBy("createdAt", "desc"));
    } else if (customerId) {
      ordersQuery = query(ordersCollection, where("customerId", "==", customerId), orderBy("createdAt", "desc"));
    } else {
      ordersQuery = query(ordersCollection, orderBy("createdAt", "desc"));
    }
    if (limitCount) {
      ordersQuery = query(ordersQuery, limit(limitCount));
    }
    const querySnapshot = await getDocs(ordersQuery);
    const orders = [];
    querySnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return orders;
  } catch (error) {
    throw error;
  }
};
// ======== OPÉRATIONS SUR LES PARAMÈTRES ========
/**
 * Récupère les paramètres de l'application
 */
export const getSettings = async () => {
  try {
    const settingsQuery = query(settingsCollection, limit(1));
    const querySnapshot = await getDocs(settingsQuery);
    if (!querySnapshot.empty) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    }
    // Si aucun paramètre n'existe, créer les paramètres par défaut
    const defaultSettings = {
      restaurantName: "Blueberry",
      email: "contact@blueberry-pg.com",
      phone: "+241 01 23 45 67",
      address: "Boulevard Champagne, Port-Gentil, Gabon",
      description: "Blueberry est votre restaurant de fast-food de référence à Port-Gentil, spécialisé dans les burgers, pizzas, glaces artisanales et crêpes gourmandes.",
      website: "https://www.blueberry-pg.com",
      colors: {
        primary: "#00559b",
        secondary: "#7ff4eb",
        background: "#e1edf7"
      },
      fontFamily: "Inter",
      createdAt: serverTimestamp()
    };
    const settingsRef = await addDoc(settingsCollection, defaultSettings);
    return {
      id: settingsRef.id,
      ...defaultSettings
    };
  } catch (error) {
    throw error;
  }
};
/**
 * Met à jour les paramètres de l'application
 * @param {string} settingsId - ID des paramètres
 * @param {object} settingsData - Nouvelles données des paramètres
 */
export const updateSettings = async (settingsId, settingsData) => {
  try {
    const settingsRef = doc(db, 'settings', settingsId);
    await updateDoc(settingsRef, {
      ...settingsData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    throw error;
  }
};
// ======== GESTION DES IMAGES AVEC CLOUDINARY ========
/**
 * Télécharge une image sur Cloudinary
 * @param {File} imageFile - Fichier image à télécharger
 * @returns {Promise<string>} - URL de l'image téléchargée
 */
export const uploadImageToCloudinary = async imageFile => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement de l\'image');
    }
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    throw error;
  }
};
/**
 * Supprime une image de Cloudinary
 * @param {string} imageUrl - URL de l'image à supprimer
 */
export const deleteImageFromCloudinary = async imageUrl => {
  try {
    // Extraction du public_id à partir de l'URL
    const urlParts = imageUrl.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const publicId = filenameWithExtension.split('.')[0];
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = generateCloudinarySignature(`public_id=${publicId}&timestamp=${timestamp}`);
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp);
    formData.append('api_key', cloudinaryConfig.apiKey);
    formData.append('signature', signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de l\'image');
    }
    const data = await response.json();
    return data.result === 'ok';
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return false;
  }
};
/**
 * Génère une signature Cloudinary pour l'authentification
 * @param {string} paramsToSign - Paramètres à signer
 * @returns {string} - Signature générée
 */
const generateCloudinarySignature = paramsToSign => {
  // Note: Dans une application réelle, cette fonction devrait être implémentée côté serveur
  // car elle nécessite la clé secrète Cloudinary qui ne doit pas être exposée côté client
  // Cette implémentation est simplifiée pour l'exemple
  // Vous auriez besoin d'une fonction de hachage comme crypto-js
  // const crypto = require('crypto-js');
  // return crypto.SHA1(paramsToSign + cloudinaryConfig.apiSecret).toString();
  console.warn('La génération de signature Cloudinary doit être implémentée côté serveur');
  return 'signature_placeholder';
};
// ======== AUTHENTIFICATION ========
/**
 * Connecte un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe de l'utilisateur
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Récupération des informations supplémentaires de l'utilisateur
    const userQuery = query(usersCollection, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        address: userData.address
      };
    }
    return {
      uid: user.uid,
      email: user.email
    };
  } catch (error) {
    throw error;
  }
};
/**
 * Déconnecte l'utilisateur courant
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};
/**
 * Récupère l'utilisateur actuellement connecté
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      unsubscribe();
      if (user) {
        try {
          // Récupération des informations supplémentaires de l'utilisateur
          const userQuery = query(usersCollection, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(userQuery);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            resolve({
              uid: user.uid,
              email: user.email,
              name: userData.name,
              role: userData.role,
              phone: userData.phone,
              address: userData.address
            });
          } else {
            resolve({
              uid: user.uid,
              email: user.email
            });
          }
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(null);
      }
    }, reject);
  });
};
export default {
  // Collections
  usersCollection,
  productsCollection,
  categoriesCollection,
  ordersCollection,
  settingsCollection,
  // Utilisateurs
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  // Produits
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSpecialProducts,
  // Catégories
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  // Commandes
  createOrder,
  getOrder,
  updateOrder,
  updateOrderStatus,
  getAllOrders,
  // Paramètres
  getSettings,
  updateSettings,
  // Images
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  // Authentification
  loginUser,
  logoutUser,
  getCurrentUser,
  // Firebase instances
  db,
  auth,
  storage
};

// === NOTIFICATIONS EXPORTS ===
/**
 * Récupère les notifications (toutes ou par utilisateur)
 * @param {string} userId - ID de l'utilisateur (optionnel)
 */
export const getNotifications = async (userId = null) => {
  try {
    let notificationsQuery;
    if (userId) {
      notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    } else {
      notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    }
    const querySnapshot = await getDocs(notificationsQuery);
    const notifications = [];
    querySnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return notifications;
  } catch (error) {
    throw error;
  }
};

/**
 * Marque une notification comme lue
 * @param {string} notificationId - ID de la notification
 */
export const markNotificationAsRead = async notificationId => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
    return true;
  } catch (error) {
    throw error;
  }
};