import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Minimal IndexedDB wrapper (no external library) ──────────────────────────

const DB_NAME = 'cfc_offline_v1'
const STORE = 'sync_queue'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'rowId' }) // keyed by rowId → deduplication
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
    // put() replaces existing entry for the same rowId (keeps only latest update)
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

/**
 * Offline-first sync for Supabase UPDATE operations.
 *
 * Usage (replace direct supabase.from().update() calls):
 *   const { queueUpdate, pendingCount } = useOfflineSync()
 *   await queueUpdate('plays', play.id, { tokens: play.tokens })
 *
 * How it works:
 *  - Online  → writes directly to Supabase; on failure, enqueues to IndexedDB
 *  - Offline → stores in IndexedDB keyed by rowId (deduplicates multiple saves)
 *  - On reconnect → flushes the queue in order
 */
export function useOfflineSync() {
  const flushingRef = useRef(false)
  const pendingRef = useRef(0)

  const flush = useCallback(async () => {
    if (flushingRef.current) return
    flushingRef.current = true
    try {
      const ops = await dequeueAll()
      if (ops.length === 0) { flushingRef.current = false; return }

      console.log(`[OfflineSync] Syncing ${ops.length} queued operation(s)…`)
      for (const op of ops) {
        const { error } = await supabase.from(op.table).update(op.data).eq('id', op.rowId)
        if (error) {
          // Re-enqueue if still failing
          await enqueue(op)
          console.warn('[OfflineSync] re-queued op:', op.rowId, error.message)
        }
      }
      pendingRef.current = 0
    } catch (err) {
      console.error('[OfflineSync] flush error:', err)
    } finally {
      flushingRef.current = false
    }
  }, [])

  // Auto-flush when the browser regains connectivity
  useEffect(() => {
    if (navigator.onLine) flush()
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [flush])

  /**
   * Save an UPDATE. If offline, stores optimistically in IndexedDB.
   * @param {string} table  - Supabase table name
   * @param {string} rowId  - Row primary key
   * @param {object} data   - Columns to update
   * @returns {Promise<{ error: object|null }>}
   */
  const queueUpdate = useCallback(async (table, rowId, data) => {
    if (!navigator.onLine) {
      await enqueue({ table, rowId, data, ts: Date.now() })
      pendingRef.current += 1
      return { error: null } // optimistic — no error shown to user
    }

    const { error } = await supabase.from(table).update(data).eq('id', rowId)
    if (error) {
      console.warn('[OfflineSync] live save failed, queuing:', error.message)
      await enqueue({ table, rowId, data, ts: Date.now() })
      pendingRef.current += 1
      return { error }
    }
    return { error: null }
  }, [])

  return { queueUpdate, isOnline: navigator.onLine }
}
