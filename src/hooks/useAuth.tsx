import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface UserData {
  name: string;
  phone?: string;
  address?: string;
  role?: 'client' | 'admin';
}

interface AuthUser extends User {
  role?: 'client' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  createUser: (email: string, password: string, userData: UserData) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log('[useAuth] Contexte trouvé:', !!context);
  
  if (!context) {
    // Si le contexte n'existe pas, on retourne des fonctions mock pour éviter l'erreur
    console.warn('[useAuth] ⚠️ Contexte d\'authentification non trouvé, utilisation des fonctions mock');
    return {
      user: null,
      loading: false,
      login: async (email: string, password: string) => {
        console.log('[useAuth] Mock login:', email);
        await signInWithEmailAndPassword(auth, email, password);
      },
      register: async (email: string, password: string, name: string) => {
        console.log('[useAuth] 🔄 MOCK register utilisé:', email, name);
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          console.log('[useAuth] Mock - Utilisateur créé dans Firebase Auth:', userCredential.user.uid);
          
          if (userCredential.user && name) {
            await updateProfile(userCredential.user, { displayName: name });
            console.log('[useAuth] Mock - Profil utilisateur mis à jour');
          }
          
          // Le document Firestore sera créé automatiquement par onAuthStateChanged
          console.log('[useAuth] Mock - Document Firestore sera créé automatiquement');
          
        } catch (error) {
          console.error('[useAuth] Mock - Erreur lors de l\'inscription:', error);
          throw error;
        }
      },
      logout: async () => {
        console.log('[useAuth] Mock logout');
        await signOut(auth);
      },
      resetPassword: async (email: string) => {
        console.log('[useAuth] Mock resetPassword:', email);
        await sendPasswordResetEmail(auth, email);
      },
      createUser: async (email: string, password: string, userData: UserData) => {
        console.log('[useAuth] Mock createUser:', email, userData);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, {
          displayName: userData.name
        });
        
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          name: userData.name,
          email: user.email,
          phone: userData.phone || null,
          address: userData.address || null,
          role: userData.role || 'client',
          createdAt: serverTimestamp()
        });
        
        return user;
      }
    };
  }
  console.log('[useAuth] ✅ Retour du vrai contexte AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les données utilisateur depuis Firestore
  const getUserData = async (uid: string) => {
    try {
      console.log('[AuthProvider] Récupération des données pour UID:', uid);
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        console.log('[AuthProvider] Données utilisateur trouvées:', userDoc.data());
        return userDoc.data();
      } else {
        console.log('[AuthProvider] Aucunes données utilisateur trouvées pour UID:', uid);
        return null;
      }
    } catch (error) {
      console.error('[AuthProvider] Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('[AuthProvider] 🔍 Utilisateur connecté détecté:', firebaseUser.email);
        
        // Récupérer les données utilisateur depuis Firestore
        const userData = await getUserData(firebaseUser.uid);
        
        if (userData) {
          // L'utilisateur existe déjà dans Firestore
          const userWithRole: AuthUser = {
            ...firebaseUser,
            role: userData.role || 'admin'
          };
          setUser(userWithRole);
          console.log('[AuthProvider] ✅ Utilisateur existant chargé:', firebaseUser.email, 'Rôle:', userData.role);
        } else {
          // Nouvel utilisateur - créer automatiquement le document Firestore
          console.log('[AuthProvider] 🆕 Nouvel utilisateur détecté, création du document...');
          
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const newUserData = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Utilisateur',
              email: firebaseUser.email,
              phone: null,
              address: null,
              role: 'client', // Nouveaux utilisateurs = clients
              createdAt: serverTimestamp(),
              createdBy: 'auto_creation'
            };
            
            console.log('[AuthProvider] 💾 Création du document utilisateur:', newUserData);
            await setDoc(userDocRef, newUserData);
            console.log('[AuthProvider] ✅ Document utilisateur créé avec succès');
            
            // Créer l'utilisateur avec le rôle
            const userWithRole: AuthUser = {
              ...firebaseUser,
              role: 'client'
            };
            setUser(userWithRole);
            console.log('[AuthProvider] ✅ Nouvel utilisateur configuré:', firebaseUser.email, 'Rôle: client');
            
          } catch (error) {
            console.error('[AuthProvider] ❌ Erreur lors de la création du document:', error);
            // Même si la création du document échoue, on garde l'utilisateur connecté
            // mais avec le rôle admin par défaut
            const userWithRole: AuthUser = {
              ...firebaseUser,
              role: 'admin' // Fallback vers admin si création échoue
            };
            setUser(userWithRole);
            console.log('[AuthProvider] ⚠️ Utilisateur connecté avec rôle admin (fallback)');
          }
        }
      } else {
        setUser(null);
        console.log('[AuthProvider] 🚪 Utilisateur déconnecté');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('[AuthProvider] Tentative de connexion:', email);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    console.log('[AuthProvider] 🚀 Inscription simplifiée:', email, name);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[AuthProvider] ✅ Utilisateur créé dans Firebase Auth:', userCredential.user.uid);
      
      if (userCredential.user && name) {
        // Mise à jour du profil utilisateur avec le nom
        await updateProfile(userCredential.user, { displayName: name });
        console.log('[AuthProvider] ✅ Profil utilisateur mis à jour avec le nom:', name);
      }
      
      // Le document Firestore sera créé automatiquement par onAuthStateChanged
      console.log('[AuthProvider] ✅ Inscription terminée - document Firestore sera créé automatiquement');
      
    } catch (error) {
      console.error('[AuthProvider] ❌ Erreur lors de l\'inscription:', error);
      throw error;
    }
  };

  const createUser = async (email: string, password: string, userData: UserData): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Mise à jour du profil utilisateur
      await updateProfile(user, {
        displayName: userData.name
      });
      
      // Créer le document utilisateur avec l'UID comme ID
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        name: userData.name,
        email: user.email,
        phone: userData.phone || null,
        address: userData.address || null,
        role: userData.role || 'client', // Par défaut client
        createdAt: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('[AuthProvider] Déconnexion');
    await signOut(auth);
  };

  const resetPassword = async (email: string): Promise<void> => {
    console.log('[AuthProvider] Réinitialisation du mot de passe:', email);
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    createUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
