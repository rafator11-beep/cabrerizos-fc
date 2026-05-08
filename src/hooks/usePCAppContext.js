import { useState, createContext, useContext } from 'react';

const PCAppContext = createContext();

export function PCAppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('tactica'); // 'tactica', 'alineacion', 'ejercicios'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('corners');
  const [cameraPreset, setCameraPreset] = useState(null); // null = full field
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const value = {
    activeTab, setActiveTab,
    sidebarCollapsed, setSidebarCollapsed,
    activeCategory, setActiveCategory,
    cameraPreset, setCameraPreset,
    selectedTokenId, setSelectedTokenId,
    selectedExercise, setSelectedExercise
  };

  return <PCAppContext.Provider value={value}>{children}</PCAppContext.Provider>;
}

export function usePCApp() {
  const context = useContext(PCAppContext);
  if (!context) {
    throw new Error('usePCApp must be used within a PCAppProvider');
  }
  return context;
}
