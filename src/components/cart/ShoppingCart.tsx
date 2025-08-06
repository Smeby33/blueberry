import { useNavigate } from 'react-router-dom';
import { XIcon, MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon, ChevronRightIcon, MenuIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { addOrder, getUserOrders } from '../../services/orders';
import { useEffect, useState } from 'react';

console.log('🛒 [cart/ShoppingCart] Module chargé');
console.log('🛒 [cart/ShoppingCart] addOrder importé:', typeof addOrder);
export function ShoppingCart({
  isOpen,
  onClose,
  items,
  setItems,
  user,
  onOpenAuthModal
}: {
  isOpen: any;
  onClose: any;
  items: any;
  setItems: any;
  user?: any;
  onOpenAuthModal?: any;
}) {

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [firebaseOrders, setFirebaseOrders] = useState([]);

  console.log('🛒 [cart/ShoppingCart] Composant rendu avec props:', {
    isOpen,
    itemsCount: items?.length,
    userExists: !!user,
    userEmail: user?.email
  });

  // Si le panier est vide et l'utilisateur connecté, on récupère ses commandes non-confirmées
  useEffect(() => {
    if (items.length === 0 && user?.uid) {
      setLoadingOrders(true);
      getUserOrders(user.uid)
        .then(orders => {
          // Filtrer explicitement les commandes non-confirmées
          const nonConfirmedOrders = orders.filter(order => order.status === 'non-confirmé');
          console.log('[ShoppingCart] Statut des commandes récupérées:', orders.map(o => ({ id: o.id, status: o.status })));
          console.log('[ShoppingCart] Statut des commandes non-confirmées:', nonConfirmedOrders.map(o => ({ id: o.id, status: o.status })));
          setFirebaseOrders(nonConfirmedOrders);
          setItems(nonConfirmedOrders.length > 0 ? nonConfirmedOrders[0].items : []); // On charge les items de la première commande non-confirmée
          if (nonConfirmedOrders.length > 0) {
            localStorage.removeItem('cartItems');
            console.log('[ShoppingCart] Panier local supprimé car commande non-confirmée chargée depuis Firebase');
          }
        })
        .catch(e => {
          console.error('[ShoppingCart] Erreur récupération commandes non-confirmées:', e);
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [items.length, user?.uid]);

  const navigate = useNavigate();

  const handleCheckout = async () => {
    // Si on a chargé une commande non-confirmée depuis Firestore, on redirige vers son checkout
    if (firebaseOrders.length > 0) {
      const commande = firebaseOrders[0];
      console.log('� [cart/ShoppingCart] Redirection vers checkout de la commande non-confirmée existante:', commande.id);
      onClose();
      setTimeout(() => {
        navigate(`/checkout/${commande.id}`);
      }, 500);
      return;
    }
    // Sinon, comportement normal : création d'une nouvelle commande
    console.log('🚀🚀🚀 [cart/ShoppingCart] ===== DÉBUT DE handleCheckout =====');
    if (!user) {
      toast.info('Veuillez vous connecter pour passer une commande');
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    if (items.length === 0) {
      toast.warning('Votre panier est vide');
      return;
    }
    try {
      // Création sans ID local, Firestore génère l'ID
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        items: items,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        deliveryMethod: 'delivery',
        paymentMethod: 'cash',
        deliveryAddress: null,
        status: 'non-confirmé',
        estimatedDeliveryTime: '45-60 minutes'
      };
      const newOrder = await addOrder(orderData);
      // Stocker le panier local avec l'ID Firestore
      localStorage.setItem('cartItems', JSON.stringify({ ...orderData, id: newOrder.id }));
      setItems([]);
      localStorage.removeItem('cartItems');
      toast.success('Commande envoyée avec succès !');
      onClose();
      setTimeout(() => {
        navigate(`/checkout/${newOrder.id}`);
      }, 1000);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la commande. Veuillez réessayer.');
    }
  };
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setItems(items.filter(item => item.id !== id));
      toast.info('Article retiré du panier');
    } else {
      setItems(items.map(item => item.id === id ? {
        ...item,
        quantity: newQuantity
      } : item));
    }
  };
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 2.5 : 0;
  const total = subtotal + deliveryFee;
  if (loadingOrders) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white p-8 rounded shadow text-center text-[#00559b] font-bold">Chargement de vos commandes en attente...</div>
      </div>
    );
  }

  return <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'}`} onClick={onClose}></div>
      {/* Cart panel */}
      <div className={`absolute top-0 right-0 w-full sm:w-96 h-full bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-[#00559b] flex items-center">
            <ShoppingBagIcon className="w-5 h-5 mr-2" />
            Votre panier
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {/* Cart items */}
        <div className="flex-grow overflow-y-auto p-4">
          {items.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="bg-[#e1edf7] p-4 rounded-full mb-4">
                <ShoppingBagIcon className="w-12 h-12 text-[#7ff4eb]" />
              </div>
              <p className="text-lg mb-2 font-medium">Votre panier est vide</p>
              <p className="text-sm text-center text-gray-500 mb-6">
                Ajoutez des articles à votre panier pour passer commande.
              </p>
              <button onClick={onClose} className="bg-[#00559b] hover:bg-[#2b5a67] text-white px-4 py-2 rounded-md font-medium transition-colors">
                Découvrir le menu
              </button>
            </div> : <ul className="divide-y">
              {items.map(item => <li key={item.id} className="py-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {item.price.toFixed(2)} xaf
                      </p>
                    </div>
                  </div>
                  {/* Si c'est un menu composé, afficher les détails */}
                  {item.isMenu && <div className="mt-2 mb-3 bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <MenuIcon className="w-3 h-3 mr-1" />
                        <span>Composition du menu:</span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1 ml-4">
                        {item.items.map((subItem, index) => <li key={index} className="flex justify-between">
                            <span>• {subItem.name}</span>
                            <span>{subItem.price.toFixed(2)} xaf</span>
                          </li>)}
                      </ul>
                    </div>}
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center border border-gray-200 rounded-md">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded-l-md">
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 text-center min-w-[30px]">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded-r-md">
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <button onClick={() => updateQuantity(item.id, 0)} className="text-red-500 text-sm flex items-center mr-3 hover:text-red-600">
                        <TrashIcon className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                      <span className="font-medium text-[#00559b]">
                        {(item.price * item.quantity).toFixed(2)} xaf
                      </span>
                    </div>
                  </div>
                </li>)}
            </ul>}
        </div>
        {/* Footer with totals and checkout button */}
        <div className="border-t p-4 bg-white">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span>{subtotal.toFixed(2)} xaf</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Frais de livraison</span>
              <span>{deliveryFee.toFixed(2)} xaf</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-[#00559b]">{total.toFixed(2)} xaf</span>
            </div>
          </div>
          <button 
            onClick={handleCheckout} 
            className={`w-full py-3 rounded-md font-medium flex items-center justify-center ${items.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#7ff4eb] hover:bg-[#BF7076] text-white'}`} 
            disabled={items.length === 0}
          >
            Commander
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </button>
          <button onClick={onClose} className="w-full text-center mt-3 text-[#00559b] hover:underline text-sm">
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>;
}