import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Bell, Stethoscope } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const currentPath = location.pathname;

  const navLinks = isAuthenticated
    ? [] // Dashboard layouts handle their own navigation via sidebars
    : [
        { name: 'Find doctors', path: '/doctors' },
        { name: 'How it works', path: '#how-it-works' },
        { name: 'About', path: '#about' },
      ];

  if (
    isAuthenticated || 
    currentPath === '/' || 
    currentPath === '/login' || 
    currentPath === '/register'
  ) {
    return null;
  }

  return (
    <nav className="bg-primary-600 border-b border-primary-700 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center space-x-2 text-white hover:opacity-90 transition">
              <Stethoscope className="h-7 w-7" />
              <div className="flex flex-col">
                <span className="text-white text-[16px] font-bold leading-tight">ASISHCARE</span>
                <span className="text-[#2c8a52] text-[11px] font-bold uppercase tracking-wider leading-none">Consulting</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-2 bg-primary-700/50 p-1.5 rounded-full backdrop-blur-sm">
              {navLinks.map((link) => {
                const isActive = currentPath.startsWith(link.path) && link.path !== '/';
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition duration-200 ${
                      isActive 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-primary-100 hover:text-white hover:bg-primary-500'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Auth Controls */}
          <div className="hidden md:flex items-center space-x-4 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <button className="text-primary-100 hover:text-white transition relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-primary-600"></span>
                </button>
                <Link
                  to="/profile"
                  className="flex items-center"
                >
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-400 hover:ring-white transition"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary-600 font-bold tracking-wider hover:bg-primary-50 transition shadow-sm">
                      {user.name.charAt(0).toUpperCase()}{user.name.split(' ')[1]?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:bg-primary-700 border border-primary-500 text-sm font-bold px-6 py-2.5 rounded-full transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-primary-50 text-sm font-bold px-6 py-2.5 rounded-full transition shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-dark-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-dark-800 bg-dark-900 px-4 pt-4 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = currentPath.startsWith(link.path) && link.path !== '/';
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition ${
                  isActive ? 'bg-primary-50 text-primary-800' : 'text-dark-200 hover:bg-dark-800 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          {isAuthenticated ? (
            <div className="pt-6 border-t border-dark-800 mt-4 space-y-3">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-2"
              >
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-xs text-dark-400 capitalize">{user.role}</div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-rose-500 hover:bg-dark-800 rounded-xl transition"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-6 border-t border-dark-800 mt-4 flex flex-col space-y-3">
              <button
                onClick={() => { setMobileMenuOpen(false); document.querySelector('input[type="email"]')?.focus(); }}
                className="w-full text-center px-4 py-3 border border-dark-700 rounded-xl text-white hover:bg-dark-800 transition font-medium"
              >
                Log in
              </button>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-3 border border-dark-700 rounded-xl text-white hover:bg-dark-800 transition font-medium"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
