import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Old Pages
import Register from './pages/Register';

// New Pages
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import SymptomSubmission from './pages/SymptomSubmission';
import SpecialistRecommendation from './pages/SpecialistRecommendation';
import AppointmentScheduling from './pages/AppointmentScheduling';
import MyAppointments from './pages/MyAppointments';
import TravelAssistance from './pages/TravelAssistance';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Layout><PatientDashboard /></Layout>} />
          <Route path="/symptoms" element={<Layout><SymptomSubmission /></Layout>} />
          <Route path="/specialists" element={<Layout><SpecialistRecommendation /></Layout>} />
          <Route path="/appointments" element={<Layout><MyAppointments /></Layout>} />
          <Route path="/schedule-appointment" element={<Layout><AppointmentScheduling /></Layout>} />
          <Route path="/travel" element={<Layout><TravelAssistance /></Layout>} />
          <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
