import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, MenuIcon, LogOutIcon, XIcon, ClipboardListIcon } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getEntrepriseInfo } from '../services/database';
export function Header({
  cartItemsCount,
  plateauItemsCount,
  onCartClick,
  onPlateauClick,
  onLoginClick,
  onRegisterClick,
  userProfile
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entrepriseName, setEntrepriseName] = useState<string>('Blueberry');
  const location = useLocation();
  // Récupérer le nom de l'entreprise dynamiquement
  useEffect(() => {
    getEntrepriseInfo().then((data) => {
      if (data && data.restaurantName) {
        setEntrepriseName(data.restaurantName);
        console.log('[Header] Nom entreprise Firestore:', data.restaurantName);
      } else {
        console.log('[Header] Aucune info entreprise trouvée');
      }
    });
  }, []);

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMobileMenuOpen(false);
      console.log('[Header] Déconnexion réussie');
    } catch (error) {
      console.error('[Header] Erreur lors de la déconnexion:', error);
    }
  };
  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/menu', label: 'Menu' },
    { path: '/daily-special', label: 'Spécialités du jour' },
    { path: '/notifications', label: 'Notifications' },
    { path: '/contact', label: 'Contact' }
  ];
  return <header className="sticky top-0 z-50 bg-[#00559b] text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button className="md:hidden mr-2 focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center">
              <img src="/B.png" alt="Logo Blueberry" className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-white bg-gray-100" />
              <h1 className="text-xl font-bold">{entrepriseName}</h1>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 text-sm">
            {navLinks.map(link => <Link key={link.path} to={link.path} className={`hover:text-[#7ff4eb] font-medium transition-colors ${location.pathname === link.path ? 'text-[#7ff4eb]' : ''}`}>
                {link.label}
              </Link>)}
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/notifications" className="relative hover:text-[#7ff4eb] transition-colors" title="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </Link>
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="hover:text-[#7ff4eb] transition-colors" title="Mon profil">
                  <UserIcon className="w-5 h-5" />
                </Link>
                {userProfile?.role === 'admin' && (
                  <Link to="/admin" className="hover:text-yellow-300 transition-colors" title="Administration">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </Link>
                )}
              </div>
            ) : (
              <button className="hover:text-[#7ff4eb] transition-colors" onClick={onLoginClick}>
                <UserIcon className="w-5 h-5" />
              </button>
            )}
            <button className="relative hover:text-[#7ff4eb] transition-colors" onClick={onPlateauClick}>
              <ClipboardListIcon className="w-5 h-5" />
              {plateauItemsCount > 0 && <span className="absolute -top-2 -right-2 bg-[#7ff4eb] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {plateauItemsCount > 99 ? '99+' : plateauItemsCount}
                </span>}
            </button>
            <button className="relative hover:text-[#7ff4eb] transition-colors" onClick={onCartClick}>
              <ShoppingCartIcon className="w-5 h-5" />
              {cartItemsCount > 0 && <span className="absolute -top-2 -right-2 bg-[#7ff4eb] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMobileMenuOpen && <div className="md:hidden bg-[#2b5a67] border-t border-[#e1edf7]/10">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-2">
              {navLinks.map(link => <Link key={link.path} to={link.path} className={`py-2 px-4 rounded-md ${location.pathname === link.path ? 'bg-[#7ff4eb] text-white' : 'hover:bg-[#00559b] hover:text-[#7ff4eb]'}`} onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </Link>)}
              {!currentUser && <>
                  <button className="py-2 px-4 text-left rounded-md hover:bg-[#00559b] hover:text-[#7ff4eb]" onClick={() => {
              onLoginClick();
              setIsMobileMenuOpen(false);
            }}>
                    Se connecter
                  </button>
                  <button className="py-2 px-4 text-left rounded-md hover:bg-[#00559b] hover:text-[#7ff4eb]" onClick={() => {
              onRegisterClick();
              setIsMobileMenuOpen(false);
            }}>
                    S'inscrire
                  </button>
                </>}
              {currentUser && <>
                  <Link to="/profile" className="py-2 px-4 rounded-md hover:bg-[#00559b] hover:text-[#7ff4eb] flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Mon profil
                  </Link>
                  {userProfile?.role === 'admin' && (
                    <Link to="/admin" className="py-2 px-4 rounded-md hover:bg-[#00559b] hover:text-[#7ff4eb] flex items-center text-yellow-300" onClick={() => setIsMobileMenuOpen(false)}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Administration
                    </Link>
                  )}
                  <button className="py-2 px-4 text-left rounded-md hover:bg-[#00559b] hover:text-[#7ff4eb] flex items-center" onClick={handleLogout}>
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </button>
                </>}
            </nav>
          </div>
        </div>}
    </header>;
}