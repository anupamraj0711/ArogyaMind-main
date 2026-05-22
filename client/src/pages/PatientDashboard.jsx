import React, { useState, useContext, useEffect } from 'react';
import { StatusBadge } from '../components/shared';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/**
 * PatientDashboard Component
 * Represents SCREEN 2: Main dashboard for patients with sidebar and stats
 */
export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const [latestRecommendation, setLatestRecommendation] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (user?._id) {
      Promise.all([
        api.get(`/appointments/${user._id}`),
        api.get(`/symptoms/history/${user._id}`)
      ])
        .then(([apptsRes, symptomsRes]) => {
          const appts = apptsRes.data;
          const symptoms = symptomsRes.data;
          
          setAppointments(appts);
          
          // Find the closest upcoming appointment
          const now = new Date();
          const upcoming = appts
            .filter(appt => new Date(appt.date) > now && appt.status !== 'Cancelled')
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          
          if (upcoming.length > 0) {
            setUpcomingAppointment(upcoming[0]);
          }
          
          setPendingActionsCount(upcoming.length);

          if (symptoms.length > 0) {
            // Check if conditions array is available, or use a fallback
            const latestSym = symptoms[0];
            let topCondition = null;
            if (latestSym.aiAnalysis?.conditions?.length > 0) {
              topCondition = latestSym.aiAnalysis.conditions[0];
            } else if (latestSym.aiAnalysis?.rawResponse) {
               try {
                  const parsed = JSON.parse(latestSym.aiAnalysis.rawResponse);
                  if (parsed.conditions?.length > 0) {
                     topCondition = parsed.conditions[0];
                  }
               } catch (e) {}
            }
            
            if (topCondition) {
              setLatestRecommendation(topCondition);
            } else if (latestSym.aiAnalysis?.recommendedSpecialistType) {
              setLatestRecommendation({
                 name: `Consult ${latestSym.aiAnalysis.recommendedSpecialistType}`,
                 probability: 100
              });
            }
          }

          // Merge and sort for recent activity
          const formattedAppts = appts.map(appt => ({
            id: appt._id,
            date: new Date(appt.createdAt || appt.date),
            action: `${appt.specialist?.user?.name || appt.specialist?.doctor_id || 'Doctor'} Consultation`,
            status: appt.status || 'Scheduled',
            type: 'appointment'
          }));

          const formattedSymptoms = symptoms.map(sym => ({
            id: sym._id,
            date: new Date(sym.createdAt),
            action: 'Symptom Analysis',
            status: 'Completed',
            type: 'symptom'
          }));

          const mergedActivity = [...formattedAppts, ...formattedSymptoms]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5); // top 5 most recent

          setRecentActivity(mergedActivity);
        })
        .catch(console.error);
    }
  }, [user]);

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={() => navigate('/symptoms')} className="btn-primary">Submit Symptoms</button>
        <button onClick={() => navigate('/specialists')} className="btn-accent">Book Appointment</button>
        <button onClick={() => navigate('/travel')} className="btn-primary bg-white text-[#1A6FB5] border border-[#1A6FB5] hover:bg-[#F4F7FB]">Get Travel Info</button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm text-[#7A8FA6] mb-2">Upcoming Appointment</h3>
          {upcomingAppointment ? (
            <>
              <p className="font-bold text-[#1C2B3A] mb-1">
                Doctor: {upcomingAppointment.specialist?.user?.name || upcomingAppointment.specialist?.doctor_id || 'Unknown'}
              </p>
              <p className="text-sm text-[#1C2B3A] mb-3">
                {new Date(upcomingAppointment.date).toLocaleString(undefined, {
                  weekday: 'short', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
              <StatusBadge status={upcomingAppointment.status || 'Scheduled'} />
            </>
          ) : (
            <p className="text-[#1C2B3A] font-medium mt-4">No Upcoming Appointments</p>
          )}
        </div>
        
        <div className="card">
          <h3 className="text-sm text-[#7A8FA6] mb-2 flex items-center gap-1">Latest AI Recommendation <span className="text-[#00C896]">✦</span></h3>
          {latestRecommendation ? (
            <>
              <p className="font-bold text-[#1C2B3A] mb-1 truncate" title={latestRecommendation.name}>{latestRecommendation.name}</p>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2 mb-1 mt-2">
                <div className="bg-[#00C896] h-2 rounded-full" style={{ width: `${latestRecommendation.probability || 0}%` }}></div>
              </div>
              <p className="text-xs text-[#7A8FA6]">{latestRecommendation.probability || 0}% Confidence Score</p>
            </>
          ) : (
            <p className="text-[#1C2B3A] font-medium mt-4">No recent analysis</p>
          )}
        </div>

        <div className="card flex flex-col justify-center items-center text-center">
          <h3 className="text-sm text-[#7A8FA6] mb-2">Pending Actions</h3>
          <p className="text-4xl font-bold text-[#E84040]">{pendingActionsCount}</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card overflow-x-auto">
        <h3 className="font-bold text-[#1C2B3A] mb-4">Recent Activity</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-sm text-[#7A8FA6]">
              <th className="pb-3 font-normal">Date</th>
              <th className="pb-3 font-normal">Action</th>
              <th className="pb-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-[#1C2B3A]">
            {recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <tr key={`${activity.type}-${activity.id}`} className="border-b border-[#E2E8F0]">
                  <td className="py-4">
                    {activity.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-4">{activity.action}</td>
                  <td className="py-4"><StatusBadge status={activity.status} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-6 text-center text-[#7A8FA6]">No recent activity found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
