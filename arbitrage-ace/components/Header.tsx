
import React from 'react';
import type { View } from '../types';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const navItems: { id: View; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'performance', label: 'Performance' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-cyan-400">Arbitrage Ace</span>
          </div>
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-cyan-500 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
       <nav className="md:hidden flex justify-around p-2 bg-gray-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex-1 text-center py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                currentView === item.id
                  ? 'bg-cyan-500 text-white'
                  : 'text-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
    </header>
  );
};

export default Header;
   