import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, TrashIcon, MoveIcon } from 'lucide-react';
import { getCategories, deleteCategory, getCategoryItemCount } from '../../services/categoriesService';
import { CategoryAddForm } from '../../components/admin/CategoryAddForm';
import { toast } from 'react-toastify';
export function CategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les catégories depuis Firestore
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategories();
      
      // Ajouter le comptage dynamique des éléments pour chaque catégorie
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category: any) => {
          const itemCount = await getCategoryItemCount(category.id);
          return {
            ...category,
            itemCount
          };
        })
      );
      
      setCategories(categoriesWithCounts);
      console.log('[CategoriesPage] Catégories chargées:', categoriesWithCounts);
    } catch (error) {
      console.error('[CategoriesPage] Erreur lors du chargement des catégories:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setCurrentCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category: any) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast.success('Catégorie supprimée avec succès');
      loadCategories(); // Recharger la liste
    } catch (error) {
      console.error('[CategoriesPage] Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la catégorie');
    }
  };

  if (loading) {
    return (
      <div className="px-4 md:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00559b]"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des catégories
        </h1>
        <button 
          onClick={handleAddCategory}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-[#00559b] text-white font-medium rounded-md hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00559b]"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Ajouter une catégorie
        </button>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune catégorie trouvée.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li key={category.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="cursor-grab">
                        <MoveIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {category.name}
                          </h3>
                          {!category.visible && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Masquée
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {category.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {category.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500 mr-6">
                        {category.itemCount} produit{category.itemCount !== 1 ? 's' : ''}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="text-[#00559b] hover:text-[#2b5a67] p-1"
                        >
                          <EditIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Composant de formulaire d'ajout/modification */}
      <CategoryAddForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadCategories}
        currentCategory={currentCategory}
      />
    </div>
  );
}