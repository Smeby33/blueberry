import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import { CheckIcon, XIcon, MapPinIcon } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

interface UserAddressEditFormProps {
  currentUser: User;
  userProfile: any;
  addressToEdit: Address | null;
  onAddressUpdate: (updatedProfile: any) => void;
  onCancel: () => void;
}

export const UserAddressEditForm: React.FC<UserAddressEditFormProps> = ({
  currentUser,
  userProfile,
  addressToEdit,
  onAddressUpdate,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    isDefault: false
  });

  const addressSuggestions = ['Domicile', 'Bureau', 'QG1', 'QG2', 'QG3', 'QG4'];

  // Initialiser le formulaire avec les données de l'adresse à modifier
  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        name: addressToEdit.name,
        address: addressToEdit.address,
        city: addressToEdit.city,
        postalCode: addressToEdit.postalCode || '',
        latitude: addressToEdit.latitude,
        longitude: addressToEdit.longitude,
        isDefault: addressToEdit.isDefault
      });
    }
  }, [addressToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setLocationLoading(false);
        toast.success(`Position récupérée: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = 'Erreur lors de la récupération de la position';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position non disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai de récupération de position dépassé';
            break;
        }
        
        toast.error(errorMessage);
        console.error('[UserAddressEditForm] Erreur géolocalisation:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Fonction utilitaire pour créer l'adresse formatée
  const formatDefaultAddress = (address: Address) => {
    const addressParts = [address.address, address.city];
    if (address.postalCode) {
      addressParts.splice(1, 0, address.postalCode);
    }
    return addressParts.join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addressToEdit) {
      toast.error('Aucune adresse sélectionnée pour modification');
      return;
    }

    setLoading(true);

    try {
      const addresses: Address[] = userProfile?.addresses || [];
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      const updatedAddress: Address = {
        ...addressToEdit,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        isDefault: formData.isDefault
      };

      let updatedAddresses = addresses.map(addr => 
        addr.id === addressToEdit.id ? updatedAddress : addr
      );

      // Si cette adresse est définie par défaut, retirer le statut par défaut des autres
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressToEdit.id
        }));
      }

      // Préparer les données de mise à jour
      const updateData: any = {
        addresses: updatedAddresses,
        updatedAt: new Date()
      };

      // Si cette adresse devient ou reste par défaut, mettre à jour l'adresse principale du profil
      if (formData.isDefault) {
        updateData.address = formatDefaultAddress(updatedAddress);
      }

      // Mettre à jour Firestore
      await updateDoc(userDocRef, updateData);

      // Mettre à jour l'état local
      const updatedProfile = {
        ...userProfile,
        addresses: updatedAddresses,
        ...(formData.isDefault && { address: updateData.address })
      };
      onAddressUpdate(updatedProfile);

      toast.success('Adresse modifiée avec succès !');
      onCancel(); // Fermer le formulaire

    } catch (error) {
      console.error('[UserAddressEditForm] Erreur lors de la modification:', error);
      toast.error('Erreur lors de la modification de l\'adresse');
    } finally {
      setLoading(false);
    }
  };

  if (!addressToEdit) {
    return null;
  }

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          Modifier l'adresse "{addressToEdit.name}"
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'adresse *
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Domicile, Bureau, etc."
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
            />
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, name: suggestion }));
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm first:rounded-t-md last:rounded-b-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="edit-postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Code postal
            </label>
            <input
              type="text"
              id="edit-postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="75001"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse complète *
            </label>
            <input
              type="text"
              id="edit-address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Rue de la République"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="edit-city" className="block text-sm font-medium text-gray-700 mb-1">
              Ville *
            </label>
            <input
              type="text"
              id="edit-city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Paris"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
            />
          </div>

          {/* Section GPS */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Position GPS (optionnel)
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium flex items-center"
              >
                {locationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Récupération...
                  </>
                ) : (
                  <>
                    <MapPinIcon className="w-3 h-3 mr-1" />
                    Mettre à jour ma position
                  </>
                )}
              </button>
            </div>
            {/* <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    latitude: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    longitude: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
                />
              </div>
            </div> */}
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Position GPS enregistrée
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit-isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="h-4 w-4 text-[#0B3B47] focus:ring-[#0B3B47] border-gray-300 rounded"
            />
            <label htmlFor="edit-isDefault" className="ml-2 block text-sm text-gray-700">
              Définir comme adresse par défaut
            </label>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0B3B47] hover:bg-[#2b5a67] disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Modification...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                Modifier l'adresse
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};
