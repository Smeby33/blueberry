import React from 'react';
import { PlusCircleIcon, AlertCircleIcon } from 'lucide-react';
export function MenuCategory({
  items,
  onAddToCart
}) {
  if (!items || items.length === 0) {
    return <p className="text-center text-gray-500">
        Aucun article disponible dans cette catégorie.
      </p>;
  }
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => <div key={item.id} className={`bg-white rounded-lg overflow-hidden shadow-md ${!item.available ? 'opacity-70' : ''} ${item.isSpecial ? 'ring-2 ring-[#78013B]' : ''}`}>
          <div className="relative h-48">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            {item.isSpecial && <div className="absolute top-2 right-2 bg-[#78013B] text-white px-2 py-1 rounded text-xs font-bold">
                Spécialité
              </div>}
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <span className="font-bold text-[#0B3B47]">
                {item.price.toFixed(2)} xaf
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
            <div className="flex justify-between items-center">
              {!item.available ? <div className="flex items-center text-red-500 text-sm">
                  <AlertCircleIcon className="w-4 h-4 mr-1" />
                  <span>Indisponible</span>
                </div> : <span className="text-green-600 text-sm">Disponible</span>}
              <button className={`flex items-center text-sm font-medium ${item.available ? 'text-[#0B3B47] hover:text-[#78013B]' : 'text-gray-400 cursor-not-allowed'}`} onClick={() => item.available && onAddToCart(item)} disabled={!item.available}>
                <PlusCircleIcon className="w-5 h-5 mr-1" />
                Ajouter
              </button>
            </div>
          </div>
        </div>)}
    </div>;
}