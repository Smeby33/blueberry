import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ShoppingCart } from './components/cart/ShoppingCart';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AuthModal } from './components/auth/AuthModal';
import { Plateau } from './components/plateau/Plateau';
import { DailySpecial } from './components/menu/DailySpecial';
import NotificationsPage from './pages/NotificationsPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import des pages d'administration
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { UsersPage } from './pages/admin/UsersPage';
import { StatsPage } from './pages/admin/StatsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
// Import du provider d'authentification et du hook
import { AuthProvider } from './hooks/useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';
export function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login'); // "login" or "register"
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  // État pour le plateau de composition du menu
  const [isPlateauOpen, setIsPlateauOpen] = useState(false);
  const [plateauItems, setPlateauItems] = useState<any[]>([]);

  // Écouter l'authentification et récupérer le profil utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('[App] Utilisateur connecté:', firebaseUser.email);
        setUser(firebaseUser);
        
        // Récupérer les données du profil depuis Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('[App] Profil utilisateur récupéré:', userData);
            console.log('[App] Rôle utilisateur:', userData.role);
            setUserProfile({
              ...firebaseUser,
              ...userData
            });
          } else {
            console.log('[App] Aucun profil Firestore trouvé, utilisation des données Firebase Auth');
            setUserProfile({
              name: firebaseUser.displayName || 'Utilisateur',
              email: firebaseUser.email,
              role: 'client' // Par défaut, nouveau utilisateur = client
            });
          }
        } catch (error) {
          console.error('[App] Erreur lors de la récupération du profil:', error);
          setUserProfile({
            name: firebaseUser.displayName || 'Utilisateur',
            email: firebaseUser.email,
            role: 'client'
          });
        }
      } else {
        console.log('[App] Utilisateur déconnecté');
        setUser(null);
        setUserProfile(null);
      }
    });

    return unsubscribe;
  }, []);
  // Load cart items from localStorage on component mount
  useEffect(() => {
    console.log('🔍 [App.tsx] Chargement des items du panier depuis localStorage...');
    const savedCart = localStorage.getItem('cartItems');
    const savedPlateau = localStorage.getItem('plateauItems');
    console.log('📦 [App.tsx] savedCart trouvé:', savedCart);
    console.log('📦 [App.tsx] savedPlateau trouvé:', savedPlateau);
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('✅ [App.tsx] Cart items parsés:', parsedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('❌ [App.tsx] Error parsing cart data from localStorage:', error);
        localStorage.removeItem('cartItems');
      }
    } else {
      console.log('ℹ️ [App.tsx] Aucun cart items trouvé dans localStorage');
    }
  }, []);

  // Save cart items to localStorage whenever cartItems changes
  useEffect(() => {
    console.log('💾 [App.tsx] Sauvegarde cartItems dans localStorage:', cartItems);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Load plateau items from localStorage on component mount
  useEffect(() => {
    const savedPlateau = localStorage.getItem('plateauItems');
    if (savedPlateau) {
      try {
        const plateauData = JSON.parse(savedPlateau);
        console.log('🔄 [App.tsx] Récupération du plateau depuis localStorage:', plateauData);
        setPlateauItems(plateauData);
      } catch (error) {
        console.error('Error parsing plateau data from localStorage:', error);
        localStorage.removeItem('plateauItems');
      }
    }
  }, []);
  // Save plateau to localStorage whenever plateauItems changes
  useEffect(() => {
    if (plateauItems.length > 0) {
      console.log('💾 [App.tsx] Sauvegarde du plateau dans localStorage:', plateauItems);
      localStorage.setItem('plateauItems', JSON.stringify(plateauItems));
    } else {
      // Clear localStorage when plateau is empty
      localStorage.removeItem('plateauItems');
    }
  }, [plateauItems]);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);
  // Fonction pour ajouter un élément au plateau
  const addToPlateau = (item: any) => {
    console.log('🍽️ [App.tsx] addToPlateau appelé avec:', item);
    
    // Vérifier si l'élément est déjà dans le plateau
    const existingItemIndex = plateauItems.findIndex((plateauItem: any) => plateauItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Si l'élément existe déjà, augmenter la quantité
      console.log('📈 [App.tsx] Élément déjà présent, augmentation de la quantité');
      setPlateauItems((prevItems: any[]) => {
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        };
        console.log('🔄 [App.tsx] Quantité mise à jour:', newItems[existingItemIndex]);
        return newItems;
      });
    } else {
      // Sinon, ajouter un nouvel élément avec quantité 1
      const newItem = {
        ...item,
        quantity: 1
      };
      
      console.log('✅ [App.tsx] Ajout de l\'élément au plateau:', newItem);
      
      setPlateauItems((prevItems: any[]) => {
        const newItems = [...prevItems, newItem];
        console.log('🔄 [App.tsx] Nouveau state plateauItems:', newItems);
        return newItems;
      });
    }
    
    // Ouvrir le plateau s'il n'est pas déjà ouvert
    setIsPlateauOpen(true);
    console.log('📂 [App.tsx] Plateau ouvert');
  };
  // Fonction pour retirer un élément du plateau
  const removeFromPlateau = (itemId: any) => {
    setPlateauItems(plateauItems.filter((item: any) => item.id !== itemId));
  };

  // Fonction pour augmenter la quantité d'un élément dans le plateau
  const increaseQuantityInPlateau = (itemId: any) => {
    setPlateauItems((prevItems: any[]) => 
      prevItems.map((item: any) => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Fonction pour diminuer la quantité d'un élément dans le plateau
  const decreaseQuantityInPlateau = (itemId: any) => {
    setPlateauItems((prevItems: any[]) => 
      prevItems.map((item: any) => 
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };
  // Fonction pour vider le plateau
  const clearPlateau = () => {
    console.log('🗑️ [App.tsx] Vidage du plateau et suppression du localStorage');
    setPlateauItems([]);
    localStorage.removeItem('plateauItems');
  };
  // Fonction pour ajouter le plateau entier au panier comme un menu
  const addPlateauToCart = () => {
    if (plateauItems.length === 0) return;
    // Créer un objet "menu" à partir des éléments du plateau
    const menuId = `menu-${Date.now()}`;
    const menuItems = plateauItems.map(item => ({
      ...item,
      originalId: item.id // Conserver l'ID original pour référence
    }));
    const menuTotal = plateauItems.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
    const menuName = plateauItems.find(item => item.category === 'plats')?.name || 'Menu personnalisé';
    const menuComposition = {
      entree: plateauItems.filter(item => item.category === 'entrees').map(i => i.name),
      plat: plateauItems.filter(item => item.category === 'plats').map(i => i.name),
      accompagnement: plateauItems.filter(item => item.category === 'accompagnements').map(i => i.name),
      dessert: plateauItems.filter(item => item.category === 'desserts').map(i => i.name),
      boisson: plateauItems.filter(item => item.category === 'boissons').map(i => i.name)
    };
    // Créer l'objet menu
    const menu = {
      id: menuId,
      name: `Menu: ${menuName}`,
      description: `Menu composé avec ${Object.entries(menuComposition).filter(([_, items]) => items.length > 0).map(([category, items]) => `${category}: ${items.join(', ')}`).join(' | ')}`,
      price: menuTotal,
      quantity: 1,
      isMenu: true,
      items: menuItems,
      image: plateauItems.find(item => item.category === 'plats')?.image || plateauItems[0]?.image
    };
    console.log('🛒🛒🛒 [App.tsx] ===== DÉBUT addMenuToCart =====');
    console.log('🛒 [App.tsx] plateauItems actuels:', plateauItems);
    console.log('🛒 [App.tsx] cartItems avant ajout:', cartItems);
    console.log('🛒 [App.tsx] Menu créé:', menu);
    
    // Ajouter le menu au panier
    const newCartItems = [...cartItems, menu];
    console.log('🛒 [App.tsx] Nouveaux cartItems après ajout:', newCartItems);
    setCartItems(newCartItems);
    console.log('🛒 [App.tsx] setCartItems appelé, vidage du plateau et localStorage');
    // Vider le plateau et le localStorage
    clearPlateau();
  };
  // Fonction originale pour ajouter directement au panier (si besoin)
  const addToCart = item => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(cartItem => cartItem.id === item.id ? {
        ...cartItem,
        quantity: cartItem.quantity + 1
      } : cartItem));
    } else {
      setCartItems([...cartItems, {
        ...item,
        quantity: 1
      }]);
    }
  };
  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };
  console.log('🎯 [App.tsx] Rendu - plateauItems avant passage au Plateau:', plateauItems);
  console.log('🎯 [App.tsx] Rendu - isPlateauOpen:', isPlateauOpen);
  
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#e2b7d3]">
          <Routes>
            {/* Routes d'administration - accessible uniquement aux admins */}
            {userProfile?.role === 'admin' && (
              <Route path="/admin" element={<AdminLayout user={userProfile} />}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="stats" element={<StatsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            )}
            
            {/* Routes publiques */}
            <Route path="*" element={<>
                  <Header 
                    cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)} 
                    plateauItemsCount={plateauItems.length} 
                    onCartClick={() => setIsCartOpen(true)} 
                    onPlateauClick={() => setIsPlateauOpen(true)} 
                    onLoginClick={() => openAuthModal('login')} 
                    onRegisterClick={() => openAuthModal('register')}
                    userProfile={userProfile}
                  />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<HomePage onAddToPlateau={addToPlateau} />} />
                      <Route path="/menu" element={<MenuPage onAddToPlateau={addToPlateau} />} />
                      <Route path="/checkout" element={<CheckoutPage cartItems={cartItems} setCartItems={setCartItems} user={user} />} />
                      <Route path="/checkout/:orderId" element={<CheckoutPage cartItems={cartItems} setCartItems={setCartItems} user={user} />} />
                      <Route path="/track-order/:orderId" element={<OrderTrackingPage user={user} />} />
                      <Route path="/profile" element={<UserProfilePage />} />
                      <Route path="/daily-special" element={<DailySpecial onAddToPlateau={addToPlateau} />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      {/* Route d'accès refusé pour l'admin si pas les droits */}
                      {userProfile?.role !== 'admin' && (
                        <Route path="/admin/*" element={
                          <div className="py-12 bg-[#e2b7d3]">
                            <div className="container mx-auto px-4">
                              <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md text-center">
                                <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
                                <p className="text-gray-600 mb-6">
                                  Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                                </p>
                                <button 
                                  onClick={() => window.history.back()}
                                  className="bg-[#0B3B47] hover:bg-[#2b5a67] text-white px-6 py-2 rounded-md"
                                >
                                  Retour
                                </button>
                              </div>
                            </div>
                          </div>
                        } />
                      )}
                    </Routes>
                  </main>
                  <Footer />
                </>} />
          </Routes>
          <ShoppingCart 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            items={cartItems} 
            setItems={setCartItems}
            user={user}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
          <Plateau 
            isOpen={isPlateauOpen} 
            onClose={() => setIsPlateauOpen(false)} 
            plateauItems={plateauItems} 
            onRemoveFromPlateau={removeFromPlateau} 
            onClearPlateau={clearPlateau} 
            onAddPlateauToCart={addPlateauToCart}
            onIncreaseQuantity={increaseQuantityInPlateau}
            onDecreaseQuantity={decreaseQuantityInPlateau}
          />
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}