import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toast } from '../components/shared';
import { AuthContext } from '../context/AuthContext';

/**
 * LoginPage Component
 * Represents SCREEN 1: Split layout authentication screen
 */
export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState('Patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [errorToast, setErrorToast] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      // Optional: enforce role check if needed
      // if (data.role !== role) throw new Error(`User is not a ${role}`);
      
      // Navigate to respective dashboard
      if (data.role === 'Admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setFailedAttempts(prev => prev + 1);
      if (failedAttempts >= 4) {
        setErrorToast('Invalid credentials. Account locked after 5 failed attempts.');
      } else {
        setErrorToast(err.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    }
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F7FB]">
      <Toast message={errorToast} type="error" onClose={() => setErrorToast('')} />
      
      {/* Left Panel */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#1A6FB5] to-[#00C896] p-12 flex flex-col justify-center items-start text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Agentic AI Systems for Personalized Patient Care Coordination</h1>
        <p className="text-xl opacity-90 font-medium">AI-Powered Healthcare Coordination</p>
      </div>

      {/* Right Panel */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="card w-full max-w-md">
          <h2 className="text-2xl font-bold text-[#1C2B3A] mb-6">Welcome Back</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-[#7A8FA6] mb-1">Select Role</label>
              <select 
                className="input-field bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Patient">Patient</option>
                <option value="Care Physician">Care Physician</option>
                <option value="Specialist">Specialist</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-[#7A8FA6] mb-1">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {!email && <p className="text-xs text-[#E84040] mt-1 hidden">Email is required</p>}
            </div>

            <div>
              <label className="block text-sm text-[#7A8FA6] mb-1">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-2">
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#7A8FA6]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1A6FB5] font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
