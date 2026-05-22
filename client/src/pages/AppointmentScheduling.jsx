import React, { useState, useContext } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Modal } from '../components/shared';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentsContext';

export default function AppointmentScheduling() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addAppointment, updateAppointment } = useAppointments();
  
  const specialist = location.state?.specialist || {
    name: 'Dr. Emily Martinez',
    specialty: 'Allergist',
    hospital: 'City General Hospital',
    city: 'Default City',
    _id: 'dummy_id' // Will fail if actually used, but good for fallback UI
  };

  const initials = specialist.name ? specialist.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'DR';

  const [selectedDate, setSelectedDate] = useState('25-04-2026');
  const [selectedTime, setSelectedTime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
  ];
  const unavailableSlots = ['10:00 AM', '01:00 PM']; // Grayed out

  const handleConfirm = async () => {
    const patientId = user?._id || user?.id;
    if (!patientId) {
      alert("Please log in to book an appointment");
      return;
    }
    if (!specialist._id || specialist._id === 'dummy_id') {
      alert("Invalid specialist selected. Please go back and select a real specialist.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Parse date 'DD-MM-YYYY' and time 'HH:MM AM/PM'
      const [day, month, year] = selectedDate.split('-');
      const timeMatch = selectedTime.match(/(\d+):(\d+) (AM|PM)/);
      let hours = parseInt(timeMatch[1]);
      if (timeMatch[3] === 'PM' && hours < 12) hours += 12;
      if (timeMatch[3] === 'AM' && hours === 12) hours = 0;
      
      const dateObj = new Date(year, month - 1, day, hours, parseInt(timeMatch[2]));

      const payload = {
        patientId,
        specialistId: specialist._id,
        date: dateObj
      };

      if (location.state?.appointmentId) {
        await updateAppointment(location.state.appointmentId, payload);
      } else {
        await addAppointment(payload);
      }
      
      setShowModal(true);
    } catch (err) {
      console.error('Failed to book/reschedule appointment', err);
      alert('Failed to book/reschedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-[#1C2B3A]">
          {location.state?.appointmentId ? 'Reschedule Appointment' : 'Schedule Appointment'}
        </h1>
        <p className="text-sm text-[#7A8FA6] mt-1">Choose your preferred date and time</p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Specialist Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#1C2B3A] mb-4">Selected Specialist</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00C896] rounded-full flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
            <div>
              <p className="font-medium text-[#1C2B3A]">{specialist.name}</p>
              <p className="text-sm text-[#7A8FA6]">{specialist.specialty}</p>
              <p className="text-xs text-[#7A8FA6]">{specialist.hospital}{specialist.city ? `, ${specialist.city}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Select Date Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#1C2B3A] mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-[#1A6FB5]" /> Select Date
          </h2>
          <input 
            type="text" 
            className="w-full p-3 rounded-lg border border-[#E2E8F0] text-sm text-[#1C2B3A] focus:outline-none focus:border-[#1A6FB5]"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Select Time Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#1C2B3A] mb-4 flex items-center gap-2">
            <Clock size={18} className="text-[#1A6FB5]" /> Available Time Slots
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {timeSlots.map(time => {
              const isUnavailable = unavailableSlots.includes(time);
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  disabled={isUnavailable}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-lg text-sm border transition-colors ${
                    isUnavailable 
                      ? 'bg-[#F8FAFC] border-transparent text-[#CBD5E1] cursor-not-allowed'
                      : isSelected
                        ? 'bg-[#1A6FB5] border-[#1A6FB5] text-white'
                        : 'bg-white border-[#E2E8F0] text-[#1C2B3A] hover:border-[#1A6FB5]'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#7A8FA6]">* Grayed out slots are unavailable</p>
        </div>
      </div>

      <button 
        onClick={handleConfirm}
        disabled={!selectedTime || isSubmitting}
        className={`w-full py-4 rounded-full font-medium text-white transition-colors ${
          (!selectedTime || isSubmitting) ? 'bg-[#A7E9D6] cursor-not-allowed' : 'bg-[#00C896] hover:bg-[#00B386]'
        }`}
      >
        {isSubmitting ? 'Confirming...' : (location.state?.appointmentId ? 'Confirm Reschedule' : 'Confirm Booking')}
      </button>

      <Modal isOpen={showModal} onClose={() => navigate('/appointments')} title="Success">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#00C896] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <p className="font-medium text-[#1C2B3A] text-lg mb-2">
            Your appointment with {specialist.name} has been {location.state?.appointmentId ? 'rescheduled' : 'confirmed'}.
          </p>
          
          <div className="bg-[#EEF2F6] p-4 rounded-xl mt-4 text-left">
            <h4 className="font-semibold text-[#1C2B3A] mb-2 text-sm">Travel Insights</h4>
            <p className="text-sm text-[#4A5568] flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1A6FB5]"></span>
              Distance: ~15 km from your registered address
            </p>
            <p className="text-sm text-[#4A5568] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C896]"></span>
              Estimated travel time: 30-45 mins
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => navigate('/travel', { state: { destination: specialist } })} 
            className="w-full py-3 bg-[#1A6FB5] text-white rounded-xl font-medium hover:bg-[#155A94] transition-colors"
          >
            Plan Travel & Accommodation
          </button>
          <button 
            onClick={() => navigate('/appointments')} 
            className="w-full py-3 bg-white text-[#1C2B3A] border border-[#E2E8F0] rounded-xl font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            Go to My Appointments
          </button>
        </div>
      </Modal>
    </div>
  );
}
