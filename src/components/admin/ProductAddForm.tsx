import React, { useState, useEffect } from 'react';
import { XIcon, ImageIcon, TrashIcon } from 'lucide-react';
// @ts-ignore
import { getCategories } from '../../services/categoriesService';
// @ts-ignore
import { addProduct, updateProduct } from '../../services/productsService';
// @ts-ignore
import database from '../../services/database';
import { Category } from '../../types/categories';
import { Product } from '../../types/products';
import { toast } from 'react-toastify';

interface ProductAddFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentProduct?: Product | null;
}

export function ProductAddForm({ isOpen, onClose, onSuccess, currentProduct }: ProductAddFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [cloudinaryImageUrl, setCloudinaryImageUrl] = useState<string>('');
  const [imageInputType, setImageInputType] = useState<'file' | 'url'>('file');

  // Charger les catégories disponibles
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Initialiser les images si on modifie un produit existant
      if (currentProduct?.image) {
        setImagePreview(currentProduct.image);
        setCloudinaryImageUrl(currentProduct.image);
        setImageInputType('url'); // Si on a déjà une image, on assume que c'est une URL
      } else {
        setImagePreview('');
        setCloudinaryImageUrl('');
        setImageInputType('file');
      }
    }
  }, [isOpen, currentProduct]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await getCategories();
      // Filtrer pour ne montrer que les catégories visibles (optionnel)
      const visibleCategories = categoriesData.filter((cat: Category) => cat.visible);
      setCategories(visibleCategories);
    } catch (error) {
      console.error('[ProductAddForm] Erreur lors du chargement des catégories:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Gérer la sélection de fichier image
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image valide');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload de l'image vers Cloudinary
  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez d\'abord sélectionner une image');
      return;
    }

    setIsUploadingImage(true);
    try {
      console.log('[ProductAddForm] Upload de l\'image vers Cloudinary...');
      
      // Utiliser la fonction uploadImageToCloudinary de database.js
      const imageUrl = await database.uploadImageToCloudinary(selectedFile);
      
      setCloudinaryImageUrl(imageUrl);
      setImagePreview(imageUrl);
      toast.success('Image uploadée avec succès !');
      
      console.log('[ProductAddForm] Image uploadée:', imageUrl);
    } catch (error) {
      console.error('[ProductAddForm] Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setCloudinaryImageUrl('');
    
    // Reset du input file
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Gérer le changement d'URL manuelle
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImagePreview(url);
    setCloudinaryImageUrl(''); // Reset Cloudinary URL si on utilise une URL manuelle
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Utiliser l'URL Cloudinary si disponible, sinon l'URL manuelle
    let finalImageUrl = cloudinaryImageUrl;
    if (!finalImageUrl && imageInputType === 'url') {
      finalImageUrl = formData.get('imageUrl') as string;
    }
    
    const productData: Product = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      description: formData.get('description') as string,
      image: finalImageUrl,
      available: formData.get('available') === 'on',
      isSpecial: formData.get('isSpecial') === 'on'
    };

    // Validation basique
    if (!productData.name || !productData.category || !productData.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      setIsSubmitting(false);
      return;
    }

    if (productData.price <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      setIsSubmitting(false);
      return;
    }

    try {
      if (currentProduct) {
        // Modification
        await updateProduct(currentProduct.id!, productData);
        toast.success('Produit modifié avec succès');
      } else {
        // Ajout
        await addProduct(productData);
        toast.success('Produit ajouté avec succès');
      }
      
      onSuccess(); // Callback pour recharger la liste
      handleClose(); // Fermer le modal et réinitialiser
    } catch (error) {
      console.error('[ProductAddForm] Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Réinitialiser l'état du formulaire
    setImagePreview('');
    setSelectedFile(null);
    setCloudinaryImageUrl('');
    setImageInputType('file');
    setIsSubmitting(false);
    setIsUploadingImage(false);
    
    // Reset du input file
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    onClose();
  };

  if (!isOpen) return null;

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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {currentProduct ? 'Modifier le produit' : 'Ajouter un produit'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colonne gauche - Informations principales */}
                <div className="space-y-4">
                  {/* Nom */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nom du produit *
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      id="name" 
                      required
                      defaultValue={currentProduct?.name || ''} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm" 
                      placeholder="Ex: Entrecôte grillée, Salade César..."
                    />
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Catégorie *
                    </label>
                    {loadingCategories ? (
                      <div className="mt-1 py-2 px-3 border border-gray-300 rounded-md bg-gray-50">
                        <span className="text-sm text-gray-500">Chargement des catégories...</span>
                      </div>
                    ) : (
                      <select
                        id="category"
                        name="category"
                        required
                        defaultValue={currentProduct?.category || ''}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm"
                      >
                        <option value="">-- Sélectionner une catégorie --</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Prix */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Prix (xaf) *
                    </label>
                    <input 
                      type="number" 
                      name="price" 
                      id="price" 
                      step="0.01"
                      min="0"
                      required
                      defaultValue={currentProduct?.price || ''} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm" 
                      placeholder="0.00"
                    />
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
                      defaultValue={currentProduct?.description || ''} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm" 
                      placeholder="Description détaillée du produit..."
                    />
                  </div>
                </div>

                {/* Colonne droite - Image et options */}
                <div className="space-y-4">
                  {/* Sélecteur de type d'image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'image
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="imageType"
                          value="file"
                          checked={imageInputType === 'file'}
                          onChange={() => setImageInputType('file')}
                          className="h-4 w-4 text-[#00559b] focus:ring-[#00559b] border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Uploader un fichier</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="imageType"
                          value="url"
                          checked={imageInputType === 'url'}
                          onChange={() => setImageInputType('url')}
                          className="h-4 w-4 text-[#00559b] focus:ring-[#00559b] border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">URL en ligne</span>
                      </label>
                    </div>
                  </div>

                  {/* Upload de fichier */}
                  {imageInputType === 'file' && (
                    <div>
                      <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">
                        Sélectionner une image
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <input
                          type="file"
                          id="imageFile"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#00559b] file:text-white hover:file:bg-[#2b5a67]"
                        />
                        {selectedFile && (
                          <button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={isUploadingImage}
                            className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploadingImage ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                Upload...
                              </div>
                            ) : (
                              'Uploader'
                            )}
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Formats supportés: JPG, PNG, WebP (max 5MB)
                      </p>
                      {cloudinaryImageUrl && (
                        <p className="mt-1 text-xs text-green-600">
                          ✓ Image uploadée avec succès
                        </p>
                      )}
                    </div>
                  )}

                  {/* URL manuelle */}
                  {imageInputType === 'url' && (
                    <div>
                      <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                        URL de l'image
                      </label>
                      <input
                        type="url"
                        name="imageUrl"
                        id="imageUrl"
                        defaultValue={currentProduct?.image || ''}
                        onChange={handleImageChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        URL d'une image en ligne (JPG, PNG, WebP)
                      </p>
                    </div>
                  )}

                  {/* Aperçu de l'image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aperçu de l'image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Aperçu"
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                            onError={() => setImagePreview('')}
                          />
                          {(selectedFile || cloudinaryImageUrl) && (
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="mx-auto h-32 w-32 flex items-center justify-center bg-gray-100 rounded-lg">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input 
                        id="available" 
                        name="available" 
                        type="checkbox" 
                        defaultChecked={currentProduct?.available ?? true} 
                        className="h-4 w-4 text-[#00559b] focus:ring-[#00559b] border-gray-300 rounded" 
                      />
                      <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                        Produit disponible
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      Si décoché, le produit n'apparaîtra pas dans le menu public.
                    </p>

                    <div className="flex items-center">
                      <input 
                        id="isSpecial" 
                        name="isSpecial" 
                        type="checkbox" 
                        defaultChecked={currentProduct?.isSpecial ?? false} 
                        className="h-4 w-4 text-[#00559b] focus:ring-[#00559b] border-gray-300 rounded" 
                      />
                      <label htmlFor="isSpecial" className="ml-2 block text-sm text-gray-900">
                        Produit spécial / Recommandé
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      Le produit sera mis en avant dans le menu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="submit"
                disabled={isSubmitting || loadingCategories}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#00559b] text-base font-medium text-white hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00559b] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {currentProduct ? 'Modification...' : 'Ajout...'}
                  </div>
                ) : (
                  currentProduct ? 'Modifier' : 'Ajouter'
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
