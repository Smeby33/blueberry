// Récupérer les adresses de l'utilisateur connecté
export const getUserAddresses = async (userId) => {
  try {
    console.log('[getUserAddresses] userId reçu:', userId);
    const userRef = doc(db, 'users', userId);
    console.log('[getUserAddresses] userRef:', userRef);
    const userSnap = await getDoc(userRef);
    console.log('[getUserAddresses] userSnap exists:', userSnap.exists());
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (typeof window !== 'undefined') {
        window.__LAST_USER_DOC = data;
      }
      console.log('[getUserAddresses] Données Firestore:', data);
      console.log('[getUserAddresses] Adresses trouvées:', data.addresses);
      return data.addresses || [];
    } else {
      console.log('[getUserAddresses] Aucun document trouvé pour cet userId');
    }
    return [];
  } catch (error) {
    console.error('[getUserAddresses] Erreur:', error);
    return [];
  }
};
import database from './database.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, getDoc } from 'firebase/firestore';

console.log('🔧 [orders.js] Module chargé');
console.log('🔧 [orders.js] Database importé:', typeof database);

const { db } = database;

console.log('🔧 [orders.js] db extrait:', db);
console.log('🔧 [orders.js] Type de db:', typeof db);

// Ajouter une nouvelle commande
export const addOrder = async (orderData) => {
  console.log('🚀 [orders.js] addOrder appelée');
  console.log('📄 [orders.js] orderData reçue:', orderData);
  console.log('🔍 [orders.js] db disponible:', !!db);
  console.log('🔍 [orders.js] collection function:', typeof collection);
  console.log('🔍 [orders.js] addDoc function:', typeof addDoc);
  
  try {
    console.log('📝 [orders.js] Début du processus d\'ajout de commande');
    console.log('🔍 [orders.js] Vérification de db:', db);
    console.log('🔍 [orders.js] Type de db:', typeof db);
    
    const orderToAdd = {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'non-confirmé' // Statut par défaut
    };
    
    console.log('📦 [orders.js] Données de commande préparées:', orderToAdd);
    console.log('🚀 [orders.js] Tentative de création de la collection...');
    
    const ordersCollection = collection(db, 'orders');
    console.log('✅ [orders.js] Collection créée:', ordersCollection);
    
    console.log('🚀 [orders.js] Tentative d\'ajout du document...');
    const docRef = await addDoc(ordersCollection, orderToAdd);
    console.log('✅ [orders.js] Document ajouté avec l\'ID:', docRef.id);
    
    const result = {
      id: docRef.id,
      ...orderToAdd
    };
    
    console.log('🎉 [orders.js] Commande créée avec succès:', result);
    return result;
    
  } catch (error) {
    console.error('❌ [orders.js] Erreur lors de l\'ajout de la commande:', error);
    console.error('❌ [orders.js] Type d\'erreur:', typeof error);
    console.error('❌ [orders.js] Message:', error?.message);
    console.error('❌ [orders.js] Code:', error?.code);
    console.error('❌ [orders.js] Stack trace:', error?.stack);
    throw error;
  }
};

// Récupérer toutes les commandes
export const getOrders = async () => {
  try {
    console.log('📖 [orders.js] Récupération de toutes les commandes');
    const querySnapshot = await getDocs(collection(db, 'orders'));
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    if (orders.length > 0) {
      // Log un exemple de commande complète, avec items
      const example = orders[0];
      console.log('[orders.js] Exemple de commande récupérée:', example);
      if (example.items) {
        console.log('[orders.js] Items de la commande exemple:', example.items);
      }
    }
    console.log('✅ [orders.js] Commandes récupérées:', orders.length);
    return orders;
  } catch (error) {
    console.error('❌ [orders.js] Erreur lors de la récupération des commandes:', error);
    throw error;
  }
};

