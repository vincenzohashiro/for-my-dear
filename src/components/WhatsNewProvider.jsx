import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchWrittenLetters } from '../content/writtenLetters';
import { WhatsNewContext, collectItems, isNew, itemTime, loadStore, saveStore } from '../lib/whatsNew';

// Tracks what's new on the site for this device and lets any screen ask
// "is this new?", mark things as seen, or deep-link from the bell.
export default function WhatsNewProvider({ children, onNavigate, refreshKey }) {
  const [writtenLetters, setWrittenLetters] = useState([]);
  const [lettersLoaded, setLettersLoaded] = useState(false);
  const [store, setStore] = useState(loadStore);
  const [sessionStart] = useState(() => Date.now());
  const [pending, setPending] = useState(null);

  useEffect(() => {
    let live = true;
    fetchWrittenLetters().then((letters) => {
      if (!live) return;
      setWrittenLetters(letters);
      setLettersLoaded(true);
    });
    return () => {
      live = false;
    };
  }, [refreshKey]);

  const items = useMemo(() => collectItems(writtenLetters), [writtenLetters]);

  // Persist when undated things (photos, older games) were first noticed on this device.
  useEffect(() => {
    const known = {};
    items.forEach((item) => {
      if (item.time == null && !(item.key in store.known)) known[item.key] = itemTime(item, store, sessionStart);
    });
    saveStore({ ...store, known: { ...store.known, ...known } });
  }, [items, store, sessionStart]);

  const markSeen = useCallback((keys) => {
    if (!keys.length) return;
    setStore((current) => {
      const seen = new Set(current.seen);
      if (keys.every((k) => seen.has(k))) return current;
      keys.forEach((k) => seen.add(k));
      return { ...current, seen: [...seen] };
    });
  }, []);

  const clearPending = useCallback(() => setPending(null), []);

  const value = useMemo(() => {
    const seenSet = new Set(store.seen);
    const newItems = items
      .filter((item) => isNew(item, store, seenSet, sessionStart))
      .sort((a, b) => itemTime(b, store, sessionStart) - itemTime(a, store, sessionStart));
    const newKeys = new Set(newItems.map((item) => item.key));
    return {
      writtenLetters,
      lettersLoaded,
      newItems,
      isNewKey: (key) => newKeys.has(key),
      countFor: (step, id) => newItems.filter((item) => item.step === step && (id == null || item.id === id)).length,
      markSeen,
      markAllSeen: () => markSeen(newItems.map((item) => item.key)),
      // The bell opens the exact letter, chapter, gallery or game.
      openItem: (item) => {
        setPending({ kind: item.kind, id: item.id });
        onNavigate(item.step);
      },
      pendingId: (kind) => (pending?.kind === kind ? pending.id : null),
      clearPending,
    };
  }, [items, store, sessionStart, writtenLetters, lettersLoaded, markSeen, clearPending, onNavigate, pending]);

  return <WhatsNewContext.Provider value={value}>{children}</WhatsNewContext.Provider>;
}
