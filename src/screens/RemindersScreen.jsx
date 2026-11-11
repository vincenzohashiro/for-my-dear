import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSprite from '../components/PixelSprite';
import { NewBadge } from '../components/WhatsNewBell';
import { HEART_GRID } from '../pixelGrids';
import { PLAYERS } from '../lib/scoreboard';
import { CATEGORIES, addReminder, categoryLabel, fetchReminders, removeReminder } from '../lib/reminders';
import { useWhatsNew } from '../lib/whatsNew';

const LAST_PROFILE_KEY = 'ftd-reminders-profile';
const KINDS = [
  { id: 'like', title: 'Likes', hint: 'things that make them happy', placeholder: 'e.g. iced coffee, rainy days...' },
  { id: 'dislike', title: 'Dislikes', hint: 'things to avoid', placeholder: 'e.g. pineapple on pizza...' },
];

function lastProfile() {
  try {
    return localStorage.getItem(LAST_PROFILE_KEY);
  } catch {
    return null;
  }
}

export default function RemindersScreen({ onBack }) {
  const { pendingId, clearPending, markSeen, countFor } = useWhatsNew();
  // Opened from the bell → that person's profile; otherwise whoever was viewed last.
  const [person, setPerson] = useState(() => pendingId('reminder') || lastProfile() || PLAYERS[1].id);
  const [rows, setRows] = useState([]);
  const [shared, setShared] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    clearPending();
  }, [clearPending]);

  useEffect(() => {
    let live = true;
    fetchReminders().then((res) => {
      if (!live) return;
      setRows(res.rows);
      setShared(res.shared);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LAST_PROFILE_KEY, person);
    } catch {
      /* ignore storage failures */
    }
  }, [person]);

  // Looking at a profile counts as seeing everything on it.
  useEffect(() => {
    markSeen(rows.filter((r) => r.person === person).map((r) => `reminder:${r.id}`));
  }, [rows, person, markSeen]);

  const add = async (kind, text, category) => {
    const row = await addReminder({ person, kind, category, text });
    setRows((current) => [...current, row]);
  };

  const remove = async (id) => {
    if (await removeReminder(id)) setRows((current) => current.filter((r) => r.id !== id));
  };

  const mine = rows.filter((r) => r.person === person);
  const visible = filter === 'all' ? mine : mine.filter((r) => r.category === filter);
  const usedCategories = CATEGORIES.filter((c) => mine.some((r) => r.category === c.id));
  const profile = PLAYERS.find((p) => p.id === person);

  return (
    <div className="reminders-screen">
      <div className="reminders-content">
        <header className="reminders-header">
          <h1 className="reminders-title">Reminders</h1>
          <p className="reminders-subtitle">little things to remember about each other</p>
        </header>

        <div className="reminders-profiles">
          {PLAYERS.map((p) => {
            const theirs = rows.filter((r) => r.person === p.id);
            const likes = theirs.filter((r) => r.kind === 'like').length;
            return (
              <motion.button
                key={p.id}
                type="button"
                className={`reminders-profile${person === p.id ? ' active' : ''}`}
                style={{ '--player-color': p.color }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setPerson(p.id);
                  setFilter('all');
                }}
              >
                <NewBadge count={person === p.id ? 0 : countFor('reminders', p.id)} className="corner" />
                <span className="reminders-avatar">
                  <PixelSprite grid={HEART_GRID} size={34} color="var(--player-color)" />
                </span>
                <span className="reminders-profile-name">{p.id}</span>
                <span className="reminders-profile-stats">
                  {likes} likes &middot; {theirs.length - likes} dislikes
                </span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={person}
            className="reminders-board"
            style={{ '--player-color': profile.color }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="reminders-board-title">{person}&apos;s profile</h2>

            {usedCategories.length > 1 && (
              <div className="reminders-filters">
                {[{ id: 'all', label: 'All' }, ...usedCategories].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`shelf-chip${filter === c.id ? ' active' : ''}`}
                    onClick={() => setFilter(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <p className="reminders-empty">loading...</p>
            ) : (
              <div className="reminders-columns">
                {KINDS.map((kind) => (
                  <ReminderColumn
                    key={kind.id}
                    kind={kind}
                    person={person}
                    items={visible.filter((r) => r.kind === kind.id)}
                    onAdd={(text, category) => add(kind.id, text, category)}
                    onRemove={remove}
                  />
                ))}
              </div>
            )}

            {!loading && !shared && (
              <p className="reminders-note">saved on this device only for now</p>
            )}
          </motion.section>
        </AnimatePresence>

        <button type="button" className="reminders-back" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function ReminderColumn({ kind, person, items, onAdd, onRemove }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('food');
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || saving) return;
    setSaving(true);
    await onAdd(text, category);
    setText('');
    setSaving(false);
  };

  return (
    <div className={`reminders-column ${kind.id}`}>
      <div className="reminders-column-head">
        <span className="reminders-column-icon" aria-hidden="true">
          {kind.id === 'like' ? '♥' : '✕'}
        </span>
        <span className="reminders-column-title">{kind.title}</span>
        <span className="reminders-column-hint">{kind.hint}</span>
      </div>

      <ul className="reminders-notes">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              className="reminders-note-card"
              style={{ '--tilt': `${i % 2 ? 1.2 : -1.2}deg` }}
              initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: i % 2 ? 1.2 : -1.2 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              <span className="reminders-pin" aria-hidden="true" />
              <span className="reminders-note-text">{item.text}</span>
              <span className="reminders-note-foot">
                <span className="reminders-tag">{categoryLabel(item.category)}</span>
                {confirming === item.id ? (
                  <span className="reminders-confirm">
                    <button type="button" onClick={() => onRemove(item.id)}>
                      remove
                    </button>
                    <button type="button" onClick={() => setConfirming(null)}>
                      keep
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="reminders-remove"
                    aria-label={`remove ${item.text}`}
                    onClick={() => setConfirming(item.id)}
                  >
                    &times;
                  </button>
                )}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
        {items.length === 0 && <li className="reminders-empty">nothing here yet</li>}
      </ul>

      <form className="reminders-add" onSubmit={submit}>
        <input
          className="editor-input reminders-input"
          value={text}
          maxLength={120}
          onChange={(e) => setText(e.target.value)}
          placeholder={kind.placeholder}
          aria-label={`Add something ${person} ${kind.id === 'like' ? 'likes' : 'dislikes'}`}
        />
        <div className="reminders-add-row">
          <select
            className="reminders-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <button type="submit" className="reminders-add-button" disabled={!text.trim() || saving}>
            {saving ? '...' : '+ Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
