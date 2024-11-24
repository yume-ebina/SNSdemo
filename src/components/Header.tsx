import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, LogOut, Home, List } from 'lucide-react';
import type { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const location = useLocation();

  return (
    <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-gray-900">KUDOS!</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-gray-600 hover:text-blue-500 flex items-center space-x-1 ${
                location.pathname === '/' ? 'text-blue-500' : ''
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-sm font-medium">ホーム</span>
            </Link>
            <Link 
              to="/list" 
              className={`text-gray-600 hover:text-blue-500 flex items-center space-x-1 ${
                location.pathname === '/list' ? 'text-blue-500' : ''
              }`}
            >
              <List className="w-6 h-6" />
              <span className="text-sm font-medium">リスト</span>
            </Link>
            <Link 
              to="/profile" 
              className={`text-gray-600 hover:text-blue-500 flex items-center space-x-1 ${
                location.pathname === '/profile' ? 'text-blue-500' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              </div>
              <span className="text-sm font-medium">プロフィール</span>
            </Link>
            <button 
              onClick={onLogout}
              className="text-gray-600 hover:text-blue-500 flex items-center space-x-1"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-sm font-medium">ログアウト</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}