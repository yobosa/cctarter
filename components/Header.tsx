
import React from 'react';

interface HeaderProps {
  onNavigate: (view: 'explore' | 'discover' | 'collection') => void;
  activeView: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activeView }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 glass border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('explore')}>
        <div className="w-10 h-10 flex items-center justify-center relative">
          <div className="absolute w-7 h-7 border-[3px] border-teal-400 rounded-full -translate-x-1.5 opacity-80"></div>
          <div className="absolute w-7 h-7 border-[3px] border-teal-400 rounded-full translate-x-1.5 opacity-80"></div>
        </div>
        <span className="serif text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          CCLO
        </span>
      </div>
      
      <nav className="flex gap-8">
        {[
          { id: 'explore', label: 'Explore Map', icon: 'fa-earth-americas' },
          { id: 'discover', label: 'Memberships', icon: 'fa-map-pin' },
          { id: 'collection', label: 'Vault', icon: 'fa-box-archive' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as any)}
            className={`flex items-center gap-2 transition-all duration-300 hover:text-amber-300 text-sm uppercase tracking-widest font-semibold ${
              activeView === item.id ? 'text-amber-400' : 'text-gray-400'
            }`}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex gap-4">
        <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
          <i className="fa-solid fa-user text-sm"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
