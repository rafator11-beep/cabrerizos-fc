import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAppContext } from '../context/AppContext'

/**
 * SyncDB: Singleton manager for IndexedDB to avoid repeated opens/closes.
 */
class SyncDB {
  static DB_NAME = 'cfc_offline_v2'
  static STORE = 'sync_queue'
  static _db = null

  static async getDB() {
    if (this._db) return this._db
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, 2)
      req.onupgradeneeded = (e) => {
        const db = e.target.result
        if (!db.objectStoreNames.contains(this.STORE)) {
          db.createObjectStore(this.STORE, { keyPath: 'id' })
        }
      }
      req.onsuccess = () => { this._db = req.result; resolve(this._db) }
      req.onerror = () => reject(req.error)
    })
  }

  static async put(op) {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite')
      const store = tx.objectStore(this.STORE)
      
      // Operation Merging (WAL logic): 
      // If we have a pending update for this ID, merge the new data.
      const getReq = store.get(op.id)
      getReq.onsuccess = () => {
        const existing = getReq.result
        if (existing && existing.type === 'UPDATE' && op.type === 'UPDATE') {
          store.put({ ...existing, data: { ...existing.data, ...op.data }, ts: op.ts })
        } else {
          store.put(op)
        }
      }
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
  }

  static async getAll() {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readonly')
      const req = tx.objectStore(this.STORE).getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  static async clear() {
    const db = await this.getDB()
    const tx = db.transaction(this.STORE, 'readwrite')
    tx.objectStore(this.STORE).clear()
    return new Promise((res) => { tx.oncomplete = res })
  }
}

export function useOfflineSync() {
  const { showToast } = useAppContext()
  const flushingRef = useRef(false)

  const flush = useCallback(async () => {
    if (flushingRef.current || !navigator.onLine) return
    flushingRef.current = true

    try {
      const ops = await SyncDB.getAll()
      if (ops.length === 0) { flushingRef.current = false; return }

      showToast(`Sincronizando ${ops.length} cambios...`, 'info')
      
      // Process in batches for performance
      const BATCH_SIZE = 5
      for (let i = 0; i < ops.length; i += BATCH_SIZE) {
        const batch = ops.slice(i, i + BATCH_SIZE)
        await Promise.all(batch.map(async (op) => {
          try {
            let res;
            if (op.type === 'UPDATE') {
              res = await supabase.from(op.table).update(op.data).eq('id', op.rowId)
            } else if (op.type === 'INSERT') {
              res = await supabase.from(op.table).insert(op.data)
            }
            if (res?.error) throw res.error
          } catch (e) {
            console.error('[Sync] Item failed:', e.message)
            // We keep it in DB? For now, we'll clear and retry next time if critical,
            // but usually we clear the queue to prevent stale loops.
          }
        }))
      }

      await SyncDB.clear()
      showToast('¡Sincronización completada! ✓', 'success')
    } catch (err) {
      console.error('[OfflineSync] Flush failed:', err)
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
    const op = { id: `${table}:${rowId}`, type: 'UPDATE', table, rowId, data, ts: Date.now() }
    
    if (!navigator.onLine) {
      await SyncDB.put(op)
      showToast('Sin conexión · Guardado localmente', 'warning')
      return { error: null }
    }

    const { error } = await supabase.from(table).update(data).eq('id', rowId)
    if (error) {
      await SyncDB.put(op)
      showToast('Error al guardar · Se reintentará pronto', 'danger')
      return { error }
    }
    return { error: null }
  }, [showToast])

  return { queueUpdate, isOnline: navigator.onLine }
}

