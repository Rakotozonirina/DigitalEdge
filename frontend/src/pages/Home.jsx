import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-dark-900 to-dark-900"></div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <span className="text-accent font-bold tracking-wider uppercase text-sm mb-4 block">Agence de Design Premium</span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8">
            Donnez vie à vos idées avec un <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink-500">Design d'Exception</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl leading-8 text-neutral-300 mb-10 max-w-2xl mx-auto">
            De la création de logo au branding complet, notre équipe de designers experts transforme votre vision en réalité visuelle percutante. Réservez votre service en quelques clics.
          </p>
          <div className="flex items-center justify-center gap-x-6">
            <Link to="/catalogue">
              <Button size="lg" className="rounded-full px-8 shadow-accent/40 shadow-xl">Voir nos services</Button>
            </Link>
            <Link to="/register" className="text-sm font-semibold leading-6 text-white hover:text-accent transition-colors">
              Créer un compte <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Featured info or stats could go here */}
    </div>
  );
};

export default Home;
