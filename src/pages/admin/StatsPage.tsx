import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getOrders } from '../../services/orders.js';
import { getAllUsers } from '../../services/users.js';
import { getAllCategories } from '../../services/categories.js';
export function StatsPage() {
  const [timeRange, setTimeRange] = useState('week');
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const COLORS = ['#0B3B47', '#78013B', '#5E9CA9', '#F6A67B', '#8BBAC5'];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [ordersData, usersData, categoriesData] = await Promise.all([
          getOrders(),
          getAllUsers(),
          getAllCategories()
        ]);
        setOrders(ordersData);
        setUsers(usersData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('[StatsPage] Erreur chargement stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helpers pour filtrer selon timeRange
  function isInRange(date: Date) {
    const now = new Date();
    if (timeRange === 'day') {
      return date.toDateString() === now.toDateString();
    } else if (timeRange === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);
      return date >= startOfWeek && date <= endOfWeek;
    } else if (timeRange === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    } else if (timeRange === 'year') {
      return date.getFullYear() === now.getFullYear();
    }
    return true;
  }

  // Préparation des données dynamiques
  const ordersWithDate = orders.map(order => ({
    ...order,
    _createdAt: order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : (order.createdAt ? new Date(order.createdAt) : null)
  })).filter(order => order._createdAt && isInRange(order._createdAt));

  // Commandes (toutes, confirmées ou non)
  const totalOrders = ordersWithDate.length;
  // Ventes = commandes confirmées
  const confirmedOrders = ordersWithDate.filter(order => order.status === 'confirmé');
  const totalSales = confirmedOrders.length;
  // CA = somme des totaux des commandes confirmées
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  // Panier moyen = CA / nb ventes
  const avgBasket = totalSales > 0 ? totalRevenue / totalSales : 0;
  // Nouveaux clients = utilisateurs créés dans la période ET dont le rôle n'est pas "client"
  const usersWithDate = users.map(u => ({
    ...u,
    _createdAt: u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : (u.createdAt ? new Date(u.createdAt) : null)
  })).filter(u => u._createdAt && isInRange(u._createdAt));
  const newClients = usersWithDate.filter(u => u.role !== 'admin').length;

  // Graphique ventes/commandes par jour de la semaine
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const salesData = days.map((day, idx) => {
    const dayOrders = ordersWithDate.filter(order => order._createdAt.getDay() === idx);
    const daySales = dayOrders.filter(order => order.status === 'confirmé');
    return {
      day,
      sales: daySales.reduce((sum, o) => sum + (o.total || 0), 0),
      orders: dayOrders.length
    };
  });

  // Log détaillé des items des commandes confirmées (y compris sous-items)
  const allConfirmedItems = confirmedOrders.flatMap(order => {
    const items = order.items || [];
    // On récupère tous les sous-items si présents
    return items.flatMap((item: any) => {
      if (Array.isArray(item.items) && item.items.length > 0) {
        // Ajoute le menu lui-même (si pertinent) + tous les sous-items
        return [item, ...item.items];
      }
      return item;
    });
  });
  console.log('[StatsPage] Items des commandes confirmées (avec sous-items):', allConfirmedItems.map(item => ({ name: item.name, category: item.category })));
  // Répartition par catégorie (dynamique depuis Firestore)
  const categoryMap: Record<string, number> = {};
  allConfirmedItems.forEach((item: any) => {
    const cat = item.category || 'Autre';
    categoryMap[cat] = (categoryMap[cat] || 0) + (item.quantity || 1);
  });
  // Utilise la liste dynamique des catégories Firestore
  const categoryData = categories.map(cat => ({
    name: cat.name || cat.id,
    value: categoryMap[cat.id] || 0
  })).filter(cat => cat.value > 0);
  // Ajoute "Autre" si besoin
  if (categoryMap['Autre']) {
    categoryData.push({ name: 'Autre', value: categoryMap['Autre'] });
  }
  // LOGS DEBUG pour stats par catégorie
  console.log('[StatsPage] categoryMap (issus des commandes confirmées):', categoryMap);
  console.log('[StatsPage] categories Firestore:', categories);
  console.log('[StatsPage] Données finales pour le graphique (categoryData):', categoryData);

  // Top produits (par ventes)
  const productMap: Record<string, { name: string, sales: number, revenue: number }> = {};
  confirmedOrders.forEach(order => {
    (order.items || []).forEach((item: any) => {
      if (!productMap[item.name]) {
        productMap[item.name] = { name: item.name, sales: 0, revenue: 0 };
      }
      productMap[item.name].sales += item.quantity || 1;
      productMap[item.name].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Répartition horaire des commandes (toutes commandes, dynamique)
  // On récupère toutes les heures présentes dans les commandes filtrées
  const allOrderHours = ordersWithDate.map(order => order._createdAt.getHours());
  const uniqueHours = Array.from(new Set(allOrderHours)).sort((a, b) => a - b);
  const hourlyData = uniqueHours.map(h => {
    const label = `${h.toString().padStart(2, '0')}:00`;
    const count = ordersWithDate.filter(order => order._createdAt.getHours() === h).length;
    return { hour: label, orders: count };
  });
  // Log pour debug
  console.log('[StatsPage] Heures présentes dans les commandes:', uniqueHours);
  console.log('[StatsPage] Données pour le graphique horaire:', hourlyData);
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Chargement des statistiques...</div>;
  }
  return <div className="px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Statistiques et rapports
        </h1>
        <div className="mt-4 md:mt-0">
          <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0B3B47] focus:border-[#0B3B47]" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>
      {/* Résumé des statistiques */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">{totalOrders}</div>
                <div className="text-sm font-medium text-gray-500">
                  Commandes
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">{totalRevenue.toFixed(2)} xaf</div>
                <div className="text-sm font-medium text-gray-500">
                  Chiffre d'affaires
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">{avgBasket.toFixed(2)} xaf</div>
                <div className="text-sm font-medium text-gray-500">
                  Panier moyen
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">{newClients}</div>
                <div className="text-sm font-medium text-gray-500">
                  Nouveaux clients
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Graphiques */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Graphique des ventes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Ventes et commandes
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" orientation="left" stroke="#0B3B47" />
                <YAxis yAxisId="right" orientation="right" stroke="#78013B" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name="Ventes (xaf)" fill="#0B3B47" />
                <Bar yAxisId="right" dataKey="orders" name="Commandes" fill="#78013B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Répartition par catégorie */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Répartition des ventes par catégorie
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={value => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top produits */}
        <div className="bg-white shadow rounded-lg p-3">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Produits les plus vendus
          </h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QTé
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CA
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {product.sales}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {product.revenue.toFixed(2)} xaf
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
        {/* Répartition horaire */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Répartition horaire des commandes
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#0B3B47" activeDot={{
                r: 8
              }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Boutons d'export */}
      <div className="mt-8 flex justify-end space-x-4">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
          Exporter en CSV
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
          Exporter en PDF
        </button>
      </div>
    </div>;
}