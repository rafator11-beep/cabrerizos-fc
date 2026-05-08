import { useState, useEffect } from 'react';
import { Users, Plus, X, Search, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Keyword-based role detection from exercise descriptions
const ROLE_KEYWORDS = {
  'Atacante': ['atacan', 'ataque', 'delantero', 'punta', 'rematador', 'finaliza'],
  'Defensa': ['defien', 'defensa', 'central', 'lateral', 'zaguero', 'recuper'],
  'Mediocampista': ['mediocampista', 'centrocampista', 'organizador', 'pivote', 'interior'],
  'Extremo': ['extremo', 'banda', 'winger', 'centran', 'desborde'],
  'Portero': ['portero', 'guardameta', 'meta', 'porter'],
  'Comodín': ['comod', 'comodín', 'neutral', 'apoyo', 'libre'],
  'Presionador': ['presion', 'pressing', 'press', 'robo', 'recuper'],
};

function detectRolesFromDescription(description) {
  if (!description) return [];
  const lower = description.toLowerCase();
  const detected = [];
  
  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      detected.push(role);
    }
  }
  
  // Also detect positional letters like A, B, C mentioned in descriptions
  const letterMatch = description.match(/['"]([A-Z][0-9]?)['"]|posición\s+([A-Z][0-9]?)/g);
  if (letterMatch) {
    letterMatch.forEach(m => {
      const letter = m.replace(/['"posición\s]/g, '').trim();
      if (letter && !detected.includes(letter)) detected.push(letter);
    });
  }
  
  return detected;
}

export default function ExerciseAssigner({ exercise, exerciseIndex, roster = [], onAssign, isExpanded, onToggle }) {
  const [customRole, setCustomRole] = useState('');
  const [searchPlayer, setSearchPlayer] = useState('');
  
  // Merge detected roles + existing roles + manual roles
  const detectedRoles = detectRolesFromDescription(exercise.description);
  const existingRoles = exercise.roles || [];
  const allRoles = [...new Set([...existingRoles, ...detectedRoles])];
  const assignments = exercise.assignments || {};
  
  const assignedCount = Object.keys(assignments).filter(k => assignments[k]).length;
  
  const filteredRoster = roster.filter(p => {
    if (!searchPlayer) return true;
    return p.name?.toLowerCase().includes(searchPlayer.toLowerCase()) || 
           String(p.number).includes(searchPlayer);
  });
  
  const addCustomRole = () => {
    if (!customRole.trim()) return;
    const newRoles = [...new Set([...(exercise.roles || []), customRole.trim()])];
    onAssign(exerciseIndex, '__update_roles', newRoles);
    setCustomRole('');
  };
  
  const removeRole = (role) => {
    const newRoles = (exercise.roles || []).filter(r => r !== role);
    const newAssignments = { ...assignments };
    delete newAssignments[role];
    onAssign(exerciseIndex, '__update_roles_and_assignments', { roles: newRoles, assignments: newAssignments });
  };

  if (allRoles.length === 0 && !isExpanded) return null;
  
  return (
    <div className="animate-fade-in">
      {/* Compact Badge */}
      <button onClick={onToggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 text-[9px] font-bold hover:bg-purple-500/20 transition-all">
        <Users size={12} />
        <span>{assignedCount}/{allRoles.length} roles</span>
        {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>
      
      {/* Expanded Assignment Panel */}
      {isExpanded && (
        <div className="mt-3 bg-surface-2 rounded-2xl border border-purple-500/10 p-4 space-y-3 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
              <Users size={12} className="inline mr-1" /> Asignar Jugadores
            </div>
            {detectedRoles.length > 0 && (
              <span className="text-[7px] font-bold text-purple-400/50 bg-purple-500/5 px-2 py-0.5 rounded">
                {detectedRoles.length} detectados
              </span>
            )}
          </div>
          
          {/* Role Slots */}
          <div className="space-y-2">
            {allRoles.map(role => {
              const assigned = assignments[role];
              const isDetected = detectedRoles.includes(role) && !existingRoles.includes(role);
              
              return (
                <div key={role} className="flex items-center gap-2">
                  {/* Role Badge */}
                  <div className={`flex items-center gap-1.5 min-w-[80px] ${isDetected ? 'opacity-60' : ''}`}>
                    <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      {role.length <= 2 ? role : role[0]}
                    </span>
                    <span className="text-[9px] font-bold text-white/60 truncate">{role}</span>
                  </div>
                  
                  {/* Player Selector */}
                  <select
                    value={assigned?.id || ''}
                    onChange={e => {
                      const player = roster.find(p => p.id === e.target.value);
                      onAssign(exerciseIndex, role, player || null);
                    }}
                    className="input-field !py-1.5 text-xs flex-1 !bg-white/5"
                  >
                    <option value="">— Sin asignar —</option>
                    {roster.map(p => (
                      <option key={p.id} value={p.id}>
                        #{p.number} {p.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Status */}
                  {assigned && (
                    <span className="text-[8px] font-bold text-emerald-400 flex-shrink-0">✓</span>
                  )}
                  
                  {/* Remove custom role */}
                  {existingRoles.includes(role) && (
                    <button onClick={() => removeRole(role)} className="text-rose-500/30 hover:text-rose-500 transition-colors flex-shrink-0">
                      <X size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Add Custom Role */}
          <div className="flex gap-2 pt-2 border-t border-white/5">
            <input
              type="text"
              value={customRole}
              onChange={e => setCustomRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomRole()}
              placeholder="Nuevo rol (ej: Lateral Izq.)"
              className="input-field !py-1.5 text-xs flex-1 !bg-white/5"
            />
            <button onClick={addCustomRole} className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase hover:bg-purple-500/20 transition-all">
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
