import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ExerciseBank from '../views/ExerciseBank';
import MethodologySidebar from '../components/MethodologySidebar';
import Tactica from '../pages/Tactica';

export default function AdminPCLayout() {
  const { isRealAdmin, viewAsPlayer } = useAuth();
  const isAdminView = isRealAdmin && !viewAsPlayer;
  const [selectedExercise, setSelectedExercise] = useState(null);

  if (!isAdminView) {
    return <Tactica />;
  }

  return (
    <div className="hidden md:grid grid-cols-12 h-full bg-[#030508] overflow-hidden font-main">
      <div className="col-span-3 border-r border-white/5 bg-surface/50 h-full overflow-hidden">
        <ExerciseBank onSelectExercise={setSelectedExercise} />
      </div>

      <div className="col-span-6 h-full relative border-r border-white/5 shadow-2xl z-10 bg-[#05070a]">
        <Tactica externalExercise={selectedExercise} />
      </div>

      <div className="col-span-3 bg-surface/30 h-full overflow-hidden">
        <MethodologySidebar exercise={selectedExercise} />
      </div>
    </div>
  );
}
