import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircleIcon, TruckIcon, UtensilsIcon, ClockIcon, HomeIcon, XCircleIcon } from 'lucide-react';
import { getUserOrders } from '../services/orders.js';
import { getUserConfirmedOrders } from '../services/orders.js';
import { toast } from 'react-toastify';
export function OrderTrackingPage({ user }: { user?: any }) {
  const { orderId } = useParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  // Charger les commandes de l'utilisateur
  useEffect(() => {
    const loadUserConfirmedOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        console.log('📋 [OrderTrackingPage] Chargement des commandes confirmées pour:', user.uid);
        const confirmedOrders = await getUserConfirmedOrders(user.uid);
        setOrders(confirmedOrders);
        // Si un orderId spécifique est fourni, le trouver
        if (orderId) {
          const order = confirmedOrders.find((o: any) => o.id === orderId);
          setCurrentOrder(order);
        } else if (confirmedOrders.length > 0) {
          // Sinon, prendre la commande la plus récente
          setCurrentOrder(confirmedOrders[0]);
        }
      } catch (error) {
        console.error('❌ [OrderTrackingPage] Erreur lors du chargement des commandes confirmées:', error);
        toast.error('Erreur lors du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };
    loadUserConfirmedOrders();
  }, [user, orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'non-confirmé':
        return 'text-orange-600 bg-orange-100';
      case 'confirmé':
        return 'text-blue-600 bg-blue-100';
      case 'en-préparation':
        return 'text-yellow-600 bg-yellow-100';
      case 'en-livraison':
        return 'text-purple-600 bg-purple-100';
      case 'livré':
        return 'text-green-600 bg-green-100';
      case 'annulé':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmé':
      case 'livré':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'en-livraison':
        return <TruckIcon className="w-5 h-5" />;
      case 'annulé':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  // Simulation de progression pour la démo (garder le comportement existant si pas d'utilisateur)
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState(25);
  // Simulate order progress
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 4) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
      setEstimatedTime(prev => Math.max(0, prev - 5));
    }, 10000); // Change step every 10 seconds for demo
    return () => clearInterval(timer);
  }, []);
  // Définir les étapes dynamiquement selon le champ niveau
  const steps = [
    { id: 1, title: 'Commande reçue', icon: CheckCircleIcon },
    { id: 2, title: 'En préparation', icon: UtensilsIcon },
    { id: 3, title: 'En livraison', icon: TruckIcon },
    { id: 4, title: 'Livrée', icon: HomeIcon }
  ];
  // Utiliser les données dynamiques de la commande
  const orderItems = currentOrder?.items || [];
  const subtotal = currentOrder ? currentOrder.subtotal : 0;
  const deliveryFee = currentOrder ? currentOrder.deliveryFee : 0;
  const total = currentOrder ? currentOrder.total : subtotal + deliveryFee;
  return <div className="py-12 bg-[#e1edf7]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#00559b]">
                  Suivi de commande
                </h1>
                <div className="bg-[#e1edf7] px-3 py-1 rounded-full text-sm font-medium text-[#00559b]">
                  Commande #{currentOrder?.id || orderId}
                </div>
              </div>
              <div className="mb-8">
                <div className="relative">
                  {/* Progress bar */}
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div className="h-1 bg-[#7ff4eb] rounded-full transition-all duration-1000" style={{
                    width: `${(() => {
                      // Trouver l'étape actuelle selon currentOrder.niveau
                      const niveau = currentOrder?.niveau || 'Commande reçue';
                      const idx = steps.findIndex(s => s.title.toLowerCase() === niveau.toLowerCase());
                      return idx >= 0 ? idx * 100 / (steps.length - 1) : 0;
                    })()}%`
                  }}></div>
                  </div>
                  {/* Steps */}
                  <div className="flex justify-between mt-2">
                    {steps.map((step, i) => {
                      const niveau = currentOrder?.niveau || 'Commande reçue';
                      const idx = steps.findIndex(s => s.title.toLowerCase() === niveau.toLowerCase());
                      return <div key={step.id} className={`flex flex-col items-center ${step.id <= idx + 1 ? 'text-[#00559b]' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.id < idx + 1 ? 'bg-[#7ff4eb] text-white' : step.id === idx + 1 ? 'bg-[#00559b] text-white' : 'bg-gray-200'}`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <div className="text-xs mt-2 font-medium text-center">
                          {step.title}
                        </div>
                      </div>;
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-[#e1edf7] p-4 rounded-lg flex items-center mb-6">
                <div className="bg-white p-2 rounded-full mr-4">
                  <ClockIcon className="w-6 h-6 text-[#7ff4eb]" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Temps estimé</div>
                  <div className="font-bold text-[#00559b]">
                    {currentOrder?.estimatedDeliveryTime || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h2 className="font-semibold text-lg mb-4">
                  Détails de la commande
                </h2>
                <div className="space-y-4 mb-6">
                  {orderItems.map((item: any, idx: number) => <div key={item.id || idx} className="flex items-center">
                      <div className="w-16 h-16 rounded-md overflow-hidden mr-4">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{item.name}</span>
                          <span className="font-medium">
                            {(item.price * item.quantity).toFixed(2)} xaf
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} x {item.price?.toFixed(2) || '0.00'} xaf
                        </div>
                      </div>
                    </div>)}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{subtotal ? subtotal.toFixed(2) : '0.00'} xaf</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span>{deliveryFee ? deliveryFee.toFixed(2) : '0.00'} xaf</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-[#00559b]">{total ? total.toFixed(2) : '0.00'} xaf</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link to="/menu" className="bg-[#00559b] hover:bg-[#2b5a67] text-white px-6 py-3 rounded-md font-medium inline-block transition-colors">
              Retour au menu
            </Link>
          </div>
        </div>
      </div>
    </div>;
}