import React from 'react';

/**
 * StatusBadge Component
 * @param {{ status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' }} props
 */
export const StatusBadge = ({ status }) => {
  const colors = {
    Scheduled: 'bg-[#1A6FB5] text-white',
    Confirmed: 'bg-[#00C896] text-white',
    Completed: 'bg-[#E2E8F0] text-[#7A8FA6]',
    Cancelled: 'bg-[#E84040] text-white',
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[status] || colors.Scheduled}`}>
      {status}
    </span>
  );
};

/**
 * Toast Component
 * @param {{ message: string, type: 'error' | 'success' | 'info', onClose: () => void }} props
 */
export const Toast = ({ message, type = 'error', onClose }) => {
  if (!message) return null;
  const bg = type === 'error' ? 'bg-[#E84040]' : type === 'success' ? 'bg-[#00C896]' : 'bg-[#1A6FB5]';
  return (
    <div className={`fixed bottom-4 right-4 ${bg} text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-between min-w-[300px] z-50`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold hover:text-gray-200">×</button>
    </div>
  );
};

/**
 * Modal Component
 * @param {{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }} props
 */
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#1C2B3A]/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className={`bg-[#FFFFFF] rounded-xl shadow-md w-full ${maxWidth} overflow-hidden max-h-[90vh] flex flex-col`}>
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <h2 className="font-bold text-[#1C2B3A]">{title}</h2>
          <button onClick={onClose} className="text-[#7A8FA6] hover:text-[#1C2B3A] text-xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * SpecialistCard Component
 * @param {{ name: string, specialization: string, hospital: string, rating: number, available: boolean, matchScore: number, onBook: () => void }} props
 */
export const SpecialistCard = ({ name, specialty, hospital, city, experience_years, rating, consultation_fee, available_timings, online_available, onBook }) => {
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'DR';
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#1A6FB5]/10 text-[#1A6FB5] flex items-center justify-center text-xl font-bold mb-4">
        {initials}
      </div>
      <h3 className="font-bold text-[#1C2B3A]">{name}</h3>
      <p className="text-sm text-[#7A8FA6] mb-1">{specialty}</p>
      <p className="text-sm text-[#1C2B3A] mb-1">{hospital}, {city}</p>
      
      <div className="flex text-[#1A6FB5] mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>{i < Math.floor(rating || 0) ? '★' : '☆'}</span>
        ))}
        <span className="text-xs text-[#7A8FA6] ml-2 mt-1">({rating})</span>
      </div>

      <div className="text-xs text-[#7A8FA6] mb-4 space-y-1">
        <p>{experience_years} years experience</p>
        <p>Consultation: ₹{consultation_fee}</p>
        <p>{available_timings}</p>
      </div>
      
      <div className="flex gap-2 mb-6">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${online_available ? 'bg-[#00C896]/10 text-[#00C896]' : 'bg-[#E2E8F0] text-[#7A8FA6]'}`}>
          {online_available ? 'Online Available' : 'Offline Only'}
        </span>
      </div>
      
      <button onClick={onBook} className="w-full py-3 rounded-full font-medium text-white bg-[#00C896] hover:bg-[#00B386] transition-colors mt-auto">
        Book Appointment
      </button>
    </div>
  );
};

/**
 * LoadingSpinner Component
 * @param {{ text?: string }} props
 */
export const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#1A6FB5] rounded-full animate-spin mb-4"></div>
      <p className="text-[#7A8FA6] font-medium">{text}</p>
    </div>
  );
};

/**
 * EmptyState Component
 * @param {{ message: string }} props
 */
export const EmptyState = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-[#F4F7FB] rounded-full flex items-center justify-center mb-4 text-3xl">
        📭
      </div>
      <p className="text-[#7A8FA6]">{message}</p>
    </div>
  );
};
