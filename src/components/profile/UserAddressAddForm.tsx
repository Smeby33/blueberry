import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import { MapPinIcon, PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon } from 'lucide-react';
import { UserAddressEditForm } from './UserAddressEditForm';

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

interface UserAddressAddFormProps {
  currentUser: User;
  userProfile: any;
  onAddressUpdate: (updatedProfile: any) => void;
}

export const UserAddressAddForm: React.FC<UserAddressAddFormProps> = ({
  currentUser,
  userProfile,
  onAddressUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
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

  const addresses: Address[] = userProfile?.addresses || [];
  const addressSuggestions = ['Domicile', 'Bureau', 'QG1', 'QG2', 'QG3', 'QG4'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      postalCode: '',
      latitude: undefined,
      longitude: undefined,
      isDefault: false
    });
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const generateAddressId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
        console.error('[UserAddressAddForm] Erreur géolocalisation:', error);
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
    setLoading(true);

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      const newAddress: Address = {
        id: generateAddressId(),
        name: formData.name,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        isDefault: formData.isDefault
      };

      let updatedAddresses = [...addresses];

      // Ajouter une nouvelle adresse
      updatedAddresses.push(newAddress);
      console.log('[UserAddressAddForm] Ajout d\'une nouvelle adresse');

      // Si cette adresse est définie par défaut, retirer le statut par défaut des autres
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === newAddress.id
        }));
      }

      // Préparer les données de mise à jour
      const updateData: any = {
        addresses: updatedAddresses,
        updatedAt: new Date()
      };

      // Si cette adresse devient par défaut, mettre à jour l'adresse principale du profil
      if (formData.isDefault) {
        updateData.address = formatDefaultAddress(newAddress);
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

      resetForm();
      toast.success('Adresse ajoutée avec succès !');

    } catch (error) {
      console.error('[UserAddressAddForm] Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de l\'adresse');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) return;

    setLoading(true);
    try {
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        addresses: updatedAddresses,
        updatedAt: new Date()
      });

      const updatedProfile = {
        ...userProfile,
        addresses: updatedAddresses
      };
      onAddressUpdate(updatedProfile);

      toast.success('Adresse supprimée avec succès !');
    } catch (error) {
      console.error('[UserAddressAddForm] Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'adresse');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setLoading(true);
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));

      // Trouver la nouvelle adresse par défaut
      const newDefaultAddress = updatedAddresses.find(addr => addr.id === addressId);
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updateData: any = {
        addresses: updatedAddresses,
        updatedAt: new Date()
      };

      // Mettre à jour l'adresse principale du profil avec la nouvelle adresse par défaut
      if (newDefaultAddress) {
        updateData.address = formatDefaultAddress(newDefaultAddress);
      }

      await updateDoc(userDocRef, updateData);

      const updatedProfile = {
        ...userProfile,
        addresses: updatedAddresses,
        address: updateData.address
      };
      onAddressUpdate(updatedProfile);

      toast.success('Adresse par défaut mise à jour !');
    } catch (error) {
      console.error('[UserAddressAddForm] Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Mes adresses</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#0B3B47] hover:bg-[#2b5a67] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Ajouter une adresse
        </button>
      </div>

      {/* Liste des adresses */}
      <div className="space-y-4 mb-6">
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPinIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">Vous n'avez pas encore d'adresse enregistrée.</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="border rounded-lg p-4 hover:border-[#0B3B47] transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium flex items-center mb-2">
                    <MapPinIcon className="w-4 h-4 mr-2 text-[#0B3B47]" />
                    {address.name}
                    {address.isDefault && (
                      <span className="ml-2 bg-[#0B3B47]/10 text-[#0B3B47] text-xs px-2 py-0.5 rounded-full">
                        Par défaut
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{address.address}</p>
                    {address.postalCode && (
                      <p>{address.postalCode} {address.city}</p>
                    )}
                    {!address.postalCode && (
                      <p>{address.city}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      disabled={loading}
                      className="text-sm text-[#0B3B47] hover:text-[#78013B] disabled:opacity-50"
                    >
                      Définir par défaut
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    disabled={loading}
                    className="text-sm text-[#0B3B47] hover:text-[#78013B] disabled:opacity-50 flex items-center"
                  >
                    <EditIcon className="w-3 h-3 mr-1" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={loading}
                    className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50 flex items-center"
                  >
                    <TrashIcon className="w-3 h-3 mr-1" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {editingAddress && (
        <UserAddressEditForm
          currentUser={currentUser}
          userProfile={userProfile}
          addressToEdit={editingAddress}
          onAddressUpdate={onAddressUpdate}
          onCancel={() => setEditingAddress(null)}
        />
      )}

      {showAddForm && !editingAddress && (
        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Ajouter une nouvelle adresse
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'adresse *
                </label>
                <input
                  type="text"
                  id="name"
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
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="75001"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse complète *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Rue de la République"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#0B3B47] focus:border-[#0B3B47] sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <input
                  type="text"
                  id="city"
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
                        Récupérer ma position
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
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#0B3B47] focus:ring-[#0B3B47] border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
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
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Ajouter
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
