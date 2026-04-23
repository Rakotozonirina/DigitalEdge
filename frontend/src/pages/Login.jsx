import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/catalogue');
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center pt-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Bienvenue</h2>
          <p className="text-neutral-400">Connectez-vous pour gérer vos commandes</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-8 shadow-xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="space-y-6 mb-8">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full mb-4" isLoading={isSubmitting}>
            Se connecter
          </Button>
          
          <p className="text-center text-neutral-400 text-sm">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover transition-colors font-medium">
              S'inscrire
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
