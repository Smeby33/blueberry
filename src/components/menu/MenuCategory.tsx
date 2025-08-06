import React from 'react';
import { PlusCircleIcon, AlertCircleIcon, ClockIcon } from 'lucide-react';

interface MenuCategoryProps {
  items: any[];
  onAddToPlateau: (item: any) => void;
  categoryId: string;
}

export function MenuCategory({
  items,
  onAddToPlateau,
  categoryId
}: MenuCategoryProps) {
  console.log(`[MenuCategory] Rendu pour catégorie ${categoryId} avec ${items?.length || 0} items:`, items);
  items.forEach(item => {
    console.log(`[MenuCategory] Produit affiché: ${item.name} | category: ${item.category} | categoryId: ${item.categoryId}`);
  });
  
  if (!items || items.length === 0) {
    return <div className="text-center py-12">
        <div className="bg-white rounded-lg p-8 max-w-md mx-auto shadow-md">
          <AlertCircleIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">
            Aucun article disponible dans cette catégorie.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Catégorie: {categoryId} | Nombre d'items: {items?.length || 0}
          </p>
        </div>
      </div>;
  }
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'disponible':
      case 'available':
        return {
          label: 'Disponible',
          className: 'text-green-600',
          icon: null
        };
      case 'en préparation':
      case 'preparation':
      case 'preparing':
        return {
          label: 'En préparation',
          className: 'text-amber-500',
          icon: <ClockIcon className="w-4 h-4 mr-1" />
        };
      case 'en rupture':
      case 'rupture':
      case 'unavailable':
      case 'out_of_stock':
        return {
          label: 'En rupture',
          className: 'text-red-500',
          icon: <AlertCircleIcon className="w-4 h-4 mr-1" />
        };
      default:
        return {
          label: 'Disponible',
          className: 'text-green-600',
          icon: null
        };
    }
  };
  // Déterminer le libellé du bouton en fonction de la catégorie
  const getButtonLabel = (categoryId: string) => {
    switch (categoryId) {
      case 'entrees':
        return 'Ajouter comme entrée';
      case 'plats':
        return 'Ajouter comme plat';
      case 'accompagnements':
        return 'Ajouter comme accompagnement';
      case 'desserts':
        return 'Ajouter comme dessert';
      case 'boissons':
        return 'Ajouter comme boisson';
      case 'specialites':
        return 'Ajouter spécialité';
      default:
        return 'Ajouter au menu';
    }
  };
  const [selectedDescription, setSelectedDescription] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  return <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => {
        const statusInfo = getStatusInfo(item.status);
        const isAvailable = item.status !== 'en rupture';
        let categoryToSend = categoryId;
        if (categoryId === 'tous') {
          categoryToSend = item.category && item.category !== 'tous' ? item.category : item.categoryId;
        }
        if (!categoryToSend || categoryToSend === 'tous') {
          categoryToSend = 'plats';
        }
        const desc = item.description || "";
        const isLong = desc.length > 150;
        const shortDesc = isLong ? desc.slice(0, 150) + "..." : desc;
        return <div key={item.id} className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-gray-100 ${!isAvailable ? 'opacity-75' : ''} ${item.isSpecial ? 'ring-2 ring-[#7ff4eb]' : ''}`}>
          <div className="relative h-56">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            {item.isSpecial && <div className="absolute top-3 right-3 bg-[#7ff4eb] text-white px-2 py-1 rounded-full text-xs font-bold">Spécialité</div>}
          </div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
              <span className="font-bold text-[#00559b]">{item.price.toFixed(2)} xaf</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              {shortDesc}
              {isLong && (
                <span
                  className="ml-2 inline-block cursor-pointer bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm hover:bg-blue-200 transition"
                  onClick={() => {
                    setSelectedDescription(desc);
                    setShowModal(true);
                  }}
                >
                  Voir plus
                </span>
              )}
            </p>
            <div className="flex justify-between items-center">
              <div className={`flex items-center text-sm ${statusInfo.className}`}>{statusInfo.icon}<span>{statusInfo.label}</span></div>
              <button className={`flex items-center text-sm font-medium rounded-md px-3 py-1.5 transition-colors ${isAvailable ? 'bg-[#00559b] hover:bg-[#2b5a67] text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`} onClick={() => {
                if (isAvailable) {
                  console.log('🔘 [MenuCategory] Clic sur bouton, item envoyé:', {
                    ...item,
                    category: categoryToSend
                  });
                  onAddToPlateau({
                    ...item,
                    category: categoryToSend
                  });
                }
              }} disabled={!isAvailable}>
                <PlusCircleIcon className="w-4 h-4 mr-1" />
                {getButtonLabel(categoryToSend)}
              </button>
            </div>
          </div>
        </div>;
      })}
    </div>
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowModal(false)}
          >
            &times;
          </button>
          <h4 className="text-lg font-bold mb-2">Description complète</h4>
          <p className="text-gray-700 text-sm whitespace-pre-line">{selectedDescription}</p>
        </div>
      </div>
    )}
  </>;
}