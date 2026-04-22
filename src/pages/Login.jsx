import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User, Shield, Users } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
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

    if (!name || !surname || !password) {
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
        result = await register(name, surname, password, role);
        if (!result.error) {
          setSuccess('¡Registrado correctamente! Ya puedes acceder.');
          setIsRegistering(false);
          setLoading(false);
          return;
        }
      } else {
        result = await login(name, surname, password);
      }

      if (result.error) {
        // Translate common Supabase errors to Spanish
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #111827 50%, #0d2248 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        maxWidth: 380,
        width: '100%',
        padding: '32px 28px',
        textAlign: 'center',
        boxShadow: '0 12px 48px rgba(0,0,0,.35)'
      }}>
        {/* Logo */}
        <img src={import.meta.env.BASE_URL + 'escudo.png'} alt="Escudo" style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 8 }} />
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 2, color: '#111' }}>Cabrerizos F.C.</div>
        <div style={{ color: '#96a0b5', fontSize: 11, marginBottom: 4, letterSpacing: 0.3 }}>
          {isRegistering ? 'Crear nueva cuenta' : 'Acceso a la plataforma'}
        </div>
        <div style={{ color: '#b0b8c9', fontSize: 9, marginBottom: 20, fontWeight: 600 }}>Juvenil B · 2ª Juvenil Grupo 1 · Salamanca</div>

        {/* Role selection (register only) */}
        {isRegistering && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => setRole('player')}
              style={{
                flex: 1,
                padding: '12px 10px',
                borderRadius: 10,
                border: `2px solid ${role === 'player' ? '#0057ff' : '#e2e6ed'}`,
                background: role === 'player' ? '#eef3ff' : 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'all .15s'
              }}
            >
              <Users size={20} color={role === 'player' ? '#0057ff' : '#96a0b5'} />
              <span style={{ fontSize: 12, fontWeight: 700, color: role === 'player' ? '#0057ff' : '#4a5568' }}>Jugador</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              style={{
                flex: 1,
                padding: '12px 10px',
                borderRadius: 10,
                border: `2px solid ${role === 'admin' ? '#e87c00' : '#e2e6ed'}`,
                background: role === 'admin' ? '#fff8ef' : 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'all .15s'
              }}
            >
              <Shield size={20} color={role === 'admin' ? '#e87c00' : '#96a0b5'} />
              <span style={{ fontSize: 12, fontWeight: 700, color: role === 'admin' ? '#e87c00' : '#4a5568' }}>Entrenador</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Nombre</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 10, top: 9, color: '#96a0b5' }} />
              <input
                className="input-field"
                style={{ paddingLeft: 34 }}
                placeholder="Ej: Jesús"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="label">Apellidos</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 10, top: 9, color: '#96a0b5' }} />
              <input
                className="input-field"
                style={{ paddingLeft: 34 }}
                placeholder="Ej: Torres"
                value={surname}
                onChange={e => setSurname(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: 10, top: 9, color: '#96a0b5' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: 34 }}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {error && (
            <div style={{
              fontSize: 11,
              color: '#e74c3c',
              marginBottom: 12,
              textAlign: 'center',
              padding: '8px 10px',
              background: '#fef2f2',
              borderRadius: 8,
              border: '1px solid #fecaca'
            }}>
              ⚠ {error}
            </div>
          )}

          {success && (
            <div style={{
              fontSize: 11,
              color: '#059669',
              marginBottom: 12,
              textAlign: 'center',
              padding: '8px 10px',
              background: '#ecfdf5',
              borderRadius: 8,
              border: '1px solid #a7f3d0'
            }}>
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: 13 }}
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isRegistering ? 'Registrarme →' : 'Entrar →')}
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 11, color: '#4a5568' }}>
          {isRegistering ? '¿Ya tienes cuenta? ' : '¿No estás registrado? '}
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: '#0057ff', fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            {isRegistering ? 'Inicia sesión' : 'Regístrate aquí'}
          </button>
        </div>

        <div style={{ marginTop: 14, fontSize: 9, color: '#c0c8d8', lineHeight: 1.4 }}>
          ⚠ Una cuenta = un dispositivo.<br/>
          Si cambias de móvil, avisa a tu entrenador.
        </div>
      </div>
    </div>
  );
}
