import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const testFirestore = async () => {
  try {
    console.log('🧪 Test de connexion Firestore...');
    console.log('🔗 Base de données:', db.app.options.projectId);
    
    // Créer un document de test avec un ID unique
    const testId = `test-${Date.now()}`;
    const testDocRef = doc(db, 'test', testId);
    
    const testData = {
      message: 'Test de connexion Firestore',
      timestamp: serverTimestamp(),
      success: true,
      testId: testId
    };
    
    console.log('📝 Tentative d\'écriture du document:', testId);
    await setDoc(testDocRef, testData);
    
    console.log('✅ Document de test créé avec succès');
    
    // Attendre un peu pour la propagation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Lire le document de test
    console.log('📖 Tentative de lecture du document...');
    const testDoc = await getDoc(testDocRef);
    if (testDoc.exists()) {
      console.log('✅ Document de test lu avec succès:', testDoc.data());
      return true;
    } else {
      console.log('❌ Document de test non trouvé');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Erreur lors du test Firestore:', error);
    console.error('❌ Code d\'erreur:', error.code);
    console.error('❌ Message d\'erreur:', error.message);
    return false;
  }
};

export default testFirestore;