// Récupérer les commandes d'un utilisateur spécifique
// Récupérer uniquement les commandes confirmées d'un utilisateur
export const getUserConfirmedOrders = async (userId) => {
  try {
    const ordersCollection = collection(db, 'orders');
    const q = query(
      ordersCollection,
      where('userId', '==', userId),
      where('status', '==', 'confirmé')
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return orders;
  } catch (error) {
    console.error('[orders.js] Erreur getUserConfirmedOrders:', error);
    throw error;
  }
};
export const getUserOrders = async (userId) => {
  try {
    console.log('🔍🔍🔍 [orders.js] ===== DÉBUT getUserOrders =====');
    console.log('📖 [orders.js] Récupération des commandes pour l\'utilisateur:', userId);
    console.log('📖 [orders.js] Type de userId:', typeof userId);
    console.log('📖 [orders.js] Valeur exacte userId:', JSON.stringify(userId));
    
    console.log('🔍 [orders.js] Construction de la requête filtrée directement...');
    const ordersCollection = collection(db, 'orders');
    console.log('✅ [orders.js] Collection orders récupérée');
    
    // Requête filtrée par userId ET statut non-confirmé (conforme aux règles Firestore)
    const q = query(
      ordersCollection, 
      where('userId', '==', userId),
      where('status', '==', 'non-confirmé')
    );
    console.log('✅ [orders.js] Requête construite avec where userId ==', userId, 'et status == non-confirmé');
    
    console.log('🚀 [orders.js] Exécution de la requête filtrée...');
    const querySnapshot = await getDocs(q);
    console.log('✅ [orders.js] Requête exécutée, résultats reçus');
    console.log('📊 [orders.js] Nombre de documents trouvés:', querySnapshot.size);
    console.log('📊 [orders.js] Query snapshot empty?', querySnapshot.empty);
    
    const orders = [];
    let docCount = 0;
    
    querySnapshot.forEach((doc) => {
      docCount++;
      const docData = doc.data();
      console.log(`📄 [orders.js] Document ${docCount}:`, {
        id: doc.id,
        userId: docData.userId,
        userEmail: docData.userEmail,
        userName: docData.userName,
        status: docData.status,
        orderNumber: docData.orderNumber,
        total: docData.total,
        createdAt: docData.createdAt
      });
      
      console.log(`🔍 [orders.js] Document ${docCount} - Comparaison userId:`);
      console.log(`   - Recherché: "${userId}" (type: ${typeof userId})`);
      console.log(`   - Trouvé: "${docData.userId}" (type: ${typeof docData.userId})`);
      console.log(`   - Match: ${userId === docData.userId}`);
      
      orders.push({
        id: doc.id,
        ...docData
      });
    });
    
    console.log('✅ [orders.js] Tous les documents traités');
    console.log('📊 [orders.js] Nombre final de commandes:', orders.length);
    console.log('📦 [orders.js] Commandes récupérées:', orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      userId: order.userId,
      total: order.total
    })));
    console.log('🎉🎉🎉 [orders.js] ===== FIN getUserOrders =====');
    
    return orders;
  } catch (error) {
    console.error('💥💥💥 [orders.js] ===== ERREUR getUserOrders =====');
    console.error('❌ [orders.js] Erreur lors de la récupération des commandes utilisateur:', error);
    console.error('❌ [orders.js] Type d\'erreur:', typeof error);
    console.error('❌ [orders.js] Message d\'erreur:', error?.message);
    console.error('❌ [orders.js] Code d\'erreur:', error?.code);
    console.error('❌ [orders.js] Stack trace:', error?.stack);
    console.error('💥💥💥 [orders.js] ===== FIN ERREUR getUserOrders =====');
    throw error;
  }
};

// Mettre à jour le statut d'une commande
import { addNotification } from './database.js';
export const updateOrderStatus = async (orderId, newStatus) => {
  // Log l'utilisateur Firebase courant
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('[orders.js] Utilisateur Firebase courant:', {
        uid: currentUser.uid,
        email: currentUser.email
      });
    } else {
      console.warn('[orders.js] Aucun utilisateur Firebase authentifié au moment de l\'update');
    }
  } catch (e) {
    console.warn('[orders.js] Erreur lors du log de l\'utilisateur Firebase courant:', e);
  }
  try {
    console.log('🔄 [orders.js] Mise à jour du statut de la commande:', orderId, 'vers:', newStatus);
    const orderRef = doc(db, 'orders', orderId);
    // Lire le document avant la mise à jour pour debug
    const snap = await getDoc(orderRef);
    let prevOrder = {};
    if (snap.exists()) {
      prevOrder = snap.data();
      console.log('[orders.js] Document avant update:', prevOrder);
      console.log('[orders.js] userId dans le document:', prevOrder.userId);
    } else {
      console.warn('[orders.js] Document non trouvé pour orderId:', orderId);
    }
    // Si newStatus est un objet, on merge ses champs, sinon on met à jour le champ 'status'
    let updateFields = {};
    if (typeof newStatus === 'object' && newStatus !== null) {
      updateFields = { ...newStatus };
    } else {
      updateFields = { status: newStatus };
    }
    updateFields.updatedAt = new Date();
    await updateDoc(orderRef, updateFields);
    console.log('✅ [orders.js] Statut de la commande mis à jour');

    // Notification logique déplacée ici
    // Récupérer la commande mise à jour
    const updatedSnap = await getDoc(orderRef);
    if (updatedSnap.exists()) {
      const order = updatedSnap.data();
      // Notification pour changement de niveau
      if (updateFields.niveau && updateFields.niveau !== prevOrder.niveau) {
        const notif = {
          userId: order.userId,
          orderId: orderId,
          title: 'Niveau de commande mis à jour',
          message: `Le niveau de votre commande a été changé en : ${updateFields.niveau}`,
          createdAt: new Date(),
          read: false
        };
        console.log('[NOTIF][orders.js] Tentative création notification NIVEAU:', notif);
        try {
          await addNotification(notif);
          console.log('[NOTIF][orders.js] Notification NIVEAU créée avec succès !');
        } catch (notifErr) {
          console.error('[NOTIF][orders.js] Erreur création notification NIVEAU:', notifErr);
        }
      }
      // Notification pour changement de statut
      if (updateFields.status && updateFields.status !== prevOrder.status) {
        const notif = {
          userId: order.userId,
          orderId: orderId,
          title: 'Statut de commande mis à jour',
          message: `Le statut de votre commande a été changé en : ${updateFields.status}`,
          createdAt: new Date(),
          read: false
        };
        console.log('[NOTIF][orders.js] Tentative création notification STATUT:', notif);
        try {
          await addNotification(notif);
          console.log('[NOTIF][orders.js] Notification STATUT créée avec succès !');
        } catch (notifErr) {
          console.error('[NOTIF][orders.js] Erreur création notification STATUT:', notifErr);
        }
      }
    }
    return true;
  } catch (error) {
    console.error('❌ [orders.js] Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
};

// Supprimer une commande
export const deleteOrder = async (orderId) => {
  try {
    console.log('🗑️ [orders.js] Suppression de la commande:', orderId);
    await deleteDoc(doc(db, 'orders', orderId));
    console.log('✅ [orders.js] Commande supprimée');
    return true;
  } catch (error) {
    console.error('❌ [orders.js] Erreur lors de la suppression de la commande:', error);
    throw error;
  }
};