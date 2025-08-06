import { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, XIcon, CheckIcon, ImageIcon } from 'lucide-react';
import { ProductAddForm } from '../../components/admin/ProductAddForm';
import { ProductDeleteModal } from '../../components/admin/ProductDeleteModal';
// @ts-ignore
import { getProducts } from '../../services/productsService';
// @ts-ignore
import { getCategories } from '../../services/categoriesService';
import { toast } from 'react-toastify';
export function ProductsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  
  // États pour les données depuis Firestore
  const [allProducts, setAllProducts] = useState<any[]>([]); // Tous les produits chargés une seule fois
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les données au montage du composant (une seule fois)
  useEffect(() => {
    loadAllProducts();
    loadCategories();
  }, []);

  // Charger TOUS les produits depuis Firestore (une seule fois)
  const loadAllProducts = async () => {
    try {
      setLoading(true);
      console.log('[ProductsPage] Chargement de tous les produits...');
      const productsData = await getProducts();
      setAllProducts(productsData);
      console.log('[ProductsPage] Tous les produits chargés:', productsData.length);
    } catch (error) {
      console.error('[ProductsPage] Erreur lors du chargement des produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  // Charger les produits par catégorie (optimisé)
  const loadProductsByCategory = async () => {
    try {
      setLoading(true);
      console.log('[ProductsPage] Chargement des produits pour la catégorie:', activeCategory);
      
      let productsData;
      if (activeCategory === 'all') {
        productsData = await getProducts();
      } else {
        productsData = await getProductsByCategory(activeCategory);
      }
      
      setProducts(productsData);
      console.log('[ProductsPage] Produits chargés pour la catégorie:', productsData.length);
    } catch (error) {
      console.error('[ProductsPage] Erreur lors du chargement des produits par catégorie:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  // Charger les catégories depuis Firestore
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log('[ProductsPage] Chargement des catégories...');
      const categoriesData = await getCategories();
      
      // Ajouter l'option "Tous" au début
      const categoriesWithAll = [
        { id: 'all', name: 'Tous' },
        ...categoriesData
      ];
      
      setCategories(categoriesWithAll);
      console.log('[ProductsPage] Catégories chargées:', categoriesData.length);
    } catch (error) {
      console.error('[ProductsPage] Erreur lors du chargement des catégories:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoadingCategories(false);
    }
  };
  // Filtrage CÔTÉ FRONTEND - Plus besoin de requêtes Firebase !
  const filteredProducts = allProducts.filter((product: any) => {
    // Filtrage par catégorie
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    
    // Filtrage par recherche (nom et description)
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Gestionnaires de changement de filtres (pas de requête Firebase)
  const clearFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
  };
  const handleEditProduct = (product: any) => {
    setCurrentProduct(product);
    setShowAddModal(true);
  };
  const handleDeleteProduct = (product: any) => {
    setCurrentProduct(product);
    setShowDeleteModal(true);
  };
  const handleAddNewProduct = () => {
    setCurrentProduct(null);
    setShowAddModal(true);
  };
  const getCategoryName = (categoryId: string) => {
    if (loadingCategories) return categoryId; // Retourner l'ID pendant le chargement
    
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Gérer le changement de catégorie avec nettoyage de la recherche
  const handleCategoryChange = (categoryId: string) => {
    console.log('[ProductsPage] Changement de catégorie vers:', categoryId);
    setActiveCategory(categoryId);
    // Optionnel : réinitialiser la recherche quand on change de catégorie
    // setSearchTerm('');
  };

  // Gérer la recherche avec débounce pour éviter trop de re-renders
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleProductSuccess = () => {
    // Recharger tous les produits après ajout/modification/suppression
    console.log('Produit sauvegardé, rechargement de tous les produits...');
    loadAllProducts(); // On recharge tout pour avoir les données à jour
  };
  return <div className="px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des produits
          </h1>
          {!loading && allProducts.length > 0 && (
            <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
              {activeCategory !== 'all' && ` dans ${getCategoryName(activeCategory)}`}
              {searchTerm && ` (recherche: "${searchTerm}")`}
            </span>
          )}
          {loading && (
            <div className="ml-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0B3B47]"></div>
              <span className="ml-2 text-sm text-gray-500">Chargement...</span>
            </div>
          )}
        </div>
        <button onClick={handleAddNewProduct} disabled={loading} className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-[#0B3B47] text-white font-medium rounded-md hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B47] disabled:opacity-50 disabled:cursor-not-allowed">
          <PlusIcon className="w-5 h-5 mr-2" />
          Ajouter un produit
        </button>
      </div>
      {/* Filtres et recherche */}
      <div className="mt-6 space-y-4">
        {/* Indicateurs de filtres actifs */}
        {/* {(searchTerm || activeCategory !== 'all') && (
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-gray-500">Filtres actifs:</span>
            {activeCategory !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0B3B47] text-white">
                Catégorie: {getCategoryName(activeCategory)}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="ml-1.5 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Recherche: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1.5 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                handleCategoryChange('all');
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )} */}
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex overflow-x-auto space-x-2 py-2 md:py-0">
          {loadingCategories ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0B3B47]"></div>
              <span className="text-sm text-gray-500">Chargement des catégories...</span>
            </div>
          ) : (
            categories.map(category => <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors duration-200 ${activeCategory === category.id ? 'bg-[#0B3B47] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                {category.name}
                {/* Afficher le nombre de produits par catégorie si chargé */}
                {!loading && activeCategory === category.id && allProducts.length > 0 && (
                  <span className="ml-2 text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full">
                    {filteredProducts.length}
                  </span>
                )}
              </button>)
          )}
        </div>
        <div className="mt-4 md:mt-0 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" placeholder="Rechercher un produit..." className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B3B47] focus:border-[#0B3B47]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {/* Bouton pour réinitialiser la recherche */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        </div>
      </div>
      {/* Liste des produits */}
      <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spécial
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0B3B47] mr-3"></div>
                      <span className="text-gray-500">Chargement des produits...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      {searchTerm || activeCategory !== 'all' ? 
                        'Aucun produit trouvé avec les filtres appliqués.' : 
                        'Aucun produit disponible. Commencez par ajouter votre premier produit.'
                      }
                    </div>
                    {!searchTerm && activeCategory === 'all' && (
                      <button
                        onClick={handleAddNewProduct}
                        className="mt-3 inline-flex items-center px-4 py-2 bg-[#0B3B47] text-white text-sm rounded-md hover:bg-[#2b5a67]"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Ajouter le premier produit
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.image ? <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} /> : <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getCategoryName(product.category)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.price.toFixed(2)} xaf
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.isSpecial ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XIcon className="h-5 w-5 text-gray-300" />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditProduct(product)} className="text-[#0B3B47] hover:text-[#2b5a67] mr-3">
                      <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteProduct(product)} className="text-red-600 hover:text-red-800">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>)
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Composant ProductAddForm */}
      <ProductAddForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleProductSuccess}
        currentProduct={currentProduct}
      />
      {/* Composant ProductDeleteModal */}
      <ProductDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleProductSuccess}
        product={currentProduct}
      />
    </div>;
}