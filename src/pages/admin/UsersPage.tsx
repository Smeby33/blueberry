import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/users.js';
import { getUserOrders } from '../../services/orders.js';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, UserIcon, MailIcon, PhoneIcon, KeyIcon } from 'lucide-react';
export function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  // Utilisateurs dynamiques
  type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'client';
    address?: string;
    orders?: number;
    lastOrder?: string | null;
    createdAt: string;
  };
  const [users, setUsers] = useState<User[]>([]);
  const [userOrdersCount, setUserOrdersCount] = useState<{ [userId: string]: number }>({});
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    setUsersLoading(true);
    getAllUsers()
      .then(async (data: User[] | undefined) => {
        const usersList = data || [];
        setUsers(usersList);
        setUsersError('');
        // Pour chaque utilisateur, récupérer le nombre de commandes
        const ordersCountObj: { [userId: string]: number } = {};
        await Promise.all(usersList.map(async (user) => {
          try {
            const orders = await getUserOrders(user.id || user.uid || user.userId);
            ordersCountObj[user.id || user.uid || user.userId] = orders.length;
          } catch {
            ordersCountObj[user.id || user.uid || user.userId] = 0;
          }
        }));
        setUserOrdersCount(ordersCountObj);
      })
      .catch(() => {
        setUsersError("Erreur lors du chargement des utilisateurs");
      })
      .finally(() => setUsersLoading(false));
  }, []);
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || (user.phone && user.phone.includes(searchTerm));
    return matchesRole && matchesSearch;
  });
  const handleAddUser = () => {
    setCurrentUser(null);
    setShowModal(true);
  };
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setShowModal(true);
  };
  // Gère les dates Firestore (Timestamp ou string)
  const formatDate = (date: any) => {
    if (!date) return '-';
    // Firestore Timestamp
    if (typeof date === 'object' && date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('fr-FR');
    }
    // String ISO ou Date
    return new Date(date).toLocaleDateString('fr-FR');
  };
  return <div className="px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des utilisateurs
        </h1>
        <button onClick={handleAddUser} className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-[#0B3B47] text-white font-medium rounded-md hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B47]">
          <PlusIcon className="w-5 h-5 mr-2" />
          Ajouter un utilisateur
        </button>
      </div>
      {/* Filtres et recherche */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" placeholder="Rechercher un utilisateur..." className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B3B47] focus:border-[#0B3B47]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div>
          <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B3B47] focus:border-[#0B3B47]" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="client">Clients</option>
          </select>
        </div>
      </div>
      {/* Liste des utilisateurs */}
      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="w-full overflow-x-auto">
            {usersLoading ? (
              <div className="p-8 text-center text-gray-500">Chargement des utilisateurs...</div>
            ) : usersError ? (
              <div className="p-8 text-center text-red-500">{usersError}</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commandes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscrit le
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            {/* ID masqué */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MailIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && <div className="text-sm text-gray-500 flex items-center mt-1">
                            <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {user.phone}
                          </div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role === 'admin' ? 'Admin' : 'Client'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'client' ? <>
                            <div>
                      {userOrdersCount[user.id || user.uid || user.userId] ?? 0} commande{(userOrdersCount[user.id || user.uid || user.userId] ?? 0) !== 1 ? 's' : ''}
                            </div>
                            {user.lastOrder && <div className="text-xs text-gray-400 mt-1">
                                Dernière: {formatDate(user.lastOrder)}
                              </div>}
                          </> : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEditUser(user)} className="text-[#0B3B47] hover:text-[#2b5a67] mr-3">
                          <EditIcon className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {/* Modal d'ajout/modification d'utilisateur */}
      {showModal && <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {currentUser ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
                </h3>
                <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nom complet
                    </label>
                    <input type="text" name="name" id="name" defaultValue={currentUser?.name || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input type="email" name="email" id="email" defaultValue={currentUser?.email || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <input type="tel" name="phone" id="phone" defaultValue={currentUser?.phone || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Rôle
                    </label>
                    <select id="role" name="role" defaultValue={currentUser?.role || 'client'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]">
                      <option value="client">Client</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Adresse
                  </label>
                  <textarea id="address" name="address" rows={2} defaultValue={currentUser?.address || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                </div>
                  {!currentUser && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Mot de passe
                        </label>
                        <input type="password" name="password" id="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirmer le mot de passe
                        </label>
                        <input type="password" name="confirmPassword" id="confirmPassword" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0B3B47] focus:border-[#0B3B47]" />
                      </div>
                    </div>}
                  {currentUser && <div>
                      <button className="text-[#0B3B47] hover:text-[#2b5a67] text-sm flex items-center">
                        <KeyIcon className="h-4 w-4 mr-1" />
                        Réinitialiser le mot de passe
                      </button>
                    </div>}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#0B3B47] text-base font-medium text-white hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B47] sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setShowModal(false)}>
                  {currentUser ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
}