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

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        // Register device on every login/session restore
        registerDevice(userId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Register the current device for this user (1 device per account)
  const registerDevice = async (userId) => {
    const deviceId = getDeviceId();
    try {
      // Update the profile with the current device_id
      await supabase
        .from('profiles')
        .update({ device_id: deviceId })
        .eq('id', userId);
    } catch (err) {
      console.error('Error registering device:', err);
    }
  };

  // Check if this device is the registered one
  const checkDevice = async (userId) => {
    const deviceId = getDeviceId();
    try {
      const { data } = await supabase
        .from('profiles')
        .select('device_id')
        .eq('id', userId)
        .single();

      // If no device registered yet, allow it
      if (!data?.device_id) return true;
      return data.device_id === deviceId;
    } catch {
      return true; // allow on error
    }
  };

  const login = async (name, surname, password) => {
    // Generate an email format from name + surname (deterministic)
    const email = `${name.trim().toLowerCase().replace(/\s+/g, '.')}.${surname.trim().toLowerCase().replace(/\s+/g, '.')}@cabrerizos.fc`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { data, error };

    // Check device limit
    if (data?.user) {
      const allowed = await checkDevice(data.user.id);
      if (!allowed) {
        await supabase.auth.signOut();
        return {
          data: null,
          error: { message: 'Esta cuenta ya está registrada en otro dispositivo. Contacta con tu entrenador.' }
        };
      }
      // Register this device
      await registerDevice(data.user.id);
    }

    return { data, error };
  };

  const register = async (name, surname, password, role = 'player') => {
    const email = `${name.trim().toLowerCase().replace(/\s+/g, '.')}.${surname.trim().toLowerCase().replace(/\s+/g, '.')}@cabrerizos.fc`;

    // Check if user already exists by trying to sign in
    const { data: existingData } = await supabase.auth.signInWithPassword({
      email,
      password: password + '_check_nonexistent',
    });

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

    // Friendly error for "user already registered"
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { data: null, error: { message: 'Ese nombre ya está registrado. Por favor, inicia sesión.' } };
      }
      return { data, error };
    }

    if (data?.user) {
      const deviceId = getDeviceId();
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          name: name.trim(),
          surname: surname.trim(),
          role: role,
          device_id: deviceId
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
      isAdmin: profile?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
