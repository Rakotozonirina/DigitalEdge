import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api, getAuthConfig } from '../utils/api';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders', getAuthConfig(user?.token));
        setOrders(data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Impossible de charger vos commandes.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'en attente':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'en cours':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'livré':
      case 'livre':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      default:
        return 'text-neutral-400 bg-neutral-800 border-neutral-700';
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-dark-700 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Tableau de bord</h2>
          <p className="text-neutral-400">Heureux de vous revoir, <span className="text-white font-medium">{user?.name}</span></p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={logout}>Deconnexion</Button>
          <Link to="/catalogue">
            <Button variant="primary">Nouvelle commande</Button>
          </Link>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-6">Vos commandes recentes</h3>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4">
            <div className="h-24 bg-dark-800 rounded-xl"></div>
            <div className="h-24 bg-dark-800 rounded-xl"></div>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4 text-neutral-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <h4 className="text-xl font-semibold mb-2">Aucune commande</h4>
            <p className="text-neutral-400 mb-6">Vous n&apos;avez pas encore passe de commande de design.</p>
            <Link to="/catalogue">
              <Button>Explorer le catalogue</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order, index) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card hoverEffect className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-dark-700 bg-dark-800/40">
                <div className="mb-4 sm:mb-0">
                  <h4 className="text-lg font-bold text-white mb-1">{order.service?.title || 'Service indisponible'}</h4>
                  <p className="text-sm text-neutral-400">Commande le {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <Link to={`/order/${order._id}`}>
                    <Button variant="outline" size="sm">Gerer</Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
