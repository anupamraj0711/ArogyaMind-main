import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api';

export const AppointmentsContext = createContext();

export const AppointmentsProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshAppointments = useCallback(async () => {
    const patientId = user?._id || user?.id;

    if (!patientId) {
      setAppointments([]);
      setLoading(false);
      return [];
    }

    setLoading(true);

    try {
      const { data } = await api.get(`/appointments/${patientId}`);
      setAppointments(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.id]);

  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        loading,
        refreshAppointments,
        setAppointments,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentsContext);