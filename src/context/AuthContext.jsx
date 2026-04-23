import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

// Generate a unique device ID and store it in localStorage
function getDeviceId() {
  let id = localStorage.getItem('cfc_device_id');
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('cfc_device_id', id);
  }
  return id;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewAsPlayer, setViewAsPlayer] = useState(false);

  const registerDevice = async (userId) => {
    const deviceId = getDeviceId();
    try {
      await supabase
        .from('profiles')
        .update({ device_id: deviceId })
        .eq('id', userId);
    } catch (err) {
      console.error('Error registering device:', err);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile may not exist yet (just registered), wait and retry once
        console.warn('Profile not found yet, retrying in 1s...', error.message);
        setTimeout(async () => {
          const { data: retry } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (retry) {
            setProfile(retry);
            registerDevice(userId);
          }
          setLoading(false);
        }, 1000);
        return;
      }

      // Solo Rafa e Ibon son entrenadores — cualquier otro queda como jugador
      const ADMIN_NAMES = ['rafa', 'ibon'];
      const isAuthorizedAdmin = ADMIN_NAMES.includes(data.name?.trim().toLowerCase());
      if (isAuthorizedAdmin && data.role !== 'admin') {
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
        data.role = 'admin';
      } else if (!isAuthorizedAdmin && data.role === 'admin') {
        await supabase.from('profiles').update({ role: 'player' }).eq('id', userId);
        data.role = 'player';
      }

      setProfile(data);
      registerDevice(userId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const buildEmail = (name, surname, surname2 = '') => {
    const n = name.trim().toLowerCase().replace(/\s+/g, '.');
    const s = surname.trim().toLowerCase().replace(/\s+/g, '.');
    const s2 = surname2 ? surname2.trim().toLowerCase().replace(/\s+/g, '.') : '';
    return s2 ? `${n}.${s}.${s2}@cabrerizos-fc.app` : `${n}.${s}@cabrerizos-fc.app`;
  };

  const login = async (name, surname, password, surname2 = '') => {
    const email = buildEmail(name, surname, surname2);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const ADMIN_NAMES = ['rafa', 'ibon'];

  const register = async (name, surname, password, role = 'player', surname2 = '') => {
    if (role === 'admin' && !ADMIN_NAMES.includes(name.trim().toLowerCase())) {
      return { data: null, error: { message: 'Solo los entrenadores autorizados pueden registrarse como Entrenador. Contacta con Rafa.' } };
    }

    const email = buildEmail(name, surname, surname2);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          surname,
          role
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { data: null, error: { message: 'Ese nombre ya está registrado. Por favor, inicia sesión.' } };
      }
      return { data, error };
    }

    if (data?.user) {
      const deviceId = getDeviceId();
      const fullSurname = surname2.trim()
        ? `${surname.trim()} ${surname2.trim()}`
        : surname.trim();

      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          name: name.trim(),
          surname: fullSurname,
          role: role,
          device_id: deviceId,
          stats: {},
          photo_url: '',
          position: '',
        }
      ]);
      if (profileError) console.error('Error creating profile:', profileError);
    }

    return { data, error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Admin can reset a player's device so they can log in from a new phone
  const resetPlayerDevice = async (playerId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ device_id: null })
      .eq('id', playerId);
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      register,
      logout,
      resetPlayerDevice,
      isAdmin: profile?.role === 'admin' && !viewAsPlayer,
      isRealAdmin: profile?.role === 'admin',
      viewAsPlayer,
      setViewAsPlayer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
