import React, { useEffect, useState } from 'react';
import { PlusCircleIcon, StarIcon } from 'lucide-react';
import { getAllProducts } from '../../services/database';
type FeaturedProduct = {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    available?: boolean;
    isSpecial?: boolean;
    rating?: number;
    reviewCount?: number;
    category?: string;
};
export function FeaturedItems({
    onAddToPlateau
}: {
    onAddToPlateau: (product: FeaturedProduct) => void;
}) {
    const [featuredItems, setFeaturedItems] = useState<FeaturedProduct[]>(
        []
    );
    const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        getAllProducts().then(
            (products: FeaturedProduct[] | undefined | null) => {
                console.log('[FeaturedItems] TOUS les produits Firestore:', products);
                if (Array.isArray(products)) {
                    setFeaturedItems(products);
                    console.log('[FeaturedItems] Produits affichés Firestore:', products);
                } else {
                    setFeaturedItems([]);
                    console.log('[FeaturedItems] Aucun produit Firestore trouvé');
                }
            }
        );
    }, []);
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredItems.map((item) => {
                    const desc = item.description || "";
                    const isLong = desc.length > 150;
                    const shortDesc = isLong ? desc.slice(0, 150) + "..." : desc;
                    return (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                        >
                            <div className="relative h-56">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                                {item.isSpecial && (
                                    <div className="absolute top-3 right-3 bg-[#7ff4eb] text-white px-2 py-1 rounded-full text-xs font-bold">
                                        Spécialité
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {item.name}
                                    </h3>
                                    <span className="font-bold text-[#00559b]">
                                        {item.price.toFixed(2)} xaf
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mt-2">
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
                                <div className="flex items-center mt-3">
                                    <div className="flex items-center">
                                        <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium ml-1">
                                            {item.rating}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 ml-2">
                                        ({item.reviewCount} avis)
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-green-600 text-sm">Disponible</span>
                                    <button
                                        className="flex items-center text-sm font-medium bg-[#00559b] hover:bg-[#2b5a67] text-white px-3 py-2 rounded-md transition-colors"
                                        onClick={() => onAddToPlateau(item)}
                                    >
                                        <PlusCircleIcon className="w-4 h-4 mr-1" />
                                        Ajouter au menu
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
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
        </>
    );
}