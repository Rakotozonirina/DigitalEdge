import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { useAuth } from '../context/AuthContext';
import { api, getAuthConfig, getUploadUrl } from '../utils/api';

const initialFormState = {
  title: '',
  description: '',
  price: '',
  features: '',
};

const AdminServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedImage(null);
    setEditingServiceId('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleEdit = (service) => {
    setEditingServiceId(service._id);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      price: service.price ?? '',
      features: service.features?.join(', ') || '',
    });
    setSelectedImage(null);
    setSuccessMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Delete this service from the catalog?')) {
      return;
    }

    setError('');
    setSuccessMessage('');

    try {
      await api.delete(`/services/${serviceId}`, getAuthConfig(user?.token));
      setServices((current) => current.filter((service) => service._id !== serviceId));

      if (editingServiceId === serviceId) {
        resetForm();
      }

      setSuccessMessage('Service deleted successfully.');
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete this service.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      payload.append('features', formData.features);

      if (selectedImage) {
        payload.append('image', selectedImage);
      }

      const config = getAuthConfig(user?.token);

      if (editingServiceId) {
        const { data } = await api.put(`/services/${editingServiceId}`, payload, config);
        setServices((current) =>
          current.map((service) => (service._id === editingServiceId ? data : service)),
        );
        setSuccessMessage('Service updated successfully.');
      } else {
        const { data } = await api.post('/services', payload, config);
        setServices((current) => [data, ...current]);
        setSuccessMessage('Service created successfully.');
      }

      resetForm();
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save this service.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-dark-700 pb-8 gap-4">
        <div>
          <span className="text-accent font-bold tracking-wider uppercase text-sm mb-2 block">Catalog Admin</span>
          <h2 className="text-3xl font-bold text-white mb-1">Manage Services</h2>
          <p className="text-neutral-400">Create, edit, and remove catalog entries without leaving the admin area.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin">
            <Button variant="ghost">Back to Orders</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-dark-700 bg-dark-800/50">
          <CardHeader>
            <CardTitle>{editingServiceId ? 'Edit Service' : 'New Service'}</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}
            {successMessage ? (
              <div className="mb-5 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {successMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                  className="w-full rounded-md border border-dark-700 bg-dark-800 px-4 py-3 text-sm text-white transition-colors placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} required />
                </div>

                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="features">Features</Label>
                <Input
                  id="features"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  placeholder="Logo vectoriel, 3 revisions, fichiers source"
                />
                <p className="mt-2 text-xs text-neutral-500">Separate features with commas. The backend will store them as an array.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" isLoading={saving} className="sm:flex-1">
                  {editingServiceId ? 'Update Service' : 'Create Service'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm} className="sm:flex-1">
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-dark-700 bg-dark-800/50">
          <CardHeader>
            <CardTitle>Catalog Services</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-28 rounded-xl bg-dark-800 animate-pulse" />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-xl border border-dark-700 bg-dark-900/50 p-8 text-center text-neutral-400">
                No services yet. Use the form to create the first catalog item.
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service._id}
                    className="rounded-2xl border border-dark-700 bg-dark-900/60 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="h-24 w-full overflow-hidden rounded-xl border border-dark-700 bg-dark-800 sm:w-32">
                        {service.image ? (
                          <img
                            src={getUploadUrl(service.image)}
                            alt={service.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-neutral-500">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                            <p className="mt-2 text-sm text-neutral-400">{service.description}</p>
                          </div>
                          <div className="text-left md:text-right">
                            <div className="text-lg font-bold text-accent">{service.price} €</div>
                            <div className="mt-1 text-xs text-neutral-500">
                              Updated {new Date(service.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {service.features?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {service.features.map((feature) => (
                              <span
                                key={`${service._id}-${feature}`}
                                className="rounded-full border border-dark-700 bg-dark-800 px-3 py-1 text-xs text-neutral-300"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                          <Button variant="outline" onClick={() => handleEdit(service)} className="sm:flex-1">
                            Edit
                          </Button>
                          <Button variant="ghost" onClick={() => handleDelete(service._id)} className="sm:flex-1">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminServices;
