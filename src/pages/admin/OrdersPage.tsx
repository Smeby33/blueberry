import React, { useState } from 'react';
import { SearchIcon, FilterIcon, EyeIcon, CheckIcon, XIcon, TruckIcon, ClockIcon, CalendarIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  React.useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const allOrders = await import('../../services/orders.js').then(mod => mod.getOrders());
        console.log('[OrdersPage] Commandes Firestore:', allOrders);
        setOrders(allOrders);
      } catch (err) {
        console.error('[OrdersPage] Erreur chargement commandes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = (order.id && order.id.includes(searchTerm))
      || (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase()))
      || (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    const orderDate = order.createdAt ? new Date(order.createdAt.seconds ? order.createdAt.seconds * 1000 : order.createdAt) : null;
    const today = new Date();
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = orderDate ? orderDate.toDateString() === today.toDateString() : false;
    } else if (dateFilter === 'week') {
      if (orderDate) {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);
        matchesDate = orderDate >= startOfWeek && orderDate <= endOfWeek;
      } else {
        matchesDate = false;
      }
    } else if (dateFilter === 'month') {
      if (orderDate) {
        matchesDate = orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
      } else {
        matchesDate = false;
      }
    } // 'all' affiche tout
    return matchesStatus && matchesSearch && matchesDate;
  });
  const toggleOrderExpand = orderId => {
    setExpandedOrders((prev: string[]) => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };
  const getStatusColor = status => {
    switch (status as string) {
      case 'Livré':
        return 'bg-green-100 text-green-800';
      case 'En préparation':
        return 'bg-yellow-100 text-yellow-800';
      case 'En attente':
        return 'bg-blue-100 text-blue-800';
      case 'Annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const formatDate = dateString => {
    const date = new Date(dateString as any);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="px-4 md:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Gestion des commandes
      </h1>
      {/* Filtres et recherche */}
      <div className="mt-6 bg-white p-4 shadow rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" placeholder="Rechercher une commande..." className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B3B47] focus:border-[#0B3B47]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex space-x-2">
              <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B3B47] focus:border-[#0B3B47]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="En préparation">En préparation</option>
                <option value="Livré">Livré</option>
                <option value="Annulé">Annulé</option>
              </select>
              <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B3B47] focus:border-[#0B3B47]" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="all">Toutes les dates</option>
              </select>
            </div>
          </div>
          <div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
              <FilterIcon className="h-5 w-5 mr-2" />
              Filtres avancés
            </button>
          </div>
        </div>
      </div>
      {/* Liste des commandes */}
      <div className="mt-6">
        {filteredOrders.length === 0 ? <div className="bg-white shadow rounded-lg p-8 text-center">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Aucune commande trouvée
            </h3>
            <p className="text-gray-500">
              Modifiez vos filtres ou effectuez une nouvelle recherche.
            </p>
          </div> : <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map(order => {
            const isExpanded = expandedOrders.includes(order.id);
            // Trouve l'image du premier plat (si disponible)
            const mainImage = order.items && order.items.length > 0 ? order.items[0].image : null;
            return <li key={order.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleOrderExpand(order.id)}>
                        <div className="flex items-center">
                          {mainImage && (
                            <div className="w-12 h-12 rounded-md overflow-hidden mr-4 flex-shrink-0">
                              <img src={mainImage} alt="Plat" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-[#0B3B47] truncate">
                                  Commande #{order.id}
                                </p>
                                {/* Badge remplacé par icône si confirmé */}
                                {order.status === 'confirmé' ? (
                                  <CheckIcon className="ml-2 h-5 w-5 text-green-600" />
                                ) : (
                                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                )}
                              </div>
                              {/* Niveau juste en dessous du statut, modifiable */}
                              <div className="mt-1 ml-1">
                                <select
                                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold w-fit focus:outline-none"
                                  value={order.niveau || 'Commande reçue'}
                                  onChange={async (e) => {
                                    const newNiveau = e.target.value;
                                    try {
                                      // Met à jour Firestore
                                      await import('../../services/orders.js').then(mod => mod.updateOrderStatus(order.id, { niveau: newNiveau }));
                                      // Met à jour localement
                                      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, niveau: newNiveau } : o));
                                    } catch (err) {
                                      console.error('Erreur mise à jour niveau:', err);
                                    }
                                  }}
                                >
                                  <option value="Commande reçue">Commande reçue</option>
                                  <option value="En préparation">En préparation</option>
                                  <option value="En livraison">En livraison</option>
                                  <option value="Livrée">Livrée</option>
                                </select>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-sm text-gray-500">
                              <div>
                                 <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <span>{order.createdAt ? formatDate(order.createdAt.seconds ? order.createdAt.seconds * 1000 : order.createdAt) : ''}</span>
                              </div>
                               <div className="text-sm font-medium text-gray-900 mr-4">
                                  {order.total ? order.total.toFixed(2) : ''} xaf
                                </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button className="p-1 rounded-full hover:bg-gray-200">
                            {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
                          </button>
                        </div>
                      </div>
                      {/* Détails de la commande */}
                      {isExpanded && <div className="mt-4 border-t border-gray-100 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Informations client
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.userName || order.userEmail}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.userEmail}
                              </p>
                              {/* Masque l'id du client */}
                              <div className="mt-3">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Adresse de livraison
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {order.deliveryAddress || order.address}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">
                                Articles commandés
                              </h4>
                              <ul className="space-y-2">
                                {(order.items || []).map((item, index) => <li key={index} className="flex justify-between text-sm">
                                    <span>
                                      {item.quantity}x {item.name}
                                    </span>
                                    <span className="text-gray-600">
                                      {item.price ? item.price.toFixed(2) : ''} xaf
                                    </span>
                                  </li>)}
                              </ul>
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex justify-between font-medium">
                                  <span>Total</span>
                                  <span>{order.total ? order.total.toFixed(2) : ''} xaf</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Payé par {order.paymentMethod}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                            <div className="space-x-2">
                              <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0B3B47] hover:bg-[#2b5a67] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B47]">
                                <EyeIcon className="h-4 w-4 mr-1" />
                                Détails
                              </button>
                              <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B47]">
                                <TruckIcon className="h-4 w-4 mr-1" />
                                Modifier le statut
                              </button>
                            </div>
                            <div>
                              <button className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md bg-white text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                <XIcon className="h-4 w-4 mr-1" />
                                Annuler
                              </button>
                            </div>
                          </div>
                        </div>}
                    </div>
                  </li>;
          })}
            </ul>
          </div>}
      </div>
    </div>;
}