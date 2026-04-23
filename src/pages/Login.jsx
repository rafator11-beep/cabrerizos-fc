import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User, Shield, Users, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [surname2, setSurname2] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const needSurname2 = isRegistering;
    if (!name || !surname || (needSurname2 && !surname2) || !password) {
      setError('Por favor, rellena todos los campos.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isRegistering) {
        result = await register(name, surname, password, role, surname2);
        if (!result.error) {
          setSuccess('¡Registrado correctamente! Ya puedes acceder.');
          setIsRegistering(false);
          setSurname2('');
          setLoading(false);
          return;
        }
      } else {
        result = await login(name, surname, password, surname2);
      }

      if (result.error) {
        let msg = result.error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Nombre, apellidos o contraseña incorrectos.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Cuenta no confirmada. Contacta con tu entrenador.';
        }
        setError(msg);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg p-5 animate-fade-in">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="glass w-full max-w-md rounded-[32px] p-8 md:p-10 shadow-2xl">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-surface-2 rounded-2xl p-3 flex items-center justify-center mb-4 border border-border shadow-inner">
            <img 
              src={import.meta.env.BASE_URL + 'escudo.png'} 
              alt="Escudo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-3xl font-bold text-text mb-1">Cabrerizos F.C.</h1>
          <p className="text-muted text-sm font-medium">
            {isRegistering ? 'Crear nueva cuenta' : 'Acceso a la plataforma'}
          </p>
          <div className="mt-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold text-accent uppercase tracking-wider">
            Juvenil B · Salamanca
          </div>
        </div>

        {/* Role Switcher (Register only) */}
        {isRegistering && (
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                role === 'player' ? 'border-accent bg-accent/10' : 'border-border bg-surface-2'
              }`}
            >
              <Users size={20} className={role === 'player' ? 'text-accent' : 'text-muted'} />
              <span className={`text-xs font-bold ${role === 'player' ? 'text-accent' : 'text-muted'}`}>Jugador</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                role === 'admin' ? 'border-accent bg-accent/10' : 'border-border bg-surface-2'
              }`}
            >
              <Shield size={20} className={role === 'admin' ? 'text-accent' : 'text-muted'} />
              <span className={`text-xs font-bold ${role === 'admin' ? 'text-accent' : 'text-muted'}`}>Entrenador</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nombre</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input-field !pl-12"
                placeholder="Ej: Jesús"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Primer apellido</label>
              <input
                className="input-field"
                placeholder="García"
                value={surname}
                onChange={e => setSurname(e.target.value)}
                autoComplete="family-name"
              />
            </div>
            <div>
              <label className="label">Segundo apellido</label>
              <input
                className="input-field"
                placeholder="López"
                value={surname2}
                onChange={e => setSurname2(e.target.value)}
                autoComplete="additional-name"
              />
            </div>
          </div>

          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                className="input-field !pl-12"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center animate-pulse">
              ⚠ {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium text-center">
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full py-4 text-base"
            disabled={loading}
          >
            {loading ? 'Procesando...' : (
              <span className="flex items-center gap-2">
                {isRegistering ? 'Crear cuenta' : 'Acceder ahora'}
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-muted text-sm font-medium">
            {isRegistering ? '¿Ya tienes cuenta? ' : '¿No estás registrado? '}
            <button
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }}
              className="text-accent font-bold hover:underline"
            >
              {isRegistering ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
