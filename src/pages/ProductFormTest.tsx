import React from 'react';
import { ProductAddForm } from '../components/admin/ProductAddForm';

// Composant de test pour ProductAddForm
export function ProductFormTest() {
  const [showModal, setShowModal] = React.useState(false);

  const handleSuccess = () => {
    console.log('Produit sauvegardé avec succès !');
    setShowModal(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test du composant ProductAddForm</h1>
      
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Ouvrir le formulaire d'ajout de produit
      </button>

      <ProductAddForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        currentProduct={null}
      />
    </div>
  );
}
