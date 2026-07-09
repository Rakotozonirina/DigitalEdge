import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-light-700 dark:border-dark-700 bg-light-900 dark:bg-dark-900 py-12 mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-neutral-400">
        <p>&copy; {new Date().getFullYear()} DigitalEdge Agency. Tous droits réservés.</p>
        <p className="text-sm mt-2">Votre partenaire design premium.</p>
      </div>
    </footer>
  );
};

export default Footer;
