import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api, getAuthConfig } from '../utils/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders', getAuthConfig(user?.token));
        setOrders(data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Impossible de charger les commandes.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchOrders();
    }
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    setPendingId(orderId);
    setError('');

    try {
      const { data } = await api.put(
        `/orders/${orderId}`,
        { status: newStatus },
        getAuthConfig(user?.token),
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === orderId ? data : order)),
      );
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'La mise a jour du statut a echoue.');
    } finally {
      setPendingId('');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer cette commande ?')) {
      return;
    }

    setPendingId(orderId);
    setError('');

    try {
      await api.delete(`/orders/${orderId}`, getAuthConfig(user?.token));
      setOrders((currentOrders) => currentOrders.filter((order) => order._id !== orderId));
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'La suppression a echoue.');
    } finally {
      setPendingId('');
    }
  };

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
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-dark-700 pb-8 gap-4">
        <div>
          <span className="text-accent font-bold tracking-wider uppercase text-sm mb-2 block">Acces Restreint</span>
          <h2 className="text-3xl font-bold text-white mb-1">Panel Administrateur</h2>
          <p className="text-neutral-400">Gerez les commandes de vos clients et modifiez leurs statuts en un clic.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/services">
            <Button variant="outline">Manage Catalog</Button>
          </Link>
          <Button variant="ghost" onClick={logout}>Deconnexion</Button>
        </div>
      </div>

      <Card hoverEffect={false} className="border-dark-700 overflow-hidden">
        {error ? (
          <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-dark-800/80 text-xs uppercase font-semibold text-neutral-400 border-b border-dark-700">
              <tr>
                <th scope="col" className="px-6 py-4">Client</th>
                <th scope="col" className="px-6 py-4">Service commande</th>
                <th scope="col" className="px-6 py-4">Date de reception</th>
                <th scope="col" className="px-6 py-4">Statut actuel</th>
                <th scope="col" className="px-6 py-4 text-right">Actions rapides</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">
                    Chargement des commandes de l&apos;agence...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">
                    Aucune commande a afficher.
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-dark-700/50 hover:bg-dark-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{order.client?.name || 'Client inconnu'}</div>
                      <div className="font-normal text-xs text-neutral-500 mt-1">{order.client?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.service?.title || 'Service supprime'}</div>
                      <div className="font-normal text-xs text-accent mt-1">{order.amount} €</div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded border text-xs font-semibold uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <select
                          className="bg-dark-900 border border-dark-700 text-neutral-300 text-sm rounded focus:ring-accent focus:border-accent block p-2 outline-none transition-colors cursor-pointer"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={pendingId === order._id}
                        >
                          <option value="en attente">En attente</option>
                          <option value="en cours">En cours</option>
                          <option value="livre">Livre</option>
                        </select>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="p-2 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 cursor-pointer disabled:opacity-50"
                          title="Supprimer la commande"
                          disabled={pendingId === order._id}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
