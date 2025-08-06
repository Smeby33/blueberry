import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';
import { db } from '../../services/firebase';
import { toast } from 'react-toastify';
import database from '../../services/database';

interface UserProfileEditFormProps {
  currentUser: User;
  userProfile: any;
  onProfileUpdate: (updatedProfile: any) => void;
}

export const UserProfileEditForm: React.FC<UserProfileEditFormProps> = ({
  currentUser,
  userProfile,
  onProfileUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Fonction d'upload sur Cloudinary
  // Sélection du fichier
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    // Créer un aperçu local
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, photoProfile: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Upload effect
  useEffect(() => {
    const upload = async () => {
      if (!selectedFile) return;
      setUploading(true);
      try {
        const url = await database.uploadImageToCloudinary(selectedFile);
        setFormData(prev => ({ ...prev, photoProfile: url }));
        toast.success('Photo téléchargée avec succès !');
      } catch (err) {
        toast.error('Erreur lors de l\'upload de la photo');
      } finally {
        setUploading(false);
      }
    };
    upload();
  }, [selectedFile]);
  
  // Obtenir l'adresse par défaut
  const getDefaultAddress = () => {
    const addresses = userProfile?.addresses || [];
    const defaultAddress = addresses.find((addr: any) => addr.isDefault);
    if (defaultAddress) {
      const addressParts = [defaultAddress.address, defaultAddress.city];
      if (defaultAddress.postalCode) {
        addressParts.splice(1, 0, defaultAddress.postalCode);
      }
      return addressParts.join(', ');
    }
    return '';
  };

  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: getDefaultAddress(),
    photoProfile: userProfile?.photoProfile || '',
    newPassword: '',
    confirmPassword: ''
  });

  // Mettre à jour l'adresse quand les adresses changent
  useEffect(() => {
    const defaultAddress = getDefaultAddress();
    setFormData(prev => ({
      ...prev,
      address: defaultAddress
    }));
  }, [userProfile?.addresses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[UserProfileEditForm] Mise à jour du profil...');

      // Validation des mots de passe
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      // Mise à jour du profil Firebase Auth
      if (formData.name !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: formData.name
        });
        console.log('[UserProfileEditForm] Profil Firebase Auth mis à jour');
      }

      // Mise à jour du mot de passe si fourni
      if (formData.newPassword) {
        await updatePassword(currentUser, formData.newPassword);
        console.log('[UserProfileEditForm] Mot de passe mis à jour');
        toast.success('Mot de passe mis à jour avec succès');
      }

      // Mise à jour du document Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        name: formData.name,
        phone: formData.phone || null,
        address: formData.address || null, // Cette adresse sera synchronisée automatiquement
        photoProfile: formData.photoProfile || null,
        updatedAt: new Date()
      };

      await updateDoc(userDocRef, updateData);
      console.log('[UserProfileEditForm] Document Firestore mis à jour');

      // Mettre à jour l'état local
      const updatedProfile = {
        ...userProfile,
        ...updateData,
        email: currentUser.email // L'email ne peut pas être modifié facilement
      };
      onProfileUpdate(updatedProfile);

      // Réinitialiser les champs de mot de passe
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));

      toast.success('Profil mis à jour avec succès !');

    } catch (error: any) {
      console.error('[UserProfileEditForm] Erreur lors de la mise à jour:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Veuillez vous reconnecter pour modifier votre mot de passe');
      } else {
        toast.error('Erreur lors de la mise à jour du profil');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Paramètres du compte</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Photo de profil */}
          <div>
            <label htmlFor="photoProfile" className="block text-sm font-medium text-gray-700 mb-1">
              Photo de profil
            </label>
            <div className="flex items-center gap-4">
              <input
                type="url"
                id="photoProfile"
                name="photoProfile"
                value={formData.photoProfile}
                onChange={handleInputChange}
                placeholder="https://exemple.com/photo.jpg"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  id="file-upload"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className={`inline-block cursor-pointer bg-[#7ff4eb] hover:bg-[#BF7076] text-white text-sm px-2 py-2 rounded-md font-medium transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ minWidth: '140px', textAlign: 'center' }}>
                  {uploading ? 'Téléchargement...' : (formData.photoProfile ? 'Changer la photo' : 'Choisir une photo')}
                </label>
              </div>
              {formData.photoProfile && (
                <div className="ml-2">
                  <img
                    src={formData.photoProfile}
                    alt="Aperçu"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            {uploading && <p className="text-xs text-gray-500 mt-1">Téléchargement en cours...</p>}
            {/* L'aperçu est déjà affiché à côté du bouton */}
          </div>

          {/* Nom complet */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm"
            />
          </div>

          {/* Email (lecture seule) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              L'email ne peut pas être modifié
            </p>
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+33 1 23 45 67 89"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm"
            />
          </div>

          {/* Adresse par défaut (lecture seule) */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse par défaut
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              readOnly
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              L'adresse est synchronisée avec votre adresse par défaut dans "Mes adresses"
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h3>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Laissez vide pour ne pas changer"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm"
            />
          </div>

          {/* Confirmer le mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirmez le nouveau mot de passe"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#00559b] focus:border-[#00559b] sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#00559b] hover:bg-[#2b5a67] disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};
