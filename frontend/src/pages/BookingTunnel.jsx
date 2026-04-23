import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { useAuth } from '../context/AuthContext';
import { api, getAuthConfig } from '../utils/api';

const BookingTunnel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState(location.state?.service || null);
  const [brief, setBrief] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [loadingService, setLoadingService] = useState(!location.state?.service);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceId = params.get('service');

    if (selectedService || !serviceId) {
      setLoadingService(false);
      return;
    }

    const fetchService = async () => {
      try {
        const { data } = await api.get(`/services/${serviceId}`);
        setSelectedService(data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Impossible de charger le service selectionne.');
      } finally {
        setLoadingService(false);
      }
    };

    fetchService();
  }, [location.search, selectedService]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
      return;
    }

    if (!selectedService?._id) {
      setError('Aucun service valide selectionne.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('service', selectedService._id);
      formData.append('brief', brief);

      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const { data } = await api.post('/orders', formData, getAuthConfig(user?.token));

      if (data?.requiresPayment && data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      navigate(`/order/${data?.order?._id || ''}`);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'La commande n\'a pas pu etre envoyee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pt-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Commander : {loadingService ? 'Chargement...' : selectedService?.title || 'Service indisponible'}
        </h2>
        <div className="flex items-center justify-center gap-4 text-sm font-medium">
          <span className={`px-4 py-2 rounded-full transition-colors ${step >= 1 ? 'bg-accent/20 text-accent border border-accent/30' : 'text-neutral-500'}`}>
            1. Brief Creatif
          </span>
          <span className="text-neutral-600">------&gt;</span>
          <span className={`px-4 py-2 rounded-full transition-colors ${step >= 2 ? 'bg-accent/20 text-accent border border-accent/30' : 'text-neutral-500 border border-transparent'}`}>
            2. Confirmation
          </span>
        </div>
      </div>

      <Card hoverEffect={false} className="p-8 md:p-10">
        {error ? (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {loadingService ? (
          <div className="h-40 animate-pulse rounded-xl bg-dark-800" />
        ) : !selectedService ? (
          <div className="rounded-lg border border-dark-700 bg-dark-900 p-6 text-center text-neutral-400">
            Ce service n&apos;est plus disponible.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="mb-6">
                  <Label htmlFor="brief" className="text-lg mb-2">Decrivez votre besoin creatif</Label>
                  <p className="text-sm text-neutral-400 mb-4">
                    Parlez-nous de vos objectifs, de votre cible et de vos preferences. Plus il y a de details, mieux c&apos;est.
                  </p>
                  <textarea
                    id="brief"
                    rows="6"
                    className="w-full rounded-md border border-dark-700 bg-dark-900 px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-none placeholder:text-neutral-600"
                    placeholder="Bonjour, je souhaite moderniser l'image de ma boutique de fleurs..."
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-10">
                  <Label htmlFor="attachments">Fichiers d&apos;inspiration (Optionnel)</Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    className="pt-2 bg-dark-900 text-neutral-400"
                    onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                  />
                  <p className="text-xs text-neutral-500 mt-2">Formats acceptes: .png, .jpg, .pdf, .doc, .xlsx, .zip, .txt.</p>
                  {attachments.length ? (
                    <p className="mt-2 text-xs text-neutral-400">{attachments.length} fichier(s) selectionne(s)</p>
                  ) : null}
                </div>
                <div className="flex justify-end pt-4 border-t border-dark-700">
                  <Button type="submit" size="lg">Continuer vers le recapitulatif</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-xl font-semibold mb-6">Recapitulatif de la commande</h3>
                <div className="bg-dark-900 rounded-xl p-6 mb-8 border border-dark-700 space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-neutral-400">Service selectionne</span>
                    <span className="font-semibold text-white">{selectedService.title}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4 border-t border-dark-700 pt-4">
                    <span className="text-neutral-400">Brief</span>
                    <span className="max-w-md text-right text-sm text-neutral-300">{brief}</span>
                  </div>
                  <div className="flex justify-between border-t border-dark-700 pt-4 mt-4 text-xl font-bold">
                    <span className="text-white">Prix estimatif</span>
                    <span className="text-accent">{selectedService.price > 0 ? `${selectedService.price} €` : 'Sur devis'}</span>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-lg mb-8 text-sm leading-relaxed">
                  <span className="font-semibold block mb-1">Information importante</span>
                  En confirmant, votre projet sera enregistre puis redirige vers Stripe en mode test pour effectuer le paiement si ce service a un tarif.
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-dark-700">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>Retour</Button>
                  <Button type="submit" isLoading={isSubmitting} size="lg" className="shadow-lg shadow-accent/20">
                    Confirmer et payer
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        )}
      </Card>
    </div>
  );
};

export default BookingTunnel;
