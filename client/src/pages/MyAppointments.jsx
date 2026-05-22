import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { StatusBadge, LoadingSpinner, EmptyState } from '../components/shared';
import api from '../api';
import { Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyAppointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Added useNavigate

  const fetchAppointments = () => {
    const patientId = user?._id || user?.id;
    if (patientId) {
      setLoading(true);
      api.get(`/appointments/${patientId}`)
        .then(res => {
          setAppointments(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await api.put(`/appointments/${id}`, { status: 'Cancelled' });
        fetchAppointments(); // Refresh the list
      } catch (err) {
        console.error("Failed to cancel appointment", err);
        alert("Failed to cancel appointment. Please try again.");
      }
    }
  };

  const handleReschedule = (appt) => {
    // Navigate to scheduling page, pass the appointment details to reschedule
    navigate('/schedule-appointment', { 
      state: { 
        specialist: {
           ...appt.specialist,
           name: appt.specialist?.user?.name || appt.specialist?.doctor_id || 'Doctor',
        },
        appointmentId: appt._id 
      } 
    });
  };

  if (loading) {
    return <div className="mt-12"><LoadingSpinner text="Loading your appointments..." /></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-[#1C2B3A]">My Appointments</h1>
        <p className="text-sm text-[#7A8FA6] mt-1">View and manage your upcoming and past appointments</p>
      </div>

      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appt) => {
            const dateObj = new Date(appt.date);
            const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            
            // Handle populated specialist or just ID fallback
            const specName = appt.specialist?.user?.name || appt.specialist?.doctor_id || 'Doctor';
            const specType = appt.specialist?.specialty || 'Specialist';
            const location = appt.specialist?.hospital ? `${appt.specialist.hospital}, ${appt.specialist.city}` : 'Online / TBD';
            
            const initials = specName.substring(0, 2).toUpperCase();

            return (
              <div key={appt._id} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#00C896] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1C2B3A]">{specName}</h3>
                        <p className="text-sm text-[#7A8FA6]">{specType}</p>
                      </div>
                    </div>
                    <StatusBadge status={appt.status || 'Scheduled'} />
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-3 text-sm text-[#4A5568]">
                      <Calendar size={16} className="text-[#1A6FB5]" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#4A5568]">
                      <Clock size={16} className="text-[#1A6FB5]" />
                      <span>{timeStr}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#4A5568]">
                      <MapPin size={16} className="text-[#1A6FB5]" />
                      <span>{location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => handleReschedule(appt)}
                    disabled={appt.status === 'Cancelled' || appt.status === 'Completed'}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      appt.status === 'Cancelled' || appt.status === 'Completed'
                        ? 'text-[#CBD5E1] bg-[#F8FAFC] cursor-not-allowed border border-transparent'
                        : 'text-[#1A6FB5] bg-[#F4F7FB] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    Reschedule
                  </button>
                  <button 
                    onClick={() => handleCancel(appt._id)}
                    disabled={appt.status === 'Cancelled' || appt.status === 'Completed'}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      appt.status === 'Cancelled' || appt.status === 'Completed'
                        ? 'text-[#CBD5E1] bg-[#F8FAFC] cursor-not-allowed border border-transparent'
                        : 'text-[#E84040] bg-[#FFF0F0] hover:bg-[#FFE4E4]'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          message="You have no appointments booked yet." 
          action={{ label: "Find a Specialist", onClick: () => window.location.href = '/specialists' }}
        />
      )}
    </div>
  );
}
