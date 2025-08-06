import React from 'react';
import { XIcon, PlusCircleIcon, CheckIcon, ShoppingCartIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { toast } from 'react-toastify';
export function Plateau({
  isOpen,
  onClose,
  plateauItems,
  onRemoveFromPlateau,
  onClearPlateau,
  onAddPlateauToCart,
  onIncreaseQuantity,
  onDecreaseQuantity
}: {
  isOpen: boolean;
  onClose: () => void;
  plateauItems: any[];
  onRemoveFromPlateau: (itemId: any) => void;
  onClearPlateau: () => void;
  onAddPlateauToCart: () => void;
  onIncreaseQuantity: (itemId: any) => void;
  onDecreaseQuantity: (itemId: any) => void;
}) {
  console.log('🏠 [Plateau.tsx] Rendu du composant Plateau');
  console.log('📊 [Plateau.tsx] Props reçues:', { 
    isOpen, 
    plateauItems, 
    plateauItemsLength: plateauItems?.length 
  });
  console.log('📋 [Plateau.tsx] Détail des plateauItems:', plateauItems);

  // Vérifier s'il y a des données récupérées du localStorage
  const hasRecoveredData = plateauItems.length > 0 && 
    localStorage.getItem('plateauItems') !== null;

  // Fonctions pour gérer les quantités
  const increaseQuantity = (itemId: any) => {
    console.log('➕ Augmenter quantité pour:', itemId);
    onIncreaseQuantity(itemId);
  };

  const decreaseQuantity = (itemId: any) => {
    console.log('➖ Diminuer quantité pour:', itemId);
    onDecreaseQuantity(itemId);
  };
  // Catégories pour organiser la commande
  const categories = {
    fastfood: 'Fast-food',
    glaces: 'Glaces',
    crepes: 'Crêpes',
    boissons: 'Boissons',
    accompagnements: 'Accompagnements',
    autres: 'Autres produits'
  };
  // Vérifier si la commande contient les produits nécessaires
  const hasFastfood = plateauItems.some(item => item.category === 'fastfood');
  const hasGlaces = plateauItems.some(item => item.category === 'glaces');
  const hasCrepes = plateauItems.some(item => item.category === 'crepes');
  const hasBoissons = plateauItems.some(item => item.category === 'boissons');
  const hasAccompagnements = plateauItems.some(item => item.category === 'accompagnements');
  const hasAutres = plateauItems.some(item => item.category === 'autres');
  
  // Au minimum un produit est requis pour valider la commande
  const isCommandeComplete = plateauItems.length > 0;
  const plateauTotal = plateauItems.reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
  // Organiser les éléments de la commande par catégorie
  const groupedItems: { [key: string]: any[] } = {};
  Object.keys(categories).forEach(cat => {
    groupedItems[cat] = plateauItems.filter(item => item.category === cat);
  });
  const handleAddToCart = () => {
    if (isCommandeComplete) {
      onAddPlateauToCart();
      toast.success('Commande ajoutée au panier');
      onClose();
    } else {
      toast.warning('Veuillez sélectionner au moins un produit');
    }
  };
  return <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'}`} onClick={onClose}></div>
      {/* Plateau panel */}
      <div className={`absolute top-0 right-0 w-full sm:w-96 h-full bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-[#0B3B47]">
            Composer votre commande
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Message de récupération des données */}
        {plateauItems.length > 0 && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 mx-4 mt-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Votre commande en cours a été récupérée automatiquement
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex-grow overflow-y-auto p-4">
          {plateauItems.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="bg-[#e2b7d3] p-4 rounded-full mb-4">
                <ShoppingCartIcon className="w-12 h-12 text-[#78013B]" />
              </div>
              <p className="text-lg mb-2 font-medium">Votre commande est vide</p>
              <p className="text-sm text-center text-gray-500 mb-6">
                Ajoutez des produits à votre commande pour finaliser votre achat
              </p>
            </div> : <div>
              {Object.keys(categories).map(categoryKey => <div key={categoryKey} className="mb-4">
                  <div className="flex items-center mb-2">
                    <h3 className="font-medium text-gray-800">
                      {(categories as any)[categoryKey]}
                    </h3>
                    <div className="ml-2 h-px bg-gray-200 flex-grow"></div>
                  </div>
                  {groupedItems[categoryKey].length > 0 ? <ul className="space-y-3">
                      {(groupedItems as any)[categoryKey].map((item: any) => <li key={item.id} className="flex items-center bg-gray-50 p-2 rounded-lg">
                          <div className="w-12 h-12 rounded-md overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="ml-3 flex-grow">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {(item.price * item.quantity).toFixed(2)} XAF
                              {item.quantity > 1 && (
                                <span className="text-xs text-gray-500">
                                  {' '}({item.price.toFixed(2)} × {item.quantity})
                                </span>
                              )}
                            </p>
                          </div>
                          
                          {/* Contrôles de quantité */}
                          <div className="flex items-center space-x-1 mr-2">
                            <button 
                              onClick={() => decreaseQuantity(item.id)}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                              disabled={item.quantity <= 1}
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => increaseQuantity(item.id)}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button onClick={() => onRemoveFromPlateau(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-full">
                            <XIcon className="w-4 h-4" />
                          </button>
                        </li>)}
                    </ul> : <div className="text-center py-2 text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg">
                      <p>
                          Aucun produit {(categories as any)[categoryKey].toLowerCase()}{' '}
                          sélectionné
                        </p>
                    </div>}
                </div>)}
            </div>}
        </div>
        <div className="border-t p-4 bg-white">
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span>
            <span className="text-[#0B3B47]">{plateauTotal.toFixed(2)} xaf</span>
          </div>
          <div className="flex space-x-3">
            <button onClick={onClearPlateau} className="flex-1 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors" disabled={plateauItems.length === 0}>
              Vider
            </button>
            <button onClick={handleAddToCart} className={`flex-1 flex items-center justify-center py-2 rounded-md font-medium ${isCommandeComplete ? 'bg-[#78013B] hover:bg-[#BF7076] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} disabled={!isCommandeComplete || plateauItems.length === 0}>
              <ShoppingCartIcon className="w-4 h-4 mr-2" />
              Ajouter au panier
            </button>
          </div>
          <div className="mt-3 text-center">
            <button onClick={onClose} className="text-[#0B3B47] hover:underline text-sm">
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    </div>;
}