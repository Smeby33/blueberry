// Script d'initialisation des catégories dans Firestore
// Exécuter ce script une seule fois pour créer les catégories de base

import { db } from '../services/firebase.js';
import { collection, doc, setDoc } from 'firebase/firestore';

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
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des catégories:', error);
  }
}

// Exécuter la fonction
initCategories();
