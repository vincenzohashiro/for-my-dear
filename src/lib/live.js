import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { PLAYERS } from './scoreboard';

// There are only ever two players, so everyone shares one room: no codes to swap.
const CHANNEL = 'ftd-live';

export const LiveContext = createContext(null);
export const useLive = () => useContext(LiveContext);

export function useLiveChannel(player) {
  const [status, setStatus] = useState(supabase ? 'connecting' : 'offline');
  const [presence, setPresence] = useState({});
  const channelRef = useRef(null);
  const handlers = useRef(new Map());

  useEffect(() => {
    if (!supabase || !player) return undefined;
    const channel = supabase.channel(CHANNEL, {
      config: { broadcast: { self: false }, presence: { key: player } },
    });

    channel.on('broadcast', { event: 'msg' }, ({ payload }) => {
      handlers.current.get(payload.type)?.forEach((fn) => fn(payload));
    });
    channel.on('presence', { event: 'sync' }, () => setPresence({ ...channel.presenceState() }));
    channel.subscribe((state) => {
      if (state === 'SUBSCRIBED') {
        setStatus('online');
        channel.track({ joinedAt: Date.now() });
      } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT' || state === 'CLOSED') {
        setStatus('offline');
      }
    });
    channelRef.current = channel;

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [player]);

  const send = useCallback(
    (type, data = {}) => {
      channelRef.current?.send({ type: 'broadcast', event: 'msg', payload: { ...data, type, from: player } });
    },
    [player]
  );

  const on = useCallback((type, fn) => {
    if (!handlers.current.has(type)) handlers.current.set(type, new Set());
    handlers.current.get(type).add(fn);
    return () => handlers.current.get(type)?.delete(fn);
  }, []);

  const opponent = PLAYERS.find((p) => p.id !== player)?.id;
  return {
    status,
    player,
    opponent,
    opponentHere: Boolean(presence[opponent]?.length),
    // Two devices both signed in under the same name would confuse every game.
    sameNameTwice: (presence[player]?.length || 0) > 1,
    // Vinnie's device settles anything random or contested so both screens agree.
    isHost: player === PLAYERS[0].id,
    send,
    on,
  };
}

// Subscribes to one message type for the lifetime of the component.
export function useLiveEvent(type, handler) {
  const { on } = useLive();
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });
  useEffect(() => on(type, (payload) => latest.current(payload)), [on, type]);
}
