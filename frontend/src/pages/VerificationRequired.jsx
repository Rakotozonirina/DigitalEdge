import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Mail, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api, getAuthConfig } from '../utils/api';

const VerificationRequired = () => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname;
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isVerified) {
    return <Navigate to={fromPath || '/dashboard'} replace />;
  }

  const handleResendEmail = async () => {
    setIsSending(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { data } = await api.post('/auth/resend-verification', {}, getAuthConfig(user.token));
      setSuccessMessage(data.message || 'Un nouvel email de verification a ete envoye.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "L'email de verification n'a pas pu etre renvoye.");
    } finally {
      setIsSending(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    setSuccessMessage('');
    setErrorMessage('');

    const result = await refreshUser();

    if (!result.success) {
      setErrorMessage(result.message);
    } else if (!result.user?.isVerified) {
      setErrorMessage("Votre email n'est pas encore verifie.");
    }

    setIsRefreshing(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 pb-16 pt-24">
      <div className="mx-auto max-w-2xl">
        <Card hoverEffect={false} className="border-dark-700 bg-dark-800/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <ShieldAlert size={28} />
            </div>
            <CardTitle>Verification d&apos;email requise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center text-neutral-300">
            <p>
              Votre compte est bien connecte, mais vous devez verifier votre adresse email avant de pouvoir confirmer une commande.
            </p>
            <div className="rounded-xl border border-dark-700 bg-dark-900/70 p-5">
              <div className="mb-2 flex items-center justify-center gap-2 text-sm uppercase tracking-wide text-neutral-500">
                <Mail size={16} />
                Email du compte
              </div>
              <p className="font-medium text-white">{user.email}</p>
            </div>
            <p className="text-sm text-neutral-400">
              Ouvrez le message de verification recu par email, puis revenez ici une fois la verification terminee.
            </p>
            {successMessage ? (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {successMessage}
              </div>
            ) : null}
            {errorMessage ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            ) : null}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" className="w-full sm:w-auto" isLoading={isSending} onClick={handleResendEmail}>
                Renvoyer l&apos;email
              </Button>
              <Button variant="ghost" className="w-full sm:w-auto" isLoading={isRefreshing} onClick={handleRefreshStatus}>
                J&apos;ai verifie mon email
              </Button>
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full sm:w-auto">
                  Retour au tableau de bord
                </Button>
              </Link>
              <Link to="/catalogue">
                <Button className="w-full sm:w-auto">
                  Revenir aux services
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerificationRequired;
