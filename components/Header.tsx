import React from 'react';
// FIX: Changed import for User to '@supabase/auth-js' to resolve module export errors.
import type { User } from '@supabase/auth-js';

type View = 'personal' | 'explore';

interface HeaderProps {
    user: User | null;
    onSignOut: () => void;
    currentView: View;
    setCurrentView: (view: View) => void;
}

const Logo = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="#333"/>
        <text x="50%" y="53%" dominantBaseline="middle" textAnchor="middle" fontFamily="Lato, sans-serif" fontSize="16" fontWeight="bold" fill="white">
            AVI
        </text>
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ user, onSignOut, currentView, setCurrentView }) => {
  
  const navButtonStyle = "pb-1 border-b-2 transition-colors duration-200";
  const activeStyle = "border-archive-teal text-archive-teal";
  const inactiveStyle = "border-transparent text-gray-600 hover:text-archive-teal";

  return (
    <header className="w-full py-6 px-4 bg-[#fdfbf7] border-b border-gray-300">
      <div className="container mx-auto flex justify-between items-center max-w-6xl">
        <div className="flex items-center gap-4">
          <Logo />
          <div>
            <h1 className="text-3xl font-bold font-garamond text-[#333]">AVI</h1>
            <p className="font-lato text-gray-600 mt-0">Archive Virtual Intellect</p>
          </div>
        </div>
        {user && (
           <div className="flex items-center gap-6 font-lato">
              <nav className="flex gap-6 text-lg">
                <button 
                  onClick={() => setCurrentView('personal')}
                  className={`${navButtonStyle} ${currentView === 'personal' ? activeStyle : inactiveStyle}`}
                >
                  Mi Banco
                </button>
                <button
                  onClick={() => setCurrentView('explore')}
                  className={`${navButtonStyle} ${currentView === 'explore' ? activeStyle : inactiveStyle}`}
                >
                  Explorar
                </button>
              </nav>
              <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
                <span className="text-gray-700 text-sm hidden sm:inline">{user.email}</span>
                <button
                  onClick={onSignOut}
                  className="bg-archive-teal text-white font-bold py-2 px-4 hover:bg-archive-teal-dark transition duration-150 ease-in-out text-sm"
                >
                  Cerrar sesión
                </button>
              </div>
           </div>
        )}
      </div>
    </header>
  );
};
