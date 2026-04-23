import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed w-full z-50 top-0 border-b border-dark-700 bg-dark-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 relative group">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center font-bold text-white transition-transform group-hover:scale-105">
              D
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-accent transition-colors">DigitalEdge.</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-neutral-300 hover:text-accent transition-colors font-medium">Accueil</Link>
            <Link to="/catalogue" className="text-neutral-300 hover:text-accent transition-colors font-medium">Services</Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? "/admin" : "/dashboard"}>
                  <span className="text-sm font-medium mr-4 hidden sm:inline-block hover:text-accent transition-colors">
                    {user.role === 'admin' ? 'Espace Admin' : 'Mon Espace'}
                  </span>
                </Link>
                <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-accent font-bold uppercase cursor-pointer relative group" title="Déconnexion">
                  {user.name.charAt(0)}
                  <div className="absolute top-10 right-0 invisible group-hover:visible bg-dark-800 border border-dark-700 rounded-md shadow-lg p-2 flex flex-col w-32">
                     <button onClick={logout} className="text-sm text-left text-neutral-300 hover:text-white px-2 py-1 hover:bg-dark-700 rounded">
                       Déconnexion
                     </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Créer un compte</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
