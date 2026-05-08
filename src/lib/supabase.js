import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yaltxcmspsvnhnxomhwa.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const rawClient = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (...args) => {
      return fetch(...args).catch((err) => {
        console.error('[CRITICAL SUPABASE ERROR] Network failure:', err.message);
        throw err;
      });
    },
  },
})

// Defensive proxy: intercept .from() calls to add automatic error logging
const originalFrom = rawClient.from.bind(rawClient);
rawClient.from = (table) => {
  const queryBuilder = originalFrom(table);

  const wrapMethod = (method) => {
    const original = queryBuilder[method].bind(queryBuilder);
    queryBuilder[method] = (...args) => {
      const result = original(...args);
      const originalThen = result.then?.bind(result);

      if (originalThen) {
        result.then = (onResolve, onReject) => {
          return originalThen((res) => {
            if (res.error) {
              const code = res.error.code || res.status || 'UNKNOWN';
              const hint = res.error.hint || '';
              const details = res.error.details || res.error.message;
              console.error(
                `[CRITICAL SUPABASE ERROR] Table: "${table}" | Method: ${method.toUpperCase()} | Code: ${code}\n` +
                `  Message: ${details}\n` +
                (hint ? `  Hint: ${hint}\n` : '') +
                `  Timestamp: ${new Date().toISOString()}`
              );
            }
            return onResolve ? onResolve(res) : res;
          }, onReject);
        };
      }

      return result;
    };
  };

  ['select', 'insert', 'update', 'upsert', 'delete'].forEach(wrapMethod);
  return queryBuilder;
};

export const supabase = rawClient;