import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, PenTool, Image as ImageIcon, Monitor } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api, getUploadUrl } from '../utils/api';

const serviceIcons = [Palette, PenTool, ImageIcon, Monitor];

const Catalog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get('/services');
        setServices(data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Impossible de charger les services.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleOrder = (service) => {
    if (!user) {
      navigate('/login');
      return;
    }

    navigate(`/booking?service=${service._id}`, { state: { service } });
  };

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Notre Catalogue de Services
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-neutral-400 mx-auto">
          Selectionnez le service graphique qui correspond a vos besoins et demarrons votre projet.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[360px] rounded-xl border border-dark-700 bg-dark-800/40 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
          {error}
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-xl border border-dark-700 bg-dark-800/40 p-10 text-center text-neutral-400">
          Aucun service n&apos;est disponible pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = serviceIcons[index % serviceIcons.length];

            return (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Card hoverEffect className="h-full flex flex-col items-start text-left border-dark-700 bg-dark-800/40">
                  {service.image ? (
                    <img
                      src={getUploadUrl(service.image)}
                      alt={service.title}
                      className="h-44 w-full object-cover"
                    />
                  ) : null}
                  <CardHeader className="w-full">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent mb-4">
                      <Icon size={24} />
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 w-full">
                    <p className="text-neutral-400 text-sm mb-4">{service.description}</p>
                    {service.features?.length ? (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {service.features.slice(0, 3).map((feature) => (
                          <span
                            key={`${service._id}-${feature}`}
                            className="rounded-full border border-dark-700 bg-dark-900 px-3 py-1 text-xs text-neutral-300"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-auto">
                      <span className="text-3xl font-bold text-white">{service.price} €</span>
                    </div>
                  </CardContent>
                  <CardFooter className="w-full">
                    <Button className="w-full" onClick={() => handleOrder(service)}>
                      Commander
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;
