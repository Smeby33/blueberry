import React, { useEffect, useState } from 'react';
import { Clock, Utensils, PlusCircleIcon } from 'lucide-react';
import { getSpecialProducts } from '../../services/database';

type SpecialProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  available?: boolean;
  isSpecial?: boolean;
  preparationTime?: string;
  chef?: string;
  portions?: number;
  category?: string;
  chefImage?: string;
};

export function DailySpecial({ onAddToPlateau }: { onAddToPlateau: (product: SpecialProduct) => void }) {
  const [special, setSpecial] = useState<SpecialProduct | null>(null);
  useEffect(() => {
    getSpecialProducts().then((products: SpecialProduct[]) => {
      console.log('[DailySpecial] Produits spéciaux Firestore:', products);
      // Filtrer pour trouver le plat du jour : createdAt = aujourd'hui, isSpecial = true, available = true
      const today = new Date();
      const isSameDay = (timestamp: any) => {
        if (!timestamp) return false;
        // Firestore Timestamp ou JS Date
        let dateObj;
        if (timestamp.seconds) {
          dateObj = new Date(timestamp.seconds * 1000);
        } else {
          dateObj = new Date(timestamp);
        }
        return (
          dateObj.getFullYear() === today.getFullYear() &&
          dateObj.getMonth() === today.getMonth() &&
          dateObj.getDate() === today.getDate()
        );
      };
      const daily = products.find(
        (p) => p.isSpecial && p.available && isSameDay((p as any).createdAt)
      );
      setSpecial(daily || null);
    });
  }, []);

  if (!special) {
    return null;
  }

  return (
    <section className="py-16 bg-[#e1edf7]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#00559b]">{special.name}</h2>
          {special.description && (
            <p className="text-gray-600 mt-2">{special.description}</p>
          )}
        </div>
        <div className="bg-white rounded-xl overflow-hidden shadow-lg max-w-4xl mx-auto">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="relative h-72 md:h-full">
                <img src={special.image} alt={special.name} className="w-full h-full object-cover" />
                {special.category && (
                  <div className="absolute top-4 left-4 bg-[#7ff4eb] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {special.category}
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-1/2 p-6">
              {special.name && (
                <h3 className="text-2xl font-bold text-gray-800">{special.name}</h3>
              )}
              <div className="flex items-center mt-3 space-x-6">
                {special.preparationTime && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{special.preparationTime}</span>
                  </div>
                )}
                {special.portions && (
                  <div className="flex items-center text-gray-600">
                    <Utensils className="w-4 h-4 mr-1" />
                    <span className="text-sm">{special.portions} pers.</span>
                  </div>
                )}
              </div>
              {special.description && (
                <p className="text-gray-600 mt-4">{special.description}</p>
              )}
              {special.chef && (
                <div className="mt-4 py-3 border-t border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img src={special.chefImage || "https://randomuser.me/api/portraits/men/32.jpg"} alt="Chef" className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">{special.chef}</div>
                      <div className="text-xs text-gray-500">Chef cuisinier</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-between items-center">
                {special.price && (
                  <span className="text-2xl font-bold text-[#00559b]">
                    {special.price.toFixed(2)} xaf
                  </span>
                )}
                <button className="flex items-center bg-[#7ff4eb] hover:bg-[#BF7076] text-white px-4 py-2 rounded-md font-medium transition-colors" onClick={() => onAddToPlateau(special)}>
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  Ajouter au menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}