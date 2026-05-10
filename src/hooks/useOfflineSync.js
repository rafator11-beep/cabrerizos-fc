import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAppContext } from '../context/AppContext'

// ── Minimal IndexedDB wrapper (no external library) ──────────────────────────

const DB_NAME = 'cfc_offline_v1'
const STORE = 'sync_queue'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'rowId' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function enqueue(op) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(op)
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

async function dequeueAll() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.getAll()
    req.onsuccess = () => {
      const records = req.result
      store.clear()
      tx.oncomplete = () => resolve(records)
    }
    req.onerror = () => reject(req.error)
  })
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useOfflineSync() {
  const { showToast } = useAppContext()
  const flushingRef = useRef(false)
  const pendingRef = useRef(0)

  const flush = useCallback(async () => {
    if (flushingRef.current) return
    flushingRef.current = true
    try {
      const ops = await dequeueAll()
      if (ops.length === 0) { flushingRef.current = false; return }

      const n = ops.length
      showToast(`Sincronizando ${n} cambio${n > 1 ? 's' : ''} guardado${n > 1 ? 's' : ''}...`, 'info')

      let failed = 0
      for (const op of ops) {
        const { error } = await supabase.from(op.table).update(op.data).eq('id', op.rowId)
        if (error) {
          await enqueue(op)
          failed++
        }
      }

      pendingRef.current = failed
      if (failed === 0) {
        showToast('¡Todo sincronizado! ✓', 'success')
      } else {
        showToast(`${failed} cambio${failed > 1 ? 's' : ''} sin sincronizar — reintentando`, 'warning')
      }
    } catch (err) {
      console.error('[OfflineSync] flush error:', err)
    } finally {
      flushingRef.current = false
    }
  }, [showToast])

  useEffect(() => {
    if (navigator.onLine) flush()
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [flush])

  const queueUpdate = useCallback(async (table, rowId, data) => {
    if (!navigator.onLine) {
      await enqueue({ table, rowId, data, ts: Date.now() })
      pendingRef.current += 1
      showToast('Sin conexión · Guardado localmente', 'warning')
      return { error: null }
    }

    const { error } = await supabase.from(table).update(data).eq('id', rowId)
    if (error) {
      console.warn('[OfflineSync] live save failed, queuing:', error.message)
      await enqueue({ table, rowId, data, ts: Date.now() })
      pendingRef.current += 1
      showToast('Error al guardar · Se reintentará pronto', 'danger')
      return { error }
    }
    return { error: null }
  }, [showToast])

  return { queueUpdate, isOnline: navigator.onLine }
}
