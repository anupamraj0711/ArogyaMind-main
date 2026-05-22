import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api';

export const AppointmentsContext = createContext(null);

const normalizeAppointment = (appointment) => ({
  ...appointment,
  status: appointment?.status || 'Scheduled',
});

export const AppointmentsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const patientId = useMemo(() => user?._id || user?.id || null, [user?._id, user?.id]);

  const refreshAppointments = useCallback(async () => {
    if (!patientId) {
      setAppointments([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get(`/appointments/${patientId}`);
      const normalized = Array.isArray(data) ? data.map(normalizeAppointment) : [];
      setAppointments(normalized);
      return normalized;
    } catch (fetchError) {
      setError(fetchError);
      throw fetchError;
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refreshAppointments().catch(() => {});
  }, [refreshAppointments]);

  const addAppointment = useCallback(async (appointmentPayload) => {
    const { data } = await api.post('/appointments', appointmentPayload);
    await refreshAppointments();
    return normalizeAppointment(data);
  }, [refreshAppointments]);

  const updateAppointment = useCallback(async (appointmentId, updates) => {
    const { data } = await api.put(`/appointments/${appointmentId}`, updates);
    await refreshAppointments();
    return normalizeAppointment(data);
  }, [refreshAppointments]);

  const cancelAppointment = useCallback(async (appointmentId) => {
    const { data } = await api.put(`/appointments/${appointmentId}`, { status: 'Cancelled' });
    await refreshAppointments();
    return normalizeAppointment(data);
  }, [refreshAppointments]);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        loading,
        error,
        refreshAppointments,
        addAppointment,
        updateAppointment,
        cancelAppointment,
        setAppointments,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);

  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }

  return context;
};