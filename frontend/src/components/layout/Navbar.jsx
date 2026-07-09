import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="fixed w-full z-50 top-0 border-b border-light-700 dark:border-dark-700 bg-light-900/80 dark:bg-dark-900/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 relative group">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center font-bold text-white transition-transform group-hover:scale-105">
              D
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-accent transition-colors">DigitalEdge.</span>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-700 dark:text-neutral-300 hover:text-accent transition-colors font-medium">Accueil</Link>
            <Link to="/catalogue" className="text-gray-700 dark:text-neutral-300 hover:text-accent transition-colors font-medium">Services</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-light-700 dark:hover:bg-dark-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-neutral-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-neutral-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            {user ? (
              <>
                <Link to={user.role === 'admin' ? "/admin" : "/dashboard"}>
                  <span className="text-sm font-medium mr-4 hidden sm:inline-block hover:text-accent transition-colors text-gray-700 dark:text-neutral-300">
                    {user.role === 'admin' ? 'Espace Admin' : 'Mon Espace'}
                  </span>
                </Link>
                <div className="w-8 h-8 rounded-full bg-light-700 dark:bg-dark-700 border border-light-700 dark:border-dark-600 flex items-center justify-center text-accent font-bold uppercase cursor-pointer relative group" title="Déconnexion">
                  {user.name.charAt(0)}
                  <div className="absolute top-10 right-0 invisible group-hover:visible bg-light-800 dark:bg-dark-800 border border-light-700 dark:border-dark-700 rounded-md shadow-lg p-2 flex flex-col w-32">
                     <button onClick={logout} className="text-sm text-left text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white px-2 py-1 hover:bg-light-700 dark:hover:bg-dark-700 rounded transition-colors">
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
