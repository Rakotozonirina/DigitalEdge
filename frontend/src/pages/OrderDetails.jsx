import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api, getAuthConfig, getUploadUrl } from '../utils/api';

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

const formatFileLabel = (filePath) => {
  const filename = filePath.split('/').pop() || 'Fichier';
  return decodeURIComponent(filename);
};

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`, getAuthConfig(user?.token));
        setOrder(data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Impossible de charger cette commande.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchOrder();
    }
  }, [id, user]);

  const backLink = user?.role === 'admin' ? '/admin' : '/dashboard';
  const isPaid = order?.paymentStatus === 'paye' || order?.paymentStatus === 'payé' || order?.paymentStatus === 'payÃ©';

  const handlePayNow = async () => {
    if (!order?._id) {
      return;
    }

    setIsRedirectingToCheckout(true);

    try {
      const { data } = await api.post(`/orders/${order._id}/checkout-session`, {}, getAuthConfig(user?.token));
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setError('La session Stripe n a pas pu etre creee.');
    } catch (checkoutError) {
      setError(checkoutError.response?.data?.message || 'Impossible de lancer le paiement Stripe.');
    } finally {
      setIsRedirectingToCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-4 animate-pulse">
          <div className="h-24 rounded-xl bg-dark-800" />
          <div className="h-64 rounded-xl bg-dark-800" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-64px)] pt-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex items-center justify-center">
        <Card className="w-full p-8 text-center bg-dark-800 border-dark-700">
          <h2 className="text-2xl font-bold text-white mb-3">Commande indisponible</h2>
          <p className="text-neutral-400 mb-6">{error || 'Cette commande est introuvable.'}</p>
          <Link to={backLink}>
            <Button variant="outline" className="w-full">Retour</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Details de la commande</h2>
          <p className="text-neutral-400">
            Numero de commande :
            <span className="ml-2 rounded bg-dark-800 px-2 py-1 font-mono text-white">{order._id}</span>
          </p>
        </div>
        <Link to={backLink}>
          <Button variant="outline">Retour au tableau de bord</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-dark-700 bg-dark-800/50">
          <CardHeader>
            <CardTitle>{order.service?.title || 'Service indisponible'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-dark-700 bg-dark-900/70 p-4">
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Statut</p>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="rounded-xl border border-dark-700 bg-dark-900/70 p-4">
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Paiement</p>
                <p className="text-white font-medium">{order.paymentStatus || 'Non renseigne'}</p>
              </div>
              <div className="rounded-xl border border-dark-700 bg-dark-900/70 p-4">
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Montant</p>
                <p className="text-white font-medium">{order.amount} €</p>
              </div>
              <div className="rounded-xl border border-dark-700 bg-dark-900/70 p-4">
                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Creee le</p>
                <p className="text-white font-medium">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="rounded-xl border border-dark-700 bg-dark-900/70 p-5">
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Brief client</p>
              <p className="whitespace-pre-wrap text-neutral-200 leading-relaxed">{order.brief}</p>
            </div>

            <div className="rounded-xl border border-dark-700 bg-dark-900/70 p-5">
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Pieces jointes</p>
              {order.attachments?.length ? (
                <div className="grid gap-3">
                  {order.attachments.map((filePath) => (
                    <a
                      key={filePath}
                      href={getUploadUrl(filePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-lg border border-dark-700 bg-dark-800 px-4 py-3 text-sm text-neutral-200 transition-colors hover:border-accent/40 hover:text-white"
                    >
                      <span className="truncate pr-4">{formatFileLabel(filePath)}</span>
                      <span className="text-accent">Ouvrir</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400 text-sm">Aucune piece jointe sur cette commande.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-dark-700 bg-dark-800/50">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Client</p>
              <p className="text-white font-medium">{order.client?.name || user?.name}</p>
              <p className="text-sm text-neutral-400">{order.client?.email || user?.email}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Service</p>
              <p className="text-white font-medium">{order.service?.title || 'Service indisponible'}</p>
              {order.service?.price !== undefined ? (
                <p className="text-sm text-neutral-400">Tarif catalogue : {order.service.price} €</p>
              ) : null}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Mise a jour</p>
              <p className="text-sm text-neutral-300">{new Date(order.updatedAt).toLocaleString()}</p>
            </div>

            <div className="rounded-xl border border-accent/20 bg-accent/10 p-4 text-sm text-neutral-200">
              Cette page affiche maintenant les donnees reelles de la commande et respecte les autorisations backend.
            </div>

            {!isPaid && Number(order.amount) > 0 && user?.role !== 'admin' ? (
              <Button className="w-full" isLoading={isRedirectingToCheckout} onClick={handlePayNow}>
                Payer avec Stripe
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetails;
