// Script de test simple pour ajouter une catégorie
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBYtS9v2ZI5gQwXgX3CZCktdOcH_OA1BGs",
  authDomain: "restaurants-app-2025.firebaseapp.com",
  projectId: "restaurants-app-2025",
  storageBucket: "restaurants-app-2025.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234567890"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestCategory() {
  try {
    console.log('🧪 Ajout d\'une catégorie de test...');
    
    const testCategory = {
      id: 'test-category',
      name: 'Catégorie Test',
      description: 'Catégorie de test créée par script',
      order: 99,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const categoryRef = doc(db, 'categories', testCategory.id);
    await setDoc(categoryRef, testCategory);
    
    console.log('✅ Catégorie de test ajoutée avec succès !');
    console.log('📍 ID:', testCategory.id);
    console.log('📝 Nom:', testCategory.name);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addTestCategory();
