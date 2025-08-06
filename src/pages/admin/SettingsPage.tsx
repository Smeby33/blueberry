import React, { useState, useEffect } from 'react';
import { SaveIcon, UploadCloud } from 'lucide-react';
import { getEntrepriseInfo, updateEntrepriseInfo } from '../../services/entreprise.js';
import { getAppearanceInfo, updateAppearanceInfo, uploadAppearanceImage } from '../../services/appearance.js';

// Types pour l'apparence
type Appearance = {
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
};
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    restaurantName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: ''
  });
  const [success, setSuccess] = useState(false);
  // Apparence dynamique
  const [appearance, setAppearance] = useState<Appearance>({
    logo: '',
    favicon: '',
    primaryColor: '#0B3B47',
    secondaryColor: '#78013B',
    backgroundColor: '#e2b7d3',
    fontFamily: 'Inter',
  });
  const [appearanceLoading, setAppearanceLoading] = useState(false);
  const [appearanceSuccess, setAppearanceSuccess] = useState(false);
  // Charger l'apparence Firestore au montage
  useEffect(() => {
    if (activeTab === 'appearance') {
      setAppearanceLoading(true);
      getAppearanceInfo().then((data: Appearance | undefined) => {
        if (data) setAppearance(data);
      }).finally(() => setAppearanceLoading(false));
    }
  }, [activeTab]);

  // Gestion des champs d'apparence
  function handleAppearanceChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setAppearance(a => ({ ...a, [e.target.name]: e.target.value }));
  }

  // Upload logo/favicon
  async function handleAppearanceImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Appearance
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAppearanceLoading(true);
    try {
      const url = await uploadAppearanceImage(file);
      setAppearance(a => ({ ...a, [field]: url }));
    } finally {
      setAppearanceLoading(false);
    }
  }

  // Sauvegarde apparence
  async function handleAppearanceSave() {
    setAppearanceLoading(true);
    setAppearanceSuccess(false);
    try {
      await updateAppearanceInfo(appearance);
      setAppearanceSuccess(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert("Erreur lors de la sauvegarde de l'apparence : " + e.message);
      } else {
        alert("Erreur lors de la sauvegarde de l'apparence");
      }
    } finally {
      setAppearanceLoading(false);
    }
  }
  const tabs = [
    { id: 'general', name: 'Général' },
    { id: 'appearance', name: 'Apparence' },
    // { id: 'notifications', name: 'Notifications' },
    { id: 'delivery', name: 'Livraison' },
    { id: 'payment', name: 'Paiement' },
    { id: 'advanced', name: 'Avancé' }
  ];

  // Charger les infos Firestore au montage
  useEffect(() => {
    if (activeTab === 'general') {
      setLoading(true);
      console.log('[SettingsPage] Chargement des infos entreprise...');
      getEntrepriseInfo().then((data: any) => {
        console.log('[SettingsPage] Données Firestore reçues:', data);
        if (data) setForm({
          restaurantName: data.restaurantName || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          address: data.address || '',
          description: data.description || ''
        });
      }).finally(() => {
        setLoading(false);
        console.log('[SettingsPage] Chargement terminé. Form:', form);
      });
    }
  }, [activeTab]);

  // Gestion des champs
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => {
      const newForm = { ...f, [e.target.name]: e.target.value };
      console.log('[SettingsPage] Changement de champ:', e.target.name, '=>', e.target.value, 'Form:', newForm);
      return newForm;
    });
  }

  // Sauvegarde Firestore
  async function handleSave() {
    setLoading(true);
    setSuccess(false);
    console.log('[SettingsPage] Sauvegarde des infos entreprise...', form);
    try {
      await updateEntrepriseInfo(form);
      setSuccess(true);
      console.log('[SettingsPage] Sauvegarde réussie.');
    } catch (e: unknown) {
      console.error('[SettingsPage] Erreur lors de la sauvegarde:', e);
      if (e instanceof Error) {
        alert("Erreur lors de la sauvegarde : " + e.message);
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } finally {
      setLoading(false);
    }
  }

  return <div className="px-4 md:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      <div className="mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map(tab => <button key={tab.id} className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id ? 'border-[#0B3B47] text-[#0B3B47]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `} onClick={() => setActiveTab(tab.id)}>
                {tab.name}
              </button>)}
          </nav>
        </div>
        <div className="mt-6">
          {/* Paramètres généraux */}
          {activeTab === 'general' && <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informations de l'entreprise
              </h2>
              {loading ? <div className="text-gray-500">Chargement...</div> : <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                        Nom de l'entreprise
                      </label>
                      <input type="text" name="restaurantName" id="restaurantName" value={form.restaurantName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email de contact
                      </label>
                      <input type="email" name="email" id="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Téléphone
                      </label>
                      <input type="tel" name="phone" id="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                    </div>
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Site web
                      </label>
                      <input type="text" name="website" id="website" value={form.website} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Adresse
                    </label>
                    <textarea id="address" name="address" rows={3} value={form.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                  </div>
                </div>
                {success && <div className="text-green-600 mt-4">Modifications enregistrées !</div>}
                <div className="bg-gray-50 px-6 py-3 flex justify-end mt-6">
                  <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B3B47] hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B47] disabled:opacity-60">
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>}
            </div>
          </div>}
          {/* Paramètres d'apparence */}
          {activeTab === 'appearance' && <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Personnalisation de l'apparence
              </h2>
              {appearanceLoading ? <div className="text-gray-500">Chargement...</div> : <form onSubmit={e => { e.preventDefault(); handleAppearanceSave(); }}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Logo</label>
                    <div className="mt-1 flex items-center gap-4">
                      {appearance.logo ? (
                        <img src={appearance.logo} alt="Logo" className="h-16 w-16 rounded object-cover bg-gray-100" />
                      ) : (
                        <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500">Logo</span>
                        </div>
                      )}
                      <label className="ml-2 inline-flex items-center px-3 py-2 bg-[#0B3B47] hover:bg-[#28505e] text-white text-sm font-medium rounded-md cursor-pointer shadow-sm transition-colors" htmlFor="logo-upload">
                        <UploadCloud className="h-4 w-4 mr-2" /> Choisir un fichier
                        <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={e => handleAppearanceImageChange(e, 'logo')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Favicon</label>
                    <div className="mt-1 flex items-center gap-4">
                      {appearance.favicon ? (
                        <img src={appearance.favicon} alt="Favicon" className="h-8 w-8 rounded object-cover bg-gray-100" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Fav</span>
                        </div>
                      )}
                      <label className="ml-2 inline-flex items-center px-3 py-2 bg-[#0B3B47] hover:bg-[#28505e] text-white text-sm font-medium rounded-md cursor-pointer shadow-sm transition-colors" htmlFor="favicon-upload">
                        <UploadCloud className="h-4 w-4 mr-2" /> Choisir un fichier
                        <input id="favicon-upload" type="file" accept="image/*" className="hidden" onChange={e => handleAppearanceImageChange(e, 'favicon')} />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">Couleur principale</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="color" name="primaryColor" id="primaryColor" value={appearance.primaryColor} onChange={handleAppearanceChange} className="h-10 w-10 border border-gray-300 rounded-md" />
                        <input type="text" name="primaryColor" value={appearance.primaryColor} onChange={handleAppearanceChange} className="ml-2 flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">Couleur secondaire</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="color" name="secondaryColor" id="secondaryColor" value={appearance.secondaryColor} onChange={handleAppearanceChange} className="h-10 w-10 border border-gray-300 rounded-md" />
                        <input type="text" name="secondaryColor" value={appearance.secondaryColor} onChange={handleAppearanceChange} className="ml-2 flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700">Couleur de fond</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="color" name="backgroundColor" id="backgroundColor" value={appearance.backgroundColor} onChange={handleAppearanceChange} className="h-10 w-10 border border-gray-300 rounded-md" />
                        <input type="text" name="backgroundColor" value={appearance.backgroundColor} onChange={handleAppearanceChange} className="ml-2 flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700">Police de caractères</label>
                    <select id="fontFamily" name="fontFamily" value={appearance.fontFamily} onChange={handleAppearanceChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]">
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                      <option>Lato</option>
                      <option>Montserrat</option>
                    </select>
                  </div>
                </div>
                {appearanceSuccess && <div className="text-green-600 mt-4">Apparence enregistrée !</div>}
                <div className="bg-gray-50 px-6 py-3 flex justify-end mt-6">
                  <button type="submit" disabled={appearanceLoading} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B3B47] hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B47] disabled:opacity-60">
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {appearanceLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>}
            </div>
          </div>}
          {/* Paramètres de notifications */}
          {/* {activeTab === 'notifications' && <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Paramètres des notifications
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Notifications par email
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input id="newOrder" name="newOrder" type="checkbox" defaultChecked className="focus:ring-[#0B3B47] h-4 w-4 text-[#0B3B47] border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="newOrder" className="font-medium text-gray-700">
                            Nouvelles commandes
                          </label>
                          <p className="text-gray-500">
                            Recevoir un email pour chaque nouvelle commande
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input id="orderStatus" name="orderStatus" type="checkbox" defaultChecked className="focus:ring-[#0B3B47] h-4 w-4 text-[#0B3B47] border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="orderStatus" className="font-medium text-gray-700">
                            Changements de statut
                          </label>
                          <p className="text-gray-500">
                            Recevoir un email lorsque le statut d'une commande
                            change
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input id="lowStock" name="lowStock" type="checkbox" defaultChecked className="focus:ring-[#0B3B47] h-4 w-4 text-[#0B3B47] border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="lowStock" className="font-medium text-gray-700">
                            Stock faible
                          </label>
                          <p className="text-gray-500">
                            Recevoir un email lorsque le stock d'un produit est
                            bas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input id="dailyReport" name="dailyReport" type="checkbox" className="focus:ring-[#0B3B47] h-4 w-4 text-[#0B3B47] border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="dailyReport" className="font-medium text-gray-700">
                            Rapport quotidien
                          </label>
                          <p className="text-gray-500">
                            Recevoir un rapport quotidien des ventes et
                            commandes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700">
                      Notifications clients
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input id="orderConfirmation" name="orderConfirmation" type="checkbox" defaultChecked className="focus:ring-[#0B3B47] h-4 w-4 text-[#0B3B47] border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="orderConfirmation" className="font-medium text-gray-700">
                            Confirmation de commande
                          </label>
                          <p className="text-gray-500">
                            Envoyer un email de confirmation aux clients après
                            une commande
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input id="orderStatusUpdate" name="orderStatusUpdate" type="checkbox" defaultChecked className="focus:ring-[#0B3B47] h-4 w-4 text-[#0B3B47] border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="orderStatusUpdate" className="font-medium text-gray-700">
                            Mise à jour du statut
                          </label>
                          <p className="text-gray-500">
                            Notifier les clients des changements de statut de
                            leur commande
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input id="marketing" name="marketing" type="checkbox" className="focus:ring-[#0B3B47] h-4 w-4 text-[#0B3B47] border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="marketing" className="font-medium text-gray-700">
                            Emails marketing
                          </label>
                          <p className="text-gray-500">
                            Envoyer des promotions et offres spéciales aux
                            clients
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end">
                <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0B3B47] hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B47]">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Enregistrer
                </button>
              </div>
            </div>} */}
          {/* Afficher un message pour les autres onglets */}
          {!['general', 'appearance', 'notifications'].includes(activeTab) && <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Paramètres {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <p className="text-gray-500">
                Cette section est en cours de développement.
              </p>
            </div>}
        </div>
      </div>
    </div>;
}