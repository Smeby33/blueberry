import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useSimpleAuth } from '../../hooks/useSimpleAuth';
import { toast } from 'react-toastify';
import { testFirestore } from '../../utils/testFirestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}


export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const { login, register, resetPassword } = useSimpleAuth();
  console.log('[AuthModal] useSimpleAuth hook chargé');

  // Fonction de test pour forcer l'utilisation du hook simple
  const handleTestSimpleRegister = async () => {
    console.log('[AuthModal] 🧪 Test avec useSimpleAuth');
    try {
      await register(formData.email, formData.password, formData.name);
      toast.success('✅ Inscription avec hook simple réussie !');
    } catch (error) {
      console.error('[AuthModal] ❌ Erreur avec hook simple:', error);
      toast.error('❌ Erreur avec hook simple');
    }
  };

  // Fonction de test Firestore
  const handleTestFirestore = async () => {
    console.log('[AuthModal] Test Firestore démarré');
    toast.info('Test de connectivité Firestore...');
    
    try {
      const result = await testFirestore();
      if (result) {
        toast.success('✅ Firestore fonctionne correctement !');
      } else {
        toast.error('❌ Problème avec Firestore');
      }
    } catch (error) {
      console.error('[AuthModal] Erreur test Firestore:', error);
      toast.error('❌ Erreur lors du test Firestore');
    }
  };

  // Log à chaque rendu du composant
  React.useEffect(() => {
    console.log('[AuthModal] rendu, mode:', mode, 'isOpen:', isOpen);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('[AuthModal] handleSubmit appelé');
    e.preventDefault();
    if (loading) {
      console.log('[AuthModal] handleSubmit ignoré car loading');
      return;
    }

    setLoading(true);
    console.log('[AuthModal] loading true');
    console.log('[AuthModal] Soumission du formulaire, mode:', mode, formData);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Les mots de passe ne correspondent pas');
          setLoading(false);
          console.log('[AuthModal] Erreur: mots de passe différents');
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères');
          setLoading(false);
          console.log('[AuthModal] Erreur: mot de passe trop court');
          return;
        }
        console.log('[AuthModal] Appel register');
        await register(formData.email, formData.password, formData.name);
        toast.success('Compte créé avec succès !');
        setTimeout(() => {
          toast.info('Bienvenue ! Vous pouvez maintenant commander.');
        }, 500);
        console.log('[AuthModal] Inscription réussie');
        onClose();
      } else if (mode === 'login') {
        console.log('[AuthModal] Appel login');
        await login(formData.email, formData.password);
        toast.success('Connexion réussie !');
        setTimeout(() => {
          toast.info('Bienvenue !');
        }, 500);
        console.log('[AuthModal] Connexion réussie');
        onClose();
      } else if (mode === 'reset') {
        console.log('[AuthModal] Appel resetPassword');
        await resetPassword(formData.email);
        toast.success('Email de réinitialisation envoyé !');
        setMode('login');
        console.log('[AuthModal] Email de réinitialisation envoyé');
      }
    } catch (error: any) {
      console.error('[AuthModal] Erreur d\'authentification:', error);
      // Messages d'erreur en français
      let errorMessage = 'Une erreur est survenue';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cette adresse email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mot de passe incorrect';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cette adresse email est déjà utilisée';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.log('[AuthModal] Erreur affichée à l\'utilisateur:', errorMessage);
    } finally {
      setLoading(false);
      console.log('[AuthModal] Fin de soumission, loading:', loading);
    }
  };

  const resetForm = () => {
    console.log('[AuthModal] resetForm appelé');
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    console.log('[AuthModal] Formulaire réinitialisé');
  };

  const switchMode = (newMode: 'login' | 'register' | 'reset') => {
    console.log('[AuthModal] switchMode appelé', newMode);
    setMode(newMode);
    resetForm();
    console.log('[AuthModal] Changement de mode:', newMode);
  };

  if (!isOpen) {
    console.log('[AuthModal] Modal fermé');
    return null;
  }

  console.log('[AuthModal] Modal affiché');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' && 'Connexion'}
            {mode === 'register' && 'Inscription'}
            {mode === 'reset' && 'Réinitialiser le mot de passe'}
          </h2>
          <div className="flex items-center gap-2">
            {/* Bouton de test temporaire */}
            {/* <button
              type="button"
              onClick={handleTestFirestore}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
              title="Test Firestore"
            >
              
            </button> */}
            {/* Bouton test hook simple */}
            {/* {mode === 'register' && (
              <button
                type="button"
                onClick={handleTestSimpleRegister}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                title="Test avec hook simple"
              >
              
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button> */}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Votre nom complet"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                {mode === 'login' && (() => { console.log("[AuthModal] Bouton 'Se connecter' affiché"); return "Se connecter"; })()}
                {mode === 'register' && (() => { console.log("[AuthModal] Bouton 'S'inscrire' affiché"); return "S'inscrire"; })()}
                {mode === 'reset' && 'Envoyer le lien'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={() => switchMode('reset')}
                className="text-orange-500 hover:text-orange-600 text-sm"
              >
                Mot de passe oublié ?
              </button>
              <div className="text-gray-600 text-sm">
                Pas encore de compte ?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  S'inscrire
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div className="text-gray-600 text-sm">
              Déjà un compte ?{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Se connecter
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-gray-600 text-sm">
              Retour à la{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                connexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;