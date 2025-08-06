import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CreditCardIcon, MapPinIcon, TruckIcon, HomeIcon } from 'lucide-react';
import { addOrder, getUserOrders, updateOrderStatus } from '../services/orders.js';
import { getUserAddresses } from '../services/orders.js';
import { toast } from 'react-toastify';
export function CheckoutPage({
  cartItems,
  setCartItems,
  user // Ajouter l'utilisateur connecté
}: {
  cartItems: any[];
  setCartItems: (items: any[]) => void;
  user: any;
}) {
  const { orderId } = useParams(); // Récupérer l'ID de commande si présent
  const navigate = useNavigate(); // Hook pour la navigation
  const [order, setOrder] = useState<any>(null);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(!!orderId); // Mode confirmation si orderId présent
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les adresses de l'utilisateur connecté
  useEffect(() => {
    if (user?.uid) {
      console.log('[CheckoutPage] Utilisateur connecté:', user);
      console.log('[CheckoutPage] UID utilisé pour getUserAddresses:', user.uid);
      getUserAddresses(user.uid).then(addresses => {
        if (window && window.__LAST_USER_DOC) {
          console.log('[CheckoutPage] Document Firestore brut:', window.__LAST_USER_DOC);
        }
        console.log('[CheckoutPage] Adresses récupérées:', addresses);
        if (!addresses || addresses.length === 0) {
          console.warn('[CheckoutPage] Aucune adresse trouvée dans Firestore pour cet utilisateur. Vérifiez le champ "addresses" dans la collection users.');
        }
        setAddresses(addresses);
        // Sélection automatique de l'adresse par défaut
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setAddress(defaultAddress.address);
          console.log('[CheckoutPage] Adresse par défaut sélectionnée:', defaultAddress);
        }
      });
    }
  }, [user?.uid]);

  // Charger la commande si un orderId est fourni
  useEffect(() => {
    const loadOrder = async () => {
      if (orderId && user) {
        try {
          console.log('🔍🔍🔍 [CheckoutPage] ===== DÉBUT loadOrder =====');
          console.log('🔍 [CheckoutPage] orderId reçu:', orderId);
          console.log('🔍 [CheckoutPage] user.uid:', user.uid);
          console.log('🔍 [CheckoutPage] user.email:', user.email);
          setLoading(true);
          const userOrders = await getUserOrders(user.uid);
          console.log('📦 [CheckoutPage] Toutes les commandes récupérées:', userOrders);
          console.log('📦 [CheckoutPage] Nombre de commandes:', userOrders.length);
          const foundOrder = userOrders.find((o: any) => o.id === orderId);
          console.log('🔍 [CheckoutPage] Commande recherchée avec ID:', orderId);
          console.log('🔍 [CheckoutPage] Commande trouvée:', foundOrder);
          if (foundOrder) {
            console.log('✅ [CheckoutPage] Commande trouvée et chargée!');
            setOrder(foundOrder);
            setDeliveryMethod(foundOrder.deliveryMethod || 'delivery');
            setPaymentMethod(foundOrder.paymentMethod || 'card');
            setAddress(foundOrder.deliveryAddress || '');
          } else {
            console.log('❌ [CheckoutPage] Aucune commande trouvée avec cet ID');
          }
          console.log('🎉🎉🎉 [CheckoutPage] ===== FIN loadOrder =====');
        } catch (error) {
          console.error('Erreur lors du chargement de la commande:', error);
          toast.error('Erreur lors du chargement de la commande');
        } finally {
          setLoading(false);
        }
      }
    };
    loadOrder();
  }, [orderId, user]);

  const subtotal = isConfirmingOrder && order ? order.subtotal : cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 2500.00 : 0;
  const total = isConfirmingOrder && order ? order.total : subtotal + deliveryFee;
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté pour passer une commande');
      return;
    }
    
    if (!address && deliveryMethod === 'delivery') {
      toast.error('Veuillez renseigner votre adresse de livraison');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isConfirmingOrder && order) {
        // Confirmer une commande existante via le paiement
        console.log('💳 [CheckoutPage] Confirmation de la commande:', order.id);
        // Log UID utilisateur et userId commande pour debug permissions
        console.log('[CheckoutPage] UID utilisateur connecté:', user?.uid);
        console.log('[CheckoutPage] userId de la commande:', order.userId);
        // Mettre à jour le statut de la commande à "confirmé"
        await updateOrderStatus(order.id, 'confirmé');
        toast.success('Commande confirmée avec succès !');
        // Suppression automatique du panier local pour les items confirmés (par id d'item)
        try {
          const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
          // Récupérer la liste des ids des items confirmés
          const confirmedItemIds = order.items.map((item: any) => item.id);
          // Filtrer le panier local pour ne garder que les items non confirmés
          const filteredCart = localCart.filter((item: any) => !confirmedItemIds.includes(item.id));
          localStorage.setItem('cartItems', JSON.stringify(filteredCart));
          console.log('[CheckoutPage] Suppression automatique du panier local pour les items confirmés (ids):', confirmedItemIds);
        } catch (err) {
          console.warn('[CheckoutPage] Erreur suppression auto panier local (ids):', err);
        }
        // Rediriger vers la page de suivi
        setTimeout(() => {
          navigate(`/track-order/${order.id}`);
        }, 3000);
        
      } else {
        // Générer un ID local unique pour cette commande
        const localCartId = `CMD-${Date.now()}`;
        // Ajouter cet ID à chaque item du panier
        const cartItemsWithLocalId = cartItems.map(item => ({ ...item, localCartId }));
        // Créer la commande avec l'ID local inclus
        const orderData = {
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || user.email,
          items: cartItemsWithLocalId,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: total,
          deliveryMethod: deliveryMethod,
          paymentMethod: paymentMethod,
          deliveryAddress: deliveryMethod === 'delivery' ? address : null,
          status: 'non-confirmé',
          orderNumber: localCartId,
          estimatedDeliveryTime: deliveryMethod === 'delivery' ? '45-60 minutes' : '20-30 minutes',
          localCartId // Pour faciliter la correspondance future
        };
        console.log('📦 [CheckoutPage] Création d\'une nouvelle commande:', orderData);
        // Envoyer la commande à Firebase
        const newOrder = await addOrder(orderData);
        // Vider le panier
        setCartItems([]);
        localStorage.removeItem('cartItems');
        toast.success('Commande créée avec succès !');
        // Rediriger vers la page de suivi avec l'ID de la commande
        setTimeout(() => {
          navigate(`/track-order/${newOrder.id}`);
        }, 3000);
      }
      
    } catch (error) {
      console.error('❌ [CheckoutPage] Erreur:', error);
      toast.error('Erreur lors du traitement de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  if (cartItems.length === 0) {
    return <div className="py-12 bg-[#e2b7d3]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
            <div className="text-center">
              <div className="bg-[#e2b7d3] p-4 rounded-full inline-block mb-4">
                <TruckIcon className="w-12 h-12 text-[#78013B]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Votre panier est vide
              </h1>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore ajouté d'articles à votre panier.
              </p>
              <Link to="/menu" className="bg-[#0B3B47] hover:bg-[#2b5a67] text-white px-6 py-3 rounded-md font-medium inline-flex items-center">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Retour au menu
              </Link>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="py-12 bg-[#e2b7d3]">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link to="/menu" className="inline-flex items-center text-[#0B3B47] hover:text-[#78013B] font-medium">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Retour au menu
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-[#0B3B47] mb-8">
          Finaliser votre commande
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Mode de livraison
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button type="button" onClick={() => setDeliveryMethod('delivery')} className={`flex items-center p-4 border rounded-lg ${deliveryMethod === 'delivery' ? 'border-[#0B3B47] bg-[#0B3B47]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${deliveryMethod === 'delivery' ? 'border-[#0B3B47]' : 'border-gray-400'}`}>
                      {deliveryMethod === 'delivery' && <div className="w-3 h-3 rounded-full bg-[#0B3B47]"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium flex items-center">
                        <TruckIcon className="w-4 h-4 mr-2 text-[#78013B]" />
                        Livraison à domicile
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Livraison en 25-30 minutes
                      </div>
                    </div>
                    <div className="text-[#0B3B47] font-medium">2500.00 xaf</div>
                  </button>
                  <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`flex items-center p-4 border rounded-lg ${deliveryMethod === 'pickup' ? 'border-[#0B3B47] bg-[#0B3B47]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${deliveryMethod === 'pickup' ? 'border-[#0B3B47]' : 'border-gray-400'}`}>
                      {deliveryMethod === 'pickup' && <div className="w-3 h-3 rounded-full bg-[#0B3B47]"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium flex items-center">
                        <HomeIcon className="w-4 h-4 mr-2 text-[#78013B]" />
                        Retrait sur place
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Prêt en 15-20 minutes
                      </div>
                    </div>
                    <div className="text-[#0B3B47] font-medium">Gratuit</div>
                  </button>
                </div>
                {deliveryMethod === 'delivery' && <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse de livraison
                  </label>
                  {(() => { console.log('[CheckoutPage] Rendu select, addresses:', addresses); return null; })()}
                  {addresses.length > 0 && (
                    <select
                      id="address"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm mb-2"
                      required={deliveryMethod === 'delivery'}
                    >
                      <option value="">Sélectionnez une adresse...</option>
                      {addresses.map(addr => (
                        <option key={addr.id} value={addr.address}>{addr.name} - {addr.address} ({addr.city})</option>
                      ))}
                    </select>
                  )}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Votre adresse complète"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
                      required={deliveryMethod === 'delivery'}
                    />
                  </div>
                </div>}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Mode de paiement</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex items-center p-4 border rounded-lg ${paymentMethod === 'card' ? 'border-[#0B3B47] bg-[#0B3B47]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#0B3B47]' : 'border-gray-400'}`}>
                      {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-[#0B3B47]"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium flex items-center">
                        <CreditCardIcon className="w-4 h-4 mr-2 text-[#78013B]" />
                        Carte bancaire
                      </div>
                    </div>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('cash')} className={`flex items-center p-4 border rounded-lg ${paymentMethod === 'cash' ? 'border-[#0B3B47] bg-[#0B3B47]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-[#0B3B47]' : 'border-gray-400'}`}>
                      {paymentMethod === 'cash' && <div className="w-3 h-3 rounded-full bg-[#0B3B47]"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Espèces</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Paiement à la livraison
                      </div>
                    </div>
                  </button>
                </div>
                {paymentMethod === 'card' && <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de carte
                      </label>
                      <input type="text" id="cardNumber" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm" required={paymentMethod === 'card'} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'expiration
                        </label>
                        <input type="text" id="cardExpiry" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/AA" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm" required={paymentMethod === 'card'} />
                      </div>
                      <div>
                        <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-700 mb-1">
                          CVC
                        </label>
                        <input type="text" id="cardCVC" value={cardCVC} onChange={e => setCardCVC(e.target.value)} placeholder="123" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm" required={paymentMethod === 'card'} />
                      </div>
                    </div>
                  </div>}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Récapitulatif</h2>
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => <div key={item.id} className="flex items-center">
                      <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.name}</span>
                          <span className="font-medium">
                            {(item.price * item.quantity).toFixed(2)} xaf
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} x {item.price.toFixed(2)} xaf
                        </div>
                      </div>
                    </div>)}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{subtotal.toFixed(2)} xaf</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span>{deliveryFee.toFixed(2)} xaf</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-[#0B3B47]">{total.toFixed(2)} xaf</span>
                  </div>
                </div>
                <button type="button" onClick={handleSubmit} disabled={loading} className="w-full mt-6 bg-[#78013B] hover:bg-[#BF7076] text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors">
                  {loading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg> : 'Confirmer la commande'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}