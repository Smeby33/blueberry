import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { addCategory, updateCategory } from '../../services/categoriesService';
import { auth } from '../../services/firebase';
import { Category } from '../../types/categories';
import { toast } from 'react-toastify';

interface CategoryAddFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentCategory?: Category | null;
}

// Catégories prédéfinies
const predefinedCategories = [
  {
    id: 'fastfood',
    name: 'Fast-food',
    order: 1,
    description: 'Burgers, snacks et spécialités rapides',
    visible: true
  },
  {
    id: 'glaces',
    name: 'Glaces',
    order: 2,
    description: 'Glaces artisanales et coupes gourmandes',
    visible: true
  },
  {
    id: 'crepes',
    name: 'Crêpes',
    order: 3,
    description: 'Crêpes sucrées et salées',
    visible: true
  },
  {
    id: 'boissons',
    name: 'Boissons',
    order: 4,
    description: 'Sodas, jus, eaux et boissons chaudes',
    visible: true
  },
  {
    id: 'accompagnements',
    name: 'Accompagnements',
    order: 5,
    description: 'Frites, salades et petits extras',
    visible: true
  }
];

export function CategoryAddForm({ isOpen, onClose, onSuccess, currentCategory }: CategoryAddFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(!!currentCategory);
  const [selectedPredefined, setSelectedPredefined] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 🔍 DEBUG : Vérifier l'authentification
    console.log('🔍 Debugging auth:', {
      currentUser: auth.currentUser,
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email
    });

    const formData = new FormData(e.currentTarget);
    
    let categoryData;
    
    if (!useCustomCategory && selectedPredefined) {
      // Utiliser la catégorie prédéfinie sélectionnée
      const predefined = predefinedCategories.find(cat => cat.id === selectedPredefined);
      if (predefined) {
        categoryData = {
          ...predefined,
          visible: formData.get('visible') === 'on' // Permettre de modifier la visibilité
        };
      }
    } else {
      // Utiliser les données du formulaire personnalisé
      categoryData = {
        name: formData.get('name') as string,
        id: formData.get('id') as string,
        description: formData.get('description') as string,
        order: parseInt(formData.get('order') as string),
        visible: formData.get('visible') === 'on'
      };
    }

    if (!categoryData) {
      toast.error('Veuillez sélectionner ou saisir une catégorie');
      setIsSubmitting(false);
      return;
    }

    try {
      if (currentCategory) {
        // Modification - ne pas inclure l'ID dans les données de mise à jour
        const { id, ...updateData } = categoryData;
        await updateCategory(currentCategory.id, updateData);
        toast.success('Catégorie modifiée avec succès');
      } else {
        // Ajout
        await addCategory(categoryData);
        toast.success('Catégorie ajoutée avec succès');
      }
      
      onSuccess(); // Callback pour recharger la liste
      handleClose(); // Fermer le modal et réinitialiser
    } catch (error) {
      console.error('[CategoryAddForm] Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la catégorie');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePredefinedChange = (categoryId: string) => {
    setSelectedPredefined(categoryId);
    if (categoryId) {
      setUseCustomCategory(false);
    }
  };

  const handleCustomToggle = () => {
    setUseCustomCategory(true);
    setSelectedPredefined('');
  };

  const handleClose = () => {
    // Réinitialiser l'état du formulaire
    setUseCustomCategory(!!currentCategory);
    setSelectedPredefined('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={handleClose}
          aria-hidden="true"
        />
        
        {/* Centrage vertical */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {currentCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Formulaire */}
              <div className="space-y-4">
                {/* Mode de saisie - seulement pour les nouvelles catégories */}
                {!currentCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Type de catégorie
                    </label>
                    <div className="space-y-3">
                      {/* Catégories prédéfinies */}
                      <div>
                        <label htmlFor="predefined-select" className="block text-sm font-medium text-gray-600 mb-2">
                          Choisir une catégorie standard
                        </label>
                        <select
                          id="predefined-select"
                          value={selectedPredefined}
                          onChange={(e) => handlePredefinedChange(e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
                        >
                          <option value="">-- Sélectionner une catégorie standard --</option>
                          {predefinedCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} - {cat.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Option catégorie personnalisée */}
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="custom-category"
                          name="category-type"
                          checked={useCustomCategory}
                          onChange={handleCustomToggle}
                          className="h-4 w-4 text-[#0B3B47] focus:ring-[#0B3B47] border-gray-300"
                        />
                        <label htmlFor="custom-category" className="ml-2 block text-sm text-gray-700">
                          Créer une catégorie personnalisée
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visibilité - Toujours visible pour permettre l'ajustement */}
                <div className="flex items-center">
                  <input 
                    id="visible" 
                    name="visible" 
                    type="checkbox" 
                    defaultChecked={
                      currentCategory?.visible ?? 
                      (selectedPredefined ? predefinedCategories.find(cat => cat.id === selectedPredefined)?.visible : true)
                    } 
                    className="h-4 w-4 text-[#0B3B47] focus:ring-[#0B3B47] border-gray-300 rounded" 
                  />
                  <label htmlFor="visible" className="ml-2 block text-sm text-gray-900">
                    Visible dans le menu public
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  Si décoché, cette catégorie ne sera visible que dans l'administration.
                </p>

                {/* Formulaire détaillé - Affiché pour modification ou catégorie personnalisée */}
                {(currentCategory || useCustomCategory) && (
                  <>
                    {/* Nom */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nom de la catégorie *
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        id="name" 
                        required
                        defaultValue={currentCategory?.name || ''} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm" 
                        placeholder="Ex: Entrées, Plats, Desserts..."
                      />
                    </div>

                    {/* ID */}
                    <div>
                      <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                        Identifiant technique *
                      </label>
                      <input 
                        type="text" 
                        name="id" 
                        id="id" 
                        required
                        defaultValue={currentCategory?.id || ''} 
                        disabled={!!currentCategory} // Désactiver lors de la modification
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed" 
                        placeholder="Ex: entrees, plats, desserts (sans espaces)"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Utilisé en interne. Pas d'espaces, d'accents ou de caractères spéciaux.
                        {currentCategory && ' (Non modifiable)'}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea 
                        id="description" 
                        name="description" 
                        rows={3} 
                        defaultValue={currentCategory?.description || ''} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm" 
                        placeholder="Description optionnelle de la catégorie..."
                      />
                    </div>

                    {/* Ordre d'affichage */}
                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                        Ordre d'affichage *
                      </label>
                      <input 
                        type="number" 
                        name="order" 
                        id="order" 
                        min="1" 
                        max="999"
                        required
                        defaultValue={currentCategory?.order || 1} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm" 
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Plus le chiffre est petit, plus la catégorie apparaîtra en premier.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Boutons */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0B3B47] text-base font-medium text-white hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B47] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {currentCategory ? 'Modification...' : 'Ajout...'}
                  </div>
                ) : (
                  currentCategory ? 'Modifier' : 'Ajouter'
                )}
              </button>
              <button 
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
