import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// Hook simple sans contexte pour l'authentification
export const useSimpleAuth = () => {
  
  const register = async (email: string, password: string, name: string): Promise<void> => {
    console.log('[useSimpleAuth] 🚀 Inscription directe:', email, name);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[useSimpleAuth] ✅ Utilisateur créé dans Firebase Auth:', userCredential.user.uid);
      
      if (userCredential.user && name) {
        // Mise à jour du profil utilisateur
        await updateProfile(userCredential.user, { displayName: name });
        console.log('[useSimpleAuth] ✅ Profil utilisateur mis à jour');
        
        // Attendre la propagation
        console.log('[useSimpleAuth] ⏳ Attente de propagation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Créer le document utilisateur
        console.log('[useSimpleAuth] 📝 Création du document Firestore...');
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        
        const userData = {
          uid: userCredential.user.uid,
          name: name,
          email: userCredential.user.email,
          phone: null,
          address: null,
          photoProfile: null, // Peut être mis à jour plus tard
          role: 'client',
          createdAt: serverTimestamp(),
          createdBy: 'registration_simple'
        };
        
        console.log('[useSimpleAuth] 💾 Données à enregistrer:', userData);
        
        await setDoc(userDocRef, userData);
        console.log('[useSimpleAuth] ✅ Document utilisateur créé avec succès!');
      }
    } catch (error) {
      console.error('[useSimpleAuth] ❌ Erreur lors de l\'inscription:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  return {
    register,
    login,
    resetPassword
  };
};
