import { useState, useEffect } from 'react';
import { MenuCategory } from '../components/menu/MenuCategory';
// @ts-ignore
import { getProducts } from '../services/productsService';
// @ts-ignore
import { getCategories } from '../services/categoriesService';
export function MenuPage({
  onAddToPlateau
}: {
  onAddToPlateau: (item: any) => void;
}) {
  const [activeCategory, setActiveCategory] = useState('plats');
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les catégories et produits en parallèle
      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getProducts()
      ]);
      
      console.log('Catégories chargées:', categoriesData);
      console.log('Produits chargés:', productsData);
      
      // Debug: afficher les categoryId des produits
      productsData.forEach((product: any, index: number) => {
        console.log(`Produit ${index}: ${product.name} - categoryId: "${product.categoryId}"`);
        console.log('Tous les champs du produit:', Object.keys(product));
        console.log('Structure complète:', product);
      });
      
      setCategories(categoriesData);
      setAllProducts(productsData);
      
      // Définir la première catégorie comme active si elle existe
      if (categoriesData.length > 0) {
        console.log('Définition de la catégorie active:', categoriesData[0].id);
        setActiveCategory(categoriesData[0].id);
      } else {
        // Si pas de catégories depuis Firebase, utiliser "tous" pour voir tous les produits
        setActiveCategory('tous');
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement du menu');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les produits par catégorie active
  const getProductsByCategory = (categoryId: string) => {
    console.log('\n=== DEBUG FILTRAGE ===');
    console.log('Catégorie demandée:', categoryId);
    console.log('Nombre total de produits:', allProducts.length);
    
    // Pour débugger : affichons d'abord TOUS les produits sans filtrage
    if (categoryId === 'tous') {
      console.log('Affichage de tous les produits:', allProducts);
      return allProducts;
    }
    
    // Afficher tous les categoryId uniques disponibles
    const uniqueCategoryIds = [...new Set(allProducts.map((p: any) => p.categoryId))];
    console.log('CategoryIds uniques dans les produits:', uniqueCategoryIds);
    
    // Afficher les IDs des catégories disponibles
    const categoryIdsFromCategories = categories.map((c: any) => c.id);
    console.log('IDs des catégories Firebase:', categoryIdsFromCategories);
    
    const filtered = allProducts.filter((product: any) => {
      const match = product.category === categoryId;
      if (!match) {
        console.log(`Produit "${product.name}" avec categoryId "${product.categoryId}" ne correspond pas à "${categoryId}"`);
      }
      return match;
    });
    
    console.log(`Résultat filtrage pour "${categoryId}":`, filtered.length, 'produits trouvés');
    console.log('=== FIN DEBUG ===\n');
    
    return filtered;
  };

  // Fallback categories si aucune catégorie n'est chargée
  // Catégories par défaut pour l'affichage des boutons (jamais utilisées comme catégorie réelle dans les produits)
  const defaultCategories = [
    { id: 'fastfood', name: 'Fast-food' },
    { id: 'glaces', name: 'Glaces' },
    { id: 'crepes', name: 'Crêpes' },
    { id: 'boissons', name: 'Boissons' },
    { id: 'accompagnements', name: 'Accompagnements' }
  ];
  return <div className="py-12 bg-[#e1edf7]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#00559b]">Menu Blueberry</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Bienvenue chez <strong>Blueberry</strong>, votre restaurant fast-food, glaces et crêpes situé à Port-Gentil, boulevard Champvagne.<br />
            Découvrez nos burgers, snacks, glaces artisanales et crêpes gourmandes.
          </p>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00559b]"></div>
            <span className="ml-4 text-[#00559b]">Chargement du menu...</span>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* Contenu du menu */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-xl p-6 shadow-md mb-8">
              <div className="flex flex-wrap justify-center gap-3">
                {/* Bouton "Tous les produits" pour le filtre d'affichage uniquement */}
                <button
                  key="tous"
                  onClick={() => {
                    console.log('Changement de catégorie vers: tous');
                    setActiveCategory('tous');
                  }}
                  className={`px-5 py-2.5 rounded-full transition-colors ${
                    activeCategory === 'tous'
                      ? 'bg-[#00559b] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-[#7ff4eb] hover:text-white'
                  }`}
                >
                  Tous les produits
                </button>
                {/* Puis les vraies catégories Firebase ou les catégories par défaut */}
                {(categories.length > 0 ? categories : defaultCategories).map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      console.log('Changement de catégorie vers:', category.id);
                      setActiveCategory(category.id);
                    }}
                    className={`px-5 py-2.5 rounded-full transition-colors ${
                      activeCategory === category.id
                        ? 'bg-[#00559b] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-[#7ff4eb] hover:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Debug info */}
            {/* <div className="bg-yellow-100 p-4 mb-4 rounded">
              <p><strong>Catégorie active:</strong> {activeCategory}</p>
              <p><strong>Nombre de produits total:</strong> {allProducts.length}</p>
              <p><strong>Nombre de produits filtrés:</strong> {getProductsByCategory(activeCategory).length}</p>
              <p><strong>Categories disponibles:</strong> {categories.map(c => c.name).join(', ')}</p>
              <div className="mt-4">
                <p><strong>Échantillon de produits:</strong></p>
                {allProducts.slice(0, 2).map((product: any, index: number) => (
                  <div key={index} className="text-sm">
                    • {product.name} (categoryId: "{product.category}")
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <p><strong>IDs des catégories:</strong></p>
                {categories.map((cat: any, index: number) => (
                  <span key={index} className="text-sm mr-2">"{cat.id}"</span>
                ))}
              </div>
            </div> */}
            
            <MenuCategory 
              items={getProductsByCategory(activeCategory).map(product => {
                // Correction stricte : on ne touche jamais à la propriété category
                // Si le produit n'a pas de catégorie, on utilise categoryId
                if (!product.category || product.category === 'tous') {
                  return { ...product, category: product.categoryId };
                }
                return product;
              })} 
              onAddToPlateau={item => {
                console.log('[MenuPage] Ajout au plateau (category):', item.category);
                onAddToPlateau(item);
              }} 
              categoryId={activeCategory} 
            />
          </>
        )}
      </div>
    </div>;
}