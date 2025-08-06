// Script d'initialisation des catégories dans Firestore
// Version CommonJS pour exécution directe avec Node.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Configuration Firebase (remplacez par vos vraies clés)
const firebaseConfig = {
  apiKey: "AIzaSyBYtS9v2ZI5gQwXgX3CZCktdOcH_OA1BGs",
  authDomain: "restaurants-app-2025.firebaseapp.com",
  projectId: "restaurants-app-2025",
  storageBucket: "restaurants-app-2025.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234567890"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  {
    id: 'entrees',
    name: 'Entrées',
    order: 1,
    description: 'Petites portions pour commencer le repas',
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'plats',
    name: 'Plats',
    order: 2,
    description: 'Plats principaux',
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'accompagnements',
    name: 'Accompagnements',
    order: 3,
    description: 'Accompagnements pour compléter votre plat',
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'desserts',
    name: 'Desserts',
    order: 4,
    description: 'Douceurs pour finir le repas',
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'boissons',
    name: 'Boissons',
    order: 5,
    description: 'Boissons fraîches et chaudes',
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'specialites',
    name: 'Spécialités',
    order: 6,
    description: 'Nos plats spéciaux et signatures',
    visible: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function initCategories() {
  try {
    console.log('🚀 Initialisation des catégories...');
    
    for (const category of categories) {
      const categoryRef = doc(db, 'categories', category.id);
      await setDoc(categoryRef, category);
      console.log(`✅ Catégorie "${category.name}" ajoutée avec l'ID: ${category.id}`);
    }
    
    console.log('🎉 Toutes les catégories ont été ajoutées avec succès !');
    console.log('📱 Vous pouvez maintenant aller dans l\'interface d\'administration pour les gérer.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des catégories:', error);
    process.exit(1);
  }
}

// Exécuter la fonction
initCategories();
