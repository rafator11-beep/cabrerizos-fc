import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !surname || !password) {
      setError('Por favor, rellena todos los campos.');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isRegistering) {
        // Here we could check for an invitation code to become admin, but for now we default to 'player'
        result = await register(name, surname, password);
      } else {
        result = await login(name, surname, password);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 360, width: '100%', padding: 30, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,.3)' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>⚽</div>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 3 }}>Cabrerizos F.C.</div>
        <div style={{ color: '#4a5568', fontSize: 12, marginBottom: 22 }}>
          {isRegistering ? 'Registro de Jugador/Entrenador' : 'Acceso a la plataforma'}
        </div>

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
                placeholder="••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>

          {error && <div style={{ fontSize: 11, color: '#e74c3c', marginBottom: 12, textAlign: 'center' }}>⚠ {error}</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isRegistering ? 'Registrarme →' : 'Entrar →')}
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 11, color: '#4a5568' }}>
          {isRegistering ? '¿Ya tienes cuenta? ' : '¿No estás registrado? '}
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#0057ff', fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            {isRegistering ? 'Inicia sesión' : 'Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
