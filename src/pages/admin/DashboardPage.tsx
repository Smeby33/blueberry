import { useEffect, useState } from 'react';
import { ShoppingCartIcon, TrendingUpIcon, UsersIcon, UtensilsIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import database from '../../services/database'; // TypeScript: ajouter un fichier de déclaration si besoin
export function DashboardPage() {
  type OrderType = {
    id: string;
    customerName?: string;
    customer?: string;
    userName?: string;
    items?: { name: string; quantity?: number }[];
    total?: number;
    status?: string;
    createdAt?: { seconds: number };
  };
  type UserType = {
    id: string;
    name?: string;
    createdAt?: { seconds: number };
    role?: string;
  };
  // type ProductType supprimé car inutilisé
  // États dynamiques
  const [stats, setStats] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const orders: OrderType[] = await database.getAllOrders();
        const users: UserType[] = await database.getAllUsers();
        const todayStr = new Date().toDateString();
        const commandesDuJour = orders.filter(order => {
          const orderDate = order.createdAt ? new Date(order.createdAt.seconds * 1000) : null;
          return orderDate && orderDate.toDateString() === todayStr;
        });
        const ventesDuJour = commandesDuJour.reduce((sum, o) => sum + (o.total || 0), 0);
        const nouveauxClients = users.filter(u => {
          const userDate = u.createdAt ? new Date(u.createdAt.seconds * 1000) : null;
          // Exclure les admins
          return userDate && userDate.toDateString() === todayStr && u.role !== 'admin';
        }).length;
        const produitsVendues = commandesDuJour.reduce((sum, o) => sum + (o.items ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0), 0);
        setStats([
          {
            name: 'Commandes du jour',
            value: commandesDuJour.length,
            change: 0,
            changeType: 'increase',
            icon: <ShoppingCartIcon className="w-6 h-6 text-white" />, iconBg: 'bg-blue-500'
          },
          {
            name: 'Ventes du jour',
            value: `${ventesDuJour} xaf`,
            change: 0,
            changeType: 'increase',
            icon: <TrendingUpIcon className="w-6 h-6 text-white" />, iconBg: 'bg-green-500'
          },
          {
            name: 'Nouveaux clients',
            value: nouveauxClients,
            change: 0,
            changeType: 'increase',
            icon: <UsersIcon className="w-6 h-6 text-white" />, iconBg: 'bg-orange-500'
          },
          {
            name: 'Produits vendus',
            value: produitsVendues,
            change: 0,
            changeType: 'increase',
            icon: <UtensilsIcon className="w-6 h-6 text-white" />, iconBg: 'bg-purple-500'
          }
        ]);
        const sortedOrders = [...orders].sort((a, b) => {
          const da = a.createdAt ? a.createdAt.seconds : 0;
          const db = b.createdAt ? b.createdAt.seconds : 0;
          return db - da;
        });
        setRecentOrders(sortedOrders.slice(0, 5).map(order => ({
          id: order.id,
          customer: order.userName || order.customerName || order.customer || 'Client',
          items: order.items ? order.items.map(i => i.name) : [],
          total: order.total ? `${order.total} xaf` : '',
          status: order.status || 'En attente',
          date: order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        })));
        const productSales: { [name: string]: number } = {};
        orders.forEach(order => {
          if (order.items) {
            order.items.forEach(item => {
              productSales[item.name] = (productSales[item.name] || 0) + (item.quantity || 1);
            });
          }
        });
        const totalSold = Object.values(productSales).reduce((sum, c) => sum + c, 0);
        const sortedPopular = Object.entries(productSales)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({
            name,
            count,
            percentage: totalSold ? Math.round((count / totalSold) * 100) : 0
          }));
        setPopularItems(sortedPopular);
      } catch (err) {
        toast.error('Erreur lors du chargement des données du dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="px-4 md:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      {loading ? (
        <div className="py-12 text-center text-gray-500 text-lg">Chargement des statistiques...</div>
      ) : (
        <>
          {/* Cartes de statistiques */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${stat.iconBg}`}>{stat.icon}</div>
                    <div className="ml-5 w-0 flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                        <dd className="flex items-center text-lg font-medium text-gray-900">
                          {stat.value}
                          <span className={`ml-2 flex items-center text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.changeType === 'increase' ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
                            {Math.abs(stat.change)}%
                          </span>
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Commandes récentes */}
              <div className="bg-white shadow rounded-lg lg:col-span-2">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900">Commandes récentes</h2>
                  <div className="mt-4 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentOrders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#0B3B47]">#{order.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{order.items.join(', ')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Livrée' ? 'bg-green-100 text-green-800' : order.status === 'En préparation' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{order.status}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-center">
                      <Link to="/admin/orders" className="text-[#0B3B47] hover:text-[#2b5a67] font-medium">Voir toutes les commandes</Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* Produits populaires */}
              <div className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900">Produits populaires</h2>
                  <div className="mt-4">
                    <ul className="space-y-4">
                      {popularItems.map(item => (
                        <li key={item.name} className="flex items-center">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{item.name}</span>
                              <span className="text-sm text-gray-500">{item.count} vendus</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-[#78013B] h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 text-center">
                      <Link to="/admin/products" className="text-[#0B3B47] hover:text-[#2b5a67] font-medium">Voir tous les produits</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
}