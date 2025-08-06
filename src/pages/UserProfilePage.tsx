import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, MapPinIcon, ClockIcon, LogOutIcon, ArrowLeftIcon } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { User } from 'firebase/auth';
import { UserProfileEditForm } from '../components/profile/UserProfileEditForm';
import { getOrders } from '../services/orders.js';
import { UserAddressAddForm } from '../components/profile/UserAddressAddForm';
import { AuthModal } from '../components/auth/AuthModal';
export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[UserProfilePage] État d\'authentification changé:', user?.email);
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  // Récupérer les données utilisateur depuis Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.uid) {
        try {
          console.log('[UserProfilePage] Récupération du profil pour UID:', currentUser.uid);
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('[UserProfilePage] Données utilisateur trouvées:', userData);
            setUserProfile({
              ...currentUser,
              ...userData
            });
          } else {
            console.log('[UserProfilePage] Aucun document utilisateur trouvé');
            // Utiliser les données de Firebase Auth comme fallback
            setUserProfile({
              name: currentUser.displayName || 'Utilisateur',
              email: currentUser.email,
              role: 'client'
            });
          }
        } catch (error) {
          console.error('[UserProfilePage] Erreur lors de la récupération du profil:', error);
          // Fallback vers les données Firebase Auth
          setUserProfile({
            name: currentUser.displayName || 'Utilisateur',
            email: currentUser.email,
            role: 'client'
          });
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('[UserProfilePage] Déconnexion réussie');
    } catch (error) {
      console.error('[UserProfilePage] Erreur lors de la déconnexion:', error);
    }
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setUserProfile(updatedProfile);
    console.log('[UserProfilePage] Profil mis à jour localement:', updatedProfile);
  };
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const allOrders = await getOrders();
        // Filtrer les commandes de l'utilisateur connecté et confirmées
        const userOrders = allOrders.filter((order: any) => order.userId === currentUser?.uid && order.status === 'confirmé');
        setOrderHistory(userOrders);
      } catch (error) {
        console.error('[UserProfilePage] Erreur chargement historique commandes:', error);
      }
    };
    if (currentUser?.uid) fetchOrders();
  }, [currentUser]);
  
  // Afficher un loading pendant la récupération des données
  if (loading) {
    return <div className="py-12 bg-[#e1edf7]">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00559b] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre profil...</p>
          </div>
        </div>
      </div>;
  }

  if (!currentUser || !userProfile) {
    return <div className="py-12 bg-[#e1edf7]">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md text-center">
            <UserIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Connectez-vous
            </h1>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour accéder à votre profil.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-[#00559b] hover:bg-[#2b5a67] text-white px-6 py-3 rounded-md font-medium"
              >
                Se connecter
              </button>
              <Link to="/" className="block w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-md font-medium text-center">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="py-12 bg-[#e1edf7]">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-[#00559b] hover:text-[#7ff4eb] font-medium">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Retour à l'accueil
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full mb-3 overflow-hidden">
                    {userProfile.photoProfile ? (
                      <img
                        src={userProfile.photoProfile}
                        alt={userProfile.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Si l'image ne charge pas, afficher l'icône par défaut
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.className = 'w-20 h-20 rounded-full bg-[#e1edf7] flex items-center justify-center mb-3';
                            parent.innerHTML = '<svg class="w-10 h-10 text-[#00559b]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z" /></svg>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#e1edf7] flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-[#00559b]" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold">{userProfile.name}</h2>
                  <p className="text-gray-600 text-sm">{userProfile.email}</p>
                  {userProfile.phone && (
                    <p className="text-gray-500 text-xs">{userProfile.phone}</p>
                  )}
                  {userProfile.role && (
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      userProfile.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userProfile.role === 'admin' ? 'Administrateur' : 'Client'}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeTab === 'orders' ? 'bg-[#00559b] text-white' : 'hover:bg-gray-100'}`}>
                    <ClockIcon className="w-4 h-4 mr-3" />
                    Historique des commandes
                  </button>
                  <button onClick={() => setActiveTab('addresses')} className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeTab === 'addresses' ? 'bg-[#00559b] text-white' : 'hover:bg-gray-100'}`}>
                    <MapPinIcon className="w-4 h-4 mr-3" />
                    Mes adresses
                  </button>
                  <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeTab === 'settings' ? 'bg-[#00559b] text-white' : 'hover:bg-gray-100'}`}>
                    <UserIcon className="w-4 h-4 mr-3" />
                    Paramètres du compte
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-md text-red-500 hover:bg-red-50 flex items-center mt-6"
                  >
                    <LogOutIcon className="w-4 h-4 mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                {activeTab === 'orders' && <div>
                    <h2 className="text-xl font-bold mb-6">
                      Historique des commandes
                    </h2>
                    {orderHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <ClockIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600">
                          Vous n'avez pas encore passé de commande.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orderHistory.map(order => {
                          const mainImage = order.items && order.items.length > 0 ? order.items[0].image : null;
                          const orderDate = order.createdAt ? new Date(order.createdAt.seconds ? order.createdAt.seconds * 1000 : order.createdAt) : null;
                          return (
                            <div key={order.id} className="border rounded-lg p-4 hover:border-[#00559b] transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                  {mainImage && (
                                    <div className="w-12 h-12 rounded-md overflow-hidden mr-4 flex-shrink-0">
                                      <img src={mainImage} alt="Plat" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <Link to={`/track-order/${order.id}`} className="font-medium text-[#00559b] hover:underline">
                                      Commande 
                                    </Link>
                                    <div className="text-sm text-gray-500">
                                      {orderDate ? orderDate.toLocaleString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }) : ''}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                  {order.status}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mb-3">
                                {(order.items || []).map((item: any, idx: number) => (
                                  <span key={idx} className="mr-2">
                                    {item.quantity}x {item.name}
                                  </span>
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {order.total ? order.total.toFixed(2) : ''} xaf
                                </span>
                                <Link to={`/track-order/${order.id}`} className="text-sm text-[#00559b] hover:text-[#7ff4eb]">
                                  Voir les détails
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>}
                {activeTab === 'addresses' && (
                  <UserAddressAddForm
                    currentUser={currentUser}
                    userProfile={userProfile}
                    onAddressUpdate={handleProfileUpdate}
                  />
                )}
                {activeTab === 'settings' && (
                  <UserProfileEditForm
                    currentUser={currentUser}
                    userProfile={userProfile}
                    onProfileUpdate={handleProfileUpdate}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'authentification */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>;
}