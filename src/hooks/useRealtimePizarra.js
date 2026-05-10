import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * usePizarraEngine: The unified realtime engine for the tactical board.
 * Consolidates DB sync, broadcast sending (live cursors), and draft receiving.
 */
export function usePizarraEngine(playId, { onUpdate, onDraft }) {
  const channelRef = useRef(null)
  const lastBroadcastRef = useRef(0)
  const [isConnected, setIsConnected] = useState(false)

  // Cache callbacks in refs to avoid subscription loops
  const callbacks = useRef({ onUpdate, onDraft })
  useEffect(() => { callbacks.current = { onUpdate, onDraft } }, [onUpdate, onDraft])

  useEffect(() => {
    if (!playId) { setIsConnected(false); return }

    // Unified channel for both Postgres changes and Broadcasts
    const channel = supabase.channel(`pizarra:${playId}`, {
      config: { broadcast: { self: false } },
    })

    channel
      // 1. Listen for DB updates (Postgres Changes)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'plays', filter: `id=eq.${playId}` },
        (payload) => { if (payload.new) callbacks.current.onUpdate?.(payload.new) }
      )
      // 2. Listen for "draft" broadcasts (Live cursor/ghost moves)
      .on('broadcast', { event: 'draft' }, (msg) => {
        callbacks.current.onDraft?.(msg?.payload)
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [playId])

  /**
   * Throttled broadcast to avoid flooding the network on rapid drags.
   * Ensures fluid performance on mid-range mobiles.
   */
  const broadcastDraft = useCallback((payload) => {
    const now = Date.now()
    if (now - lastBroadcastRef.current < 50) return // 20fps cap for broadcasts
    
    lastBroadcastRef.current = now
    channelRef.current?.send({
      type: 'broadcast',
      event: 'draft',
      payload
    })
  }, [])

  return { isConnected, broadcastDraft }
}

// Keep legacy exports for backward compatibility if needed, but mapped to the new engine
export function useRealtimePizarra(playId, onUpdate) {
  const { isConnected } = usePizarraEngine(playId, { onUpdate })
  return { isConnected }
}

export function useRealtimeBroadcast(playId) {
  const { broadcastDraft } = usePizarraEngine(playId, {})
  return { broadcast: (event, payload) => broadcastDraft(payload) }
}

export function useRealtimeDraft(playId, onDraft) {
  usePizarraEngine(playId, { onDraft })
}

