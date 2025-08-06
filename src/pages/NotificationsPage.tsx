import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationAsRead, getOrder } from '../services/database';

export type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: any;
  read?: boolean;
  orderId?: string;
};

const NotificationsPage: React.FC = () => {

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<{[orderId: string]: any}>({});

  useEffect(() => {
    import('../services/database').then(db => {
      db.getCurrentUser().then((user: any) => {
        console.log('[NOTIF][DEBUG] Utilisateur connecté:', user);
        // Récupère l'UID via getAuth
        import('firebase/auth').then(authModule => {
          const { getAuth } = authModule;
          const auth = getAuth();
          const currentUser = auth.currentUser;
          setAuthUid(currentUser?.uid || null);
          console.log('[NOTIF][DEBUG] getAuth().currentUser.uid:', currentUser?.uid);
        });
        if (user && user.uid) {
          setUserId(user.uid);
          db.getNotifications(user.uid).then(async (data: Notification[]) => {
            console.log('[NOTIF][DEBUG] Notifications reçues:', data);
            setRawData(data);
            // Récupère les détails de commande pour chaque notification avec orderId
            const details: {[orderId: string]: any} = {};
            for (const notif of data) {
              if (notif.orderId) {
                details[notif.orderId] = await getOrder(notif.orderId);
              }
            }
            setOrderDetails(details);
            setNotifications(data.sort((a, b) => {
              let dateA = a.createdAt;
              let dateB = b.createdAt;
              // Support Firestore Timestamp ou string
              if (dateA?.seconds) dateA = new Date(dateA.seconds * 1000);
              else if (typeof dateA === 'string') dateA = new Date(dateA);
              if (dateB?.seconds) dateB = new Date(dateB.seconds * 1000);
              else if (typeof dateB === 'string') dateB = new Date(dateB);
              return dateB.getTime() - dateA.getTime();
            }));
            setLoading(false);
          });
        } else {
          setUserId(null);
          setNotifications([]);
          setRawData([]);
          setLoading(false);
        }
      });
    });
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleToggleOrderDetails = async (orderId: string) => {
    setExpanded(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    if (!orderDetails[orderId]) {
      // Récupère la commande liée
      const order = await getOrder(orderId);
      setOrderDetails(prev => ({ ...prev, [orderId]: order }));
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  if (!userId) {
    return <div className="p-8 text-center text-gray-500">Veuillez vous connecter pour voir vos notifications.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#00559b]">Notifications</h2>
      {notifications.length === 0 ? (
        <>
          <div className="text-gray-500">Aucune notification.</div>
          <div className="mt-4 text-xs text-gray-400">Debug: Données brutes reçues:<br /><pre>{JSON.stringify(rawData, null, 2)}</pre></div>
        </>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => {
            let dateStr = '';
            if (notif.createdAt?.seconds) dateStr = new Date(notif.createdAt.seconds * 1000).toLocaleString();
            else if (typeof notif.createdAt === 'string') dateStr = new Date(notif.createdAt).toLocaleString();
            // Récupère le premier plat de la commande
            let firstItem = null;
            let image = '';
            let price = '';
            if (notif.orderId && orderDetails[notif.orderId] && orderDetails[notif.orderId].items && orderDetails[notif.orderId].items.length > 0) {
              firstItem = orderDetails[notif.orderId].items[0];
              image = firstItem.image || '';
              price = firstItem.price;
            }
            return (
              <li key={notif.id} className={`p-4 rounded-lg shadow bg-white border-l-4 ${notif.read ? 'border-gray-200' : 'border-[#7ff4eb]'}`}>
                <div className="flex items-center">
                  {image && (
                    <img src={image} alt={firstItem?.name} className="w-16 h-16 object-cover rounded mr-4 border" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{firstItem?.name || notif.title}</div>
                    <div className="text-gray-600 mt-1">{notif.message}</div>
                    {price && (
                      <div className="text-xs text-[#00559b] mt-1">Prix : <span className="font-mono">{price} xaf</span></div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">{dateStr}</div>
                  </div>
                  {!notif.read && (
                    <button className="ml-4 px-3 py-1 bg-transparent text-[#7ff4eb] rounded hover:bg-[#e1edf7]" onClick={() => handleMarkAsRead(notif.id)} title="Marquer comme lue">
                      <span className="text-2xl">✓</span>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
