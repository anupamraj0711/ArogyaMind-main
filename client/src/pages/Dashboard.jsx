import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { Stethoscope, Calendar, Activity, LogOut, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/symptoms/analyze', { 
        symptoms, 
        patientId: user._id 
      });
      setAnalysis(data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error analyzing symptoms. Please try again.';
      alert(errorMsg);
    }
    setLoading(false);
  };

  const handleBook = async (specialistId) => {
    try {
      await api.post('/appointments', {
        patientId: user._id,
        specialistId,
        symptomRecordId: analysis.record._id,
        date: new Date(Date.now() + 86400000) // tomorrow
      });
      alert('Appointment booked successfully!');
    } catch (err) {
      alert('Error booking appointment');
    }
  };

  return (
    <div className="min-h-screen p-6 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 glass-panel p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Activity className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Agentic Care</h1>
            <p className="text-sm text-slate-400">Welcome back, {user?.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-sm">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Left Column: Symptom Input */}
        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Stethoscope className="text-blue-400" /> Describe Symptoms
            </h2>
            <form onSubmit={handleAnalyze}>
              <textarea 
                className="input-field h-40 resize-none" 
                placeholder="How are you feeling today? Describe any pain, fever, or discomfort..."
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                {loading ? 'Analyzing with Gemini AI...' : 'Analyze Symptoms'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right Column: AI Analysis & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {analysis ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-6">
              <h2 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2">
                <Activity /> AI Analysis Result
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Severity</p>
                  <p className="font-semibold text-white">{analysis.record.aiAnalysis.severity}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Recommended Specialist</p>
                  <p className="font-semibold text-white">{analysis.record.aiAnalysis.recommendedSpecialistType}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mb-6">
                <p className="text-sm text-slate-400 mb-2">Potential Causes</p>
                <ul className="list-disc pl-5 space-y-1">
                  {analysis.record.aiAnalysis.potentialCauses.map((cause, i) => (
                    <li key={i} className="text-slate-300">{cause}</li>
                  ))}
                </ul>
              </div>

              <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Calendar className="text-blue-400 w-5 h-5"/> Recommended Specialists
              </h3>
              
              {analysis.recommendedSpecialists.length > 0 ? (
                <div className="space-y-3">
                  {analysis.recommendedSpecialists.map(spec => (
                    <div key={spec._id} className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                      <div>
                        <p className="font-semibold text-white">Dr. {spec.user.name}</p>
                        <p className="text-sm text-slate-400">{spec.specialty}</p>
                      </div>
                      <button onClick={() => handleBook(spec._id)} className="btn-primary text-sm px-3 py-1 flex items-center gap-1">
                        Book <ChevronRight className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 bg-slate-900/50 p-4 rounded-xl">No specific specialists found for this category yet. System will notify general practitioners.</p>
              )}
            </motion.div>
          ) : (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-center h-full border-dashed">
              <Activity className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400">Submit your symptoms on the left to receive an AI-powered assessment and specialist recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
