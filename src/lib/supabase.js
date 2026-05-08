import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || 'https://yaltxcmspsvnhnxomhwa.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('[CRITICAL SUPABASE ERROR]: Variables de entorno ausentes — define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
}

const rawClient = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (...args) =>
      fetch(...args).catch(err => {
        console.error('[CRITICAL SUPABASE ERROR]: Fallo de red', {
          message: err.message,
          url: args[0],
          timestamp: new Date().toISOString(),
        })
        throw err
      }),
  },
})

const fromHandler = {
  get(target, prop) {
    const value = target[prop]
    if (prop !== 'from' || typeof value !== 'function') return value

    return (...args) => {
      const builder = value.apply(target, args)
      const originalThen = builder.then?.bind(builder)
      if (!originalThen) return builder

      builder.then = (onFulfilled, onRejected) =>
        originalThen(result => {
          if (result?.error) {
            console.error('[CRITICAL SUPABASE ERROR]:', {
              table:     args[0],
              code:      result.error.code,
              message:   result.error.message,
              details:   result.error.details,
              hint:      result.error.hint,
              timestamp: new Date().toISOString(),
            })
          }
          return onFulfilled ? onFulfilled(result) : result
        }, onRejected)

      return builder
    }
  },
}

export const supabase = new Proxy(rawClient, fromHandler)