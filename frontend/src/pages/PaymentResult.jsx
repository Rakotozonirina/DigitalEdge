import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api, getAuthConfig } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PaymentResult = ({ mode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(mode === 'success');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    mode === 'success'
      ? 'Verification du paiement en cours...'
      : 'Le paiement a ete annule. Vous pouvez reprendre quand vous voulez.'
  );

  const orderId = searchParams.get('order');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (mode !== 'success' || !orderId || !sessionId || !user?.token) {
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        const { data } = await api.post(
          `/orders/${orderId}/confirm-payment`,
          { sessionId },
          getAuthConfig(user.token)
        );

        if (data.paymentStatus === 'paid') {
          setMessage('Paiement Stripe confirme. Votre commande est maintenant marquee comme payee.');
        } else {
          setMessage('La session Stripe est valide, mais le paiement est encore en attente.');
        }
      } catch (confirmError) {
        setError(confirmError.response?.data?.message || 'Impossible de confirmer le paiement.');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [mode, orderId, sessionId, user]);

  return (
    <div className="min-h-[calc(100vh-64px)] pt-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Card className="border-dark-700 bg-dark-800/50">
        <CardHeader className="text-center">
          <CardTitle>{mode === 'success' ? 'Paiement Stripe' : 'Paiement annule'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-neutral-300">{loading ? 'Un instant...' : message}</p>
          {error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {orderId ? (
              <Link to={`/order/${orderId}`}>
                <Button className="w-full sm:w-auto">Voir la commande</Button>
              </Link>
            ) : null}
            <Link to="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto">Retour au tableau de bord</Button>
            </Link>
            {mode === 'cancel' && orderId ? (
              <Button variant="ghost" className="w-full sm:w-auto" onClick={() => navigate(`/order/${orderId}`)}>
                Revenir sans payer
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentResult;
