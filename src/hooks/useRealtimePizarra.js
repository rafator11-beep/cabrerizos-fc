import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Subscribes to Supabase Realtime for a specific play row.
 *
 * When the admin saves a play from any device, all subscribers
 * (players watching in the locker room) receive the update instantly.
 *
 * Prerequisite in Supabase dashboard:
 *   ALTER TABLE plays REPLICA IDENTITY FULL;
 *   -- Then enable Realtime for "plays" table in Table Editor > Replication
 *
 * @param {string|null} playId - Row id to watch
 * @param {(play: object) => void} onUpdate - Called with the full updated row
 * @returns {{ isConnected: boolean }}
 */
export function useRealtimePizarra(playId, onUpdate) {
  const channelRef = useRef(null)
  const onUpdateRef = useRef(onUpdate)

  // Keep ref stable so the effect doesn't re-subscribe on every render
  useEffect(() => { onUpdateRef.current = onUpdate }, [onUpdate])

  useEffect(() => {
    if (!playId) return

    const channelName = `play:${playId}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'plays',
          filter: `id=eq.${playId}`,
        },
        (payload) => {
          if (payload.new) onUpdateRef.current(payload.new)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [playId])
}

/**
 * Broadcasts the admin's canvas position to all subscribers on the same channel.
 * Call this on every token move for true "live cursor" experience.
 *
 * @param {string} playId
 * @returns {{ broadcast: (event: string, payload: object) => void }}
 */
export function useRealtimeBroadcast(playId, opts = {}) {
  const channelRef = useRef(null)
  const prefix = opts?.prefix || 'broadcast'

  useEffect(() => {
    if (!playId) return

    const channel = supabase.channel(`${prefix}:${playId}`, {
      config: { broadcast: { self: false } },
    })
    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [playId])

  const broadcast = useCallback((event, payload) => {
    channelRef.current?.send({ type: 'broadcast', event, payload })
  }, [])

  return { broadcast }
}

/**
 * Receives "draft" updates broadcasted by the admin while editing.
 * This provides near real-time viewing without writing to the DB on every move.
 *
 * @param {string|null} playId
 * @param {(payload: any) => void} onDraft
 */
export function useRealtimeDraft(playId, onDraft) {
  const channelRef = useRef(null)
  const onDraftRef = useRef(onDraft)

  useEffect(() => { onDraftRef.current = onDraft }, [onDraft])

  useEffect(() => {
    if (!playId) return

    const channel = supabase.channel(`draft:${playId}`, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'draft' }, (payload) => {
        onDraftRef.current?.(payload?.payload)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [playId])
}
