import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export default function Home() {
  const { profile, isAdmin } = useAuth();
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  // Mock data for now until Supabase is fully populated
  const stats = [
    { v: "18", l: "Partidos", c: "#0057ff" },
    { v: "12", l: "Victorias", c: "#00b96b" },
    { v: "22", l: "Jugadores", c: "#d4a017" },
    { v: "47", l: "Goles", c: "#e87c00" }
  ];

  return (
    <div>
      <div style={{ background: "linear-gradient(130deg,#0a1628,#0d2248 55%,#0a1628)", borderRadius: 13, padding: "22px 24px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,87,255,.18),transparent 70%)" }}/>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: .7, marginBottom: 3 }}>📅 {today}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 2 }}>{isAdmin ? "Panel Entrenador" : "Mi Panel"}</div>
        <div style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>Temporada 2024/25 · Juveniles División Honor</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
        {stats.map(x => (
          <div key={x.l} className="card" style={{ padding: "12px 14px" }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: x.c }}>{x.v}</div>
            <div style={{ fontSize: 10, color: "#4a5568", marginTop: 1, fontWeight: 600 }}>{x.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card">
          <div style={{ padding: "11px 14px", borderBottom: "1px solid #e2e6ed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} color="#0057ff"/> Próxima sesión
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#eef3ff", color: "#0057ff" }}>Táctica</span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Presión alta 4-3-3</div>
            <div style={{ fontSize: 11, color: "#4a5568", marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12}/> Hoy a las 19:30 · 75 min
            </div>
            <div style={{ fontSize: 12, color: "#4a5568", marginBottom: 10 }}>Mejorar líneas de presión colectiva.</div>
          </div>
        </div>

        <div className="card">
          <div style={{ padding: "11px 14px", borderBottom: "1px solid #e2e6ed" }}>
            <span style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} color="#00b96b"/> Notificaciones
            </span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ color: "#96a0b5", fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
              No hay notificaciones recientes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
