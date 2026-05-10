import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePCApp, PCAppProvider } from '../hooks/usePCAppContext';
import ExerciseBank from '../views/ExerciseBank';
import MethodologySidebar from '../components/MethodologySidebar';
import Tactica from '../pages/Tactica';
import { LayoutGrid, PenTool, Dumbbell, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

function AdminPCContent() {
  const { activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed, cameraPreset, setCameraPreset, selectedExercise, setSelectedExercise } = usePCApp();

  const presets = [
    { id: null, label: 'Campo Completo' },
    { id: 'corner_right_top', label: 'Córner DR' },
    { id: 'corner_left_top', label: 'Córner DF' },
    { id: 'penalty_right', label: 'Área' }
  ];

  return (
    <div className="hidden md:flex flex-col h-screen bg-[#030508] text-white font-main overflow-hidden">
      {/* Top Navigation / Tabs */}
      <header className="h-14 border-b border-white/5 bg-surface flex items-center px-4 justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-6 h-full">
          <div className="text-[14px] font-black tracking-widest uppercase text-accent mr-4">
            Command Center
          </div>
          
          <div className="flex h-full">
            {[
              { id: 'tactica', label: 'Pizarra Táctica', icon: <PenTool size={16} /> },
              { id: 'alineacion', label: 'Alineación de Partido', icon: <LayoutGrid size={16} /> },
              { id: 'ejercicios', label: 'Banco de Ejercicios', icon: <Dumbbell size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 h-full text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === tab.id 
                    ? 'border-accent text-accent bg-accent/5' 
                    : 'border-transparent text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Zoom Presets (Visible only in Tactica) */}
        {activeTab === 'tactica' && (
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
            <Camera size={14} className="text-muted ml-2" />
            {presets.map(p => (
              <button
                key={p.id || 'full'}
                onClick={() => setCameraPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  cameraPreset === p.id 
                    ? 'bg-accent text-bg shadow-lg shadow-accent/20' 
                    : 'text-muted hover:text-white hover:bg-white/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Drawer: Exercise Bank (Only when not in Alineacion, or when strictly needed) */}
        {activeTab !== 'alineacion' && (
          <div 
            className={`flex-shrink-0 border-r border-white/5 bg-surface/50 transition-all duration-300 ease-in-out flex flex-col relative z-10 ${
              sidebarCollapsed ? 'w-16' : 'w-[320px]'
            }`}
          >
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-accent text-bg flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform"
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            
            <div className={`flex-1 overflow-hidden transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <ExerciseBank onSelectExercise={setSelectedExercise} />
            </div>
            
            {sidebarCollapsed && (
              <div className="flex flex-col items-center pt-6 opacity-100">
                <Dumbbell size={20} className="text-muted" />
              </div>
            )}
          </div>
        )}

        {/* Center: Large Pitch Workspace */}
        <div className="flex-1 min-w-0 min-h-0 bg-[#05070a] relative overflow-hidden z-0">
          <Tactica
            externalExercise={selectedExercise}
            overridePreset={cameraPreset}
            hideLibrary={false}
            hideEditor={activeTab === 'ejercicios'}
          />
        </div>

        {/* Right Drawer: Methodology (Optional depending on tab) */}
        {activeTab === 'ejercicios' && (
           <div className="w-72 flex-shrink-0 bg-surface/30 border-l border-white/5 z-10 overflow-y-auto no-scrollbar">
             <MethodologySidebar exercise={selectedExercise} />
           </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPCLayout() {
  const { isRealAdmin, viewAsPlayer } = useAuth();
  const isAdminView = isRealAdmin && !viewAsPlayer;

  if (!isAdminView) {
    return <Tactica />;
  }

  return (
    <PCAppProvider>
      <AdminPCContent />
    </PCAppProvider>
  );
}
