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
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Si le contexte n'existe pas, on retourne des fonctions mock pour éviter l'erreur
    console.warn('[useAuth] Contexte d\'authentification non trouvé, utilisation des fonctions mock');
    return {
      user: null,
      loading: false,
      login: async (email: string, password: string) => {
        console.log('[useAuth] Mock login:', email);
        await signInWithEmailAndPassword(auth, email, password);
      },
      register: async (email: string, password: string, name: string) => {
        console.log('[useAuth] Mock register:', email, name);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user && name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      },
      logout: async () => {
        console.log('[useAuth] Mock logout');
        await signOut(auth);
      },
      resetPassword: async (email: string) => {
        console.log('[useAuth] Mock resetPassword:', email);
        await sendPasswordResetEmail(auth, email);
      }
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      console.log('[AuthProvider] État d\'authentification changé:', user?.email || 'non connecté');
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('[AuthProvider] Tentative de connexion:', email);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    console.log('[AuthProvider] Tentative d\'inscription:', email, name);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user && name) {
      await updateProfile(userCredential.user, { displayName: name });
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
    resetPassword
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};
