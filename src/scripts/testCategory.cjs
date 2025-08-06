// Script d'initialisation des catégories - Version de test
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, connectFirestoreEmulator } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYtS9v2ZI5gQwXgX3CZCktdOcH_OA1BGs",
  authDomain: "restaurants-app-2025.firebaseapp.com",
  projectId: "restaurants-app-2025",
  storageBucket: "restaurants-app-2025.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234567890"
};

console.log('🔥 Initialisation de Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test simple - une seule catégorie
const testCategory = {
  id: 'entrees',
  name: 'Entrées',
  order: 1,
  description: 'Petites portions pour commencer le repas',
  visible: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

async function testCategoryCreation() {
  try {
    console.log('🧪 Test de création d\'une catégorie...');
    console.log('📝 Catégorie à créer:', testCategory);
    
    const categoryRef = doc(db, 'categories', testCategory.id);
    console.log('📍 Référence du document:', categoryRef.path);
    
    await setDoc(categoryRef, testCategory);
    console.log('✅ Catégorie de test créée avec succès !');
    
    console.log('🎉 Test réussi ! Vous pouvez maintenant exécuter le script complet.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('📋 Détails de l\'erreur:', error.message);
    console.error('🔍 Code d\'erreur:', error.code);
    process.exit(1);
  }
}

console.log('🚀 Démarrage du test...');
testCategoryCreation();
