import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-dark-700 bg-dark-900 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 text-center text-neutral-400">
        <p>&copy; {new Date().getFullYear()} DigitalEdge Agency. Tous droits réservés.</p>
        <p className="text-sm mt-2">Votre partenaire design premium.</p>
      </div>
    </footer>
  );
};

export default Footer;
