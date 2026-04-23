import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? `/${user.role}` : '/'} className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <BookOpen className="w-6 h-6" />
            <span>Project Allocator</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.name} ({user.role})</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium text-sm transition-colors">Login</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-md shadow-indigo-200">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
