import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (name, surname, password) => {
    // Generate an email format from name and surname
    const email = `${name.trim().toLowerCase().replace(/\s+/g, '.')}@cabrerizos.fc`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const register = async (name, surname, password, role = 'player') => {
    const email = `${name.trim().toLowerCase().replace(/\s+/g, '.')}@cabrerizos.fc`;
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
    if (error && error.message.includes('User already registered')) {
      return { error: { message: 'Ese nombre ya está registrado. Por favor, inicia sesión.' } };
    }
    
    if (data?.user && !error) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          name: name.trim(),
          surname: surname.trim(),
          role: role
        }
      ]);
      if (profileError) console.error('Error creating profile:', profileError);
    }
    
    return { data, error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, isAdmin: profile?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
