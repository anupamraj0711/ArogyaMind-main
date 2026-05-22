import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, FileText, Calendar, Map, Lightbulb, User, LogOut, ChevronLeft, Bell } from 'lucide-react';
import Chatbot from './Chatbot';

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if(logout) logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: <Home size={20} /> },
    { path: '/symptoms', label: 'Submit Symptoms', icon: <FileText size={20} /> },
    { path: '/appointments', label: 'My Appointments', icon: <Calendar size={20} /> },
    { path: '/travel', label: 'Travel Assistance', icon: <Map size={20} /> },
    { path: '/specialists', label: 'AI Recommendations', icon: <Lightbulb size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
  ];

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex h-screen bg-[#F4F7FB] font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 hidden md:flex">
        <div className="h-20 flex items-center justify-between px-6 border-b border-transparent">
          <h1 className="text-[#1A6FB5] font-semibold text-xl">HealthCare AI</h1>
          <button className="text-[#7A8FA6] hover:text-[#1A6FB5]">
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-[#1A6FB5] text-white' 
                    : 'text-[#7A8FA6] hover:bg-[#F4F7FB] hover:text-[#1A6FB5]'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-24 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-2xl font-normal text-[#1C2B3A]">Welcome back, {user?.name || 'Sarah Johnson'}</h2>
            <p className="text-[#7A8FA6] text-sm mt-1">Here's what's happening with your health today</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer text-[#7A8FA6] hover:text-[#1A6FB5]">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-[#E84040] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-[#00C896] text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            
            <button onClick={handleLogout} className="flex items-center gap-2 text-[#7A8FA6] hover:text-[#1C2B3A] transition-colors text-sm font-medium">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>

      {/* Global Floating Chatbot */}
      <Chatbot />
    </div>
  );
}
