import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tab, setTab] = useState('elxi');
  const [rol, setRol] = useState(() => localStorage.getItem('cabrerizos_rol') || 'coach');
  const [jugadorActivo, setJugadorActivo] = useState(() => {
    const saved = localStorage.getItem('cabrerizos_jugador');
    return saved ? JSON.parse(saved) : null;
  });
  const [online, setOnline] = useState(navigator.onLine);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('cabrerizos_rol', rol);
  }, [rol]);

  useEffect(() => {
    if (jugadorActivo) {
      localStorage.setItem('cabrerizos_jugador', JSON.stringify(jugadorActivo));
    } else {
      localStorage.removeItem('cabrerizos_jugador');
    }
  }, [jugadorActivo]);

  const showToast = (msg, tipo) => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppContext.Provider value={{
      tab, setTab,
      rol, setRol,
      jugadorActivo, setJugadorActivo,
      online,
      toast, showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
