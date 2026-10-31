import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

const EJS_VERSION = '4.2.3';
const EJS_DATA_PATH = `https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@${EJS_VERSION}/data/`;
const ROM_BUCKET = 'roms';
const MAX_ROM_BYTES = 50 * 1024 * 1024;
const UNLOCK_KEY = 'ftd-emulator-unlocked';
// Shared BIOS used by every saved arcade/Neo Geo game (not a per-game file).
const ARCADE_BIOS_PATH = '_bios__neogeo';

// Games hosted elsewhere that play straight from an embed, no ROM needed.
const EMBED_GAMES = [
  { id: 'mslug3', title: 'Metal Slug 3', system: 'Neo Geo', src: 'https://www.retrogames.cc/embed/9160-metal-slug-3-ngm-2560.html' },
  { id: 'dkong', title: 'Donkey Kong', system: 'Arcade', src: 'https://www.retrogames.cc/embed/8301-donkey-kong-us-set-1.html' },
  { id: 'neobomberman', title: 'Bomberman', system: 'Neo Geo', src: 'https://www.retrogames.cc/embed/9293-neo-bomberman.html' },
  { id: 'adventureisland', title: 'Adventure Island', system: 'NES', src: 'https://www.retrogames.cc/embed/20528-hudson-s-adventure-island-usa.html' },
  { id: 'sf2', title: 'Street Fighter II', system: 'Arcade', src: 'https://www.retrogames.cc/embed/9982-street-fighter-ii-the-world-warrior-910214-etc.html' },
];

// Change this to re-lock the library on every device at once.
const EMULATOR_PASSCODE = 'player2';

const SYSTEMS = [
  { id: 'nes', label: 'NES' },
  { id: 'snes', label: 'SNES' },
  { id: 'gb', label: 'Game Boy' },
  { id: 'gba', label: 'Game Boy Advance' },
  { id: 'segaMD', label: 'Genesis / Mega Drive' },
  { id: 'n64', label: 'Nintendo 64' },
  { id: 'psx', label: 'PlayStation' },
  { id: 'arcade', label: 'Arcade (FBNeo)' },
];

const systemLabel = (id) => SYSTEMS.find((s) => s.id === id)?.label || id;

// Cartridge body color per system label; anything unlisted falls back to purple.
const CART_COLORS = {
  Arcade: 'var(--blue)',
  'Neo Geo': 'var(--ink)',
  NES: 'var(--red)',
  SNES: 'var(--purple)',
  'Game Boy': 'var(--green)',
  'Game Boy Advance': 'var(--teal)',
  'Genesis / Mega Drive': 'var(--night)',
  'Nintendo 64': 'var(--orange)',
  PlayStation: 'var(--wood-dark)',
};
const SAVED_FILTER = 'Saved';
const INSERT_MS = 380;

// Saved roms are stored flat as "<system>__<timestamp>_<filename>" so one
// list() call on the bucket root is enough to rebuild the library.
function parseRomEntry(name) {
  const [system, rest] = name.split('__');
  if (!rest) return null;
  const display = rest.replace(/^\d+_/, '');
  return { path: name, system, display };
}

export default function RetroEmulatorGame({ onBack }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(UNLOCK_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState(false);

  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [uploadSystem, setUploadSystem] = useState('nes');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [hasArcadeBios, setHasArcadeBios] = useState(false);
  const [biosUploadFile, setBiosUploadFile] = useState(null);
  const [biosUploading, setBiosUploading] = useState(false);

  const [localSystem, setLocalSystem] = useState('nes');
  const [localFile, setLocalFile] = useState(null);
  const [localBiosFile, setLocalBiosFile] = useState(null);

  const [running, setRunning] = useState(false);
  const [activeEmbed, setActiveEmbed] = useState(null);
  const [shelfFilter, setShelfFilter] = useState('All');
  const [insertingKey, setInsertingKey] = useState(null);
  const [hintKey, setHintKey] = useState(null);
  const [activeSource, setActiveSource] = useState(null); // { url, system, name }
  const mountRef = useRef(null);
  const objectUrlRef = useRef(null);

  const loadLibrary = async () => {
    if (!supabase) return;
    setLibraryLoading(true);
    const { data, error } = await supabase.storage
      .from(ROM_BUCKET)
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (!error && data) {
      setHasArcadeBios(data.some((item) => item.name === ARCADE_BIOS_PATH));
      setLibrary(
        data
          .filter((item) => item.name !== ARCADE_BIOS_PATH)
          .map((item) => parseRomEntry(item.name))
          .filter(Boolean)
      );
    }
    setLibraryLoading(false);
  };

  useEffect(() => {
    if (unlocked) loadLibrary();
  }, [unlocked]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passInput === EMULATOR_PASSCODE) {
      setUnlocked(true);
      try {
        localStorage.setItem(UNLOCK_KEY, 'true');
      } catch {
        /* ignore storage failures */
      }
    } else {
      setPassError(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !supabase) return;
    if (uploadFile.size > MAX_ROM_BYTES) {
      setUploadError('That file is over the 50MB storage limit.');
      return;
    }
    setUploading(true);
    setUploadError('');
    const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${uploadSystem}__${Date.now()}_${safeName}`;
    const { error } = await supabase.storage.from(ROM_BUCKET).upload(path, uploadFile);
    setUploading(false);
    if (error) {
      setUploadError('Upload failed. Try again.');
      return;
    }
    setUploadFile(null);
    await loadLibrary();
  };

  const handleBiosUpload = async () => {
    if (!biosUploadFile || !supabase) return;
    setBiosUploading(true);
    await supabase.storage.from(ROM_BUCKET).upload(ARCADE_BIOS_PATH, biosUploadFile, { upsert: true });
    setBiosUploading(false);
    setBiosUploadFile(null);
    await loadLibrary();
  };

  const playUrl = (url, system, name, biosUrl) => {
    setActiveSource({ url, system, name, biosUrl });
    setRunning(true);
  };

  const playSavedRom = async (entry) => {
    if (!supabase) return;
    const { data, error } = await supabase.storage
      .from(ROM_BUCKET)
      .createSignedUrl(entry.path, 3600);
    if (error || !data) return;

    let biosUrl;
    if (entry.system === 'arcade' && hasArcadeBios) {
      const biosResult = await supabase.storage
        .from(ROM_BUCKET)
        .createSignedUrl(ARCADE_BIOS_PATH, 3600);
      biosUrl = biosResult.data?.signedUrl;
    }
    playUrl(data.signedUrl, entry.system, entry.display, biosUrl);
  };

  const playLocalFile = () => {
    if (!localFile) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(localFile);
    objectUrlRef.current = objectUrl;
    const biosUrl = localBiosFile ? URL.createObjectURL(localBiosFile) : undefined;
    playUrl(objectUrl, localSystem, localFile.name, biosUrl);
  };

  useEffect(() => {
    if (!running || !activeSource || !mountRef.current) return undefined;

    mountRef.current.innerHTML = '';
    const gameDiv = document.createElement('div');
    gameDiv.id = 'ejs-mount';
    mountRef.current.appendChild(gameDiv);

    window.EJS_player = '#ejs-mount';
    window.EJS_core = activeSource.system;
    window.EJS_gameUrl = activeSource.url;
    window.EJS_pathtodata = EJS_DATA_PATH;
    window.EJS_gameName = activeSource.name;
    window.EJS_startOnLoaded = true;
    if (activeSource.biosUrl) {
      window.EJS_biosUrl = activeSource.biosUrl;
    } else {
      delete window.EJS_biosUrl;
    }

    const script = document.createElement('script');
    script.src = `${EJS_DATA_PATH}loader.js`;
    script.async = true;
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const stopEmulator = () => {
    setActiveEmbed(null);
    setRunning(false);
    setActiveSource(null);
    if (mountRef.current) mountRef.current.innerHTML = '';
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setLocalFile(null);
    setLocalBiosFile(null);
    document.querySelectorAll('script[src*="EmulatorJS"]').forEach((el) => el.remove());
  };

  const shelf = [
    ...EMBED_GAMES.map((game) => ({
      key: `embed-${game.id}`,
      title: game.title,
      system: game.system,
      saved: false,
      play: () => setActiveEmbed(game),
    })),
    ...library.map((entry) => ({
      key: `rom-${entry.path}`,
      title: entry.display.replace(/\.[^.]+$/, ''),
      system: systemLabel(entry.system),
      saved: true,
      play: () => playSavedRom(entry),
    })),
  ];
  const shelfFilters = ['All', ...new Set(shelf.map((g) => g.system)), ...(library.length ? [SAVED_FILTER] : [])];
  const visibleShelf = shelf.filter((g) =>
    shelfFilter === 'All' ? true : shelfFilter === SAVED_FILTER ? g.saved : g.system === shelfFilter
  );

  // Let the cartridge "slide into the console" before the game takes over.
  const insertCartridge = (game) => {
    if (insertingKey) return;
    setInsertingKey(game.key);
    setTimeout(() => {
      setInsertingKey(null);
      game.play();
    }, INSERT_MS);
  };

  const surpriseMe = () => {
    if (!visibleShelf.length || insertingKey || hintKey) return;
    const pick = visibleShelf[Math.floor(Math.random() * visibleShelf.length)];
    setHintKey(pick.key);
    setTimeout(() => {
      setHintKey(null);
      insertCartridge(pick);
    }, 600);
  };

  if (!unlocked) {
    return (
      <motion.div
        className="minigame-screen emulator-screen"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <form className="emulator-picker" onSubmit={handleUnlock}>
          <p className="pixel-body emulator-note">This corner is just for us. Enter the passcode to get in.</p>
          <input
            type="password"
            className="editor-input emulator-select"
            value={passInput}
            onChange={(e) => {
              setPassInput(e.target.value);
              setPassError(false);
            }}
            placeholder="passcode"
            autoFocus
          />
          {passError && <p className="pixel-body emulator-error">Not quite — try again.</p>}
          <button type="submit" className="pixel-button emulator-start">
            Unlock
          </button>
        </form>
        <div className="chess-footer">
          <button type="button" className="minigame-exit" onClick={onBack}>
            Back
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="minigame-screen emulator-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {activeEmbed ? (
        <div className="emulator-embed">
          <iframe
            src={activeEmbed.src}
            title={activeEmbed.title}
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            allow="cross-origin-isolated; fullscreen; gamepad"
          />
        </div>
      ) : !running ? (
        <div className="emulator-picker emulator-picker-wide">
          <h3 className="editor-label emulator-section-label">Game Shelf</h3>
          <div className="shelf-controls">
            {shelfFilters.map((f) => (
              <button
                key={f}
                type="button"
                className={`shelf-chip${shelfFilter === f ? ' active' : ''}`}
                onClick={() => setShelfFilter(f)}
              >
                {f}
              </button>
            ))}
            <motion.button
              type="button"
              className="shelf-chip shelf-surprise"
              whileTap={{ scale: 0.9 }}
              onClick={surpriseMe}
            >
              ? Surprise me
            </motion.button>
          </div>

          <div className="cart-grid">
            {visibleShelf.map((game, index) => (
              <motion.button
                key={game.key}
                type="button"
                className={`cart${hintKey === game.key ? ' cart-picked' : ''}`}
                style={{ '--cart-color': CART_COLORS[game.system] || 'var(--purple)' }}
                initial={{ opacity: 0, y: 16 }}
                animate={
                  insertingKey === game.key
                    ? { opacity: 0, y: 40, scaleY: 0.6, transition: { duration: INSERT_MS / 1000 } }
                    : { opacity: 1, y: 0, scaleY: 1, transition: { delay: index * 0.05, duration: 0.2 } }
                }
                whileHover={{ y: -8, rotate: index % 2 ? 2 : -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => insertCartridge(game)}
              >
                <span className="cart-grip" aria-hidden="true" />
                <span className="cart-label">
                  <span className="cart-title">{game.title}</span>
                </span>
                <span className="cart-system">
                  {game.system}
                  {game.saved && <span className="cart-saved">saved</span>}
                </span>
                <span className="cart-insert" aria-hidden="true">
                  &#9654; insert
                </span>
              </motion.button>
            ))}
          </div>
          {libraryLoading && <p className="pixel-body emulator-note">Loading your saved games&hellip;</p>}

          <div className="emulator-divider" />

          {supabase && (
            <>
              <h3 className="editor-label emulator-section-label">Add to Library</h3>
              <p className="pixel-body emulator-note">
                Saved games show up on the shelf on any device. Games played without saving never leave your
                browser.
              </p>
              <select
                className="editor-input emulator-select"
                value={uploadSystem}
                onChange={(e) => setUploadSystem(e.target.value)}
              >
                {SYSTEMS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <input
                type="file"
                id="emulator-upload-input"
                className="editor-file-input"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="emulator-upload-input" className="editor-attach-button emulator-file-button">
                {uploadFile ? uploadFile.name : '+ Choose ROM to upload'}
              </label>
              {uploadError && <p className="pixel-body emulator-error">{uploadError}</p>}
              <button
                type="button"
                className="pixel-button emulator-start"
                disabled={!uploadFile || uploading}
                onClick={handleUpload}
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>

              <h3 className="editor-label emulator-section-label">Arcade / Neo Geo BIOS</h3>
              <p className="pixel-body emulator-note">
                {hasArcadeBios
                  ? 'A shared BIOS is saved and will be used automatically for arcade games.'
                  : 'Some arcade games (Neo Geo especially) need a BIOS file alongside the ROM. Upload one here once.'}
              </p>
              <input
                type="file"
                id="emulator-bios-upload-input"
                className="editor-file-input"
                onChange={(e) => setBiosUploadFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="emulator-bios-upload-input" className="editor-attach-button emulator-file-button">
                {biosUploadFile ? biosUploadFile.name : hasArcadeBios ? '+ Replace BIOS file' : '+ Choose BIOS file'}
              </label>
              <button
                type="button"
                className="pixel-button emulator-start"
                disabled={!biosUploadFile || biosUploading}
                onClick={handleBiosUpload}
              >
                {biosUploading ? 'Uploading…' : 'Save BIOS'}
              </button>

              <div className="emulator-divider" />
            </>
          )}

          <h3 className="editor-label emulator-section-label">Play Without Saving</h3>
          <select
            className="editor-input emulator-select"
            value={localSystem}
            onChange={(e) => setLocalSystem(e.target.value)}
          >
            {SYSTEMS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            type="file"
            id="emulator-file-input"
            className="editor-file-input"
            onChange={(e) => setLocalFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="emulator-file-input" className="editor-attach-button emulator-file-button">
            {localFile ? localFile.name : '+ Choose ROM file'}
          </label>
          <input
            type="file"
            id="emulator-local-bios-input"
            className="editor-file-input"
            onChange={(e) => setLocalBiosFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="emulator-local-bios-input" className="editor-attach-button emulator-file-button">
            {localBiosFile ? localBiosFile.name : '+ BIOS file (if needed)'}
          </label>
          <button
            type="button"
            className="pixel-button emulator-start"
            disabled={!localFile}
            onClick={playLocalFile}
          >
            Start
          </button>
        </div>
      ) : (
        <div className="emulator-mount" ref={mountRef} />
      )}

      <div className="chess-footer">
        <button type="button" className="minigame-exit" onClick={onBack}>
          Back
        </button>
        {(running || activeEmbed) && (
          <button type="button" className="editor-exit-link" onClick={stopEmulator}>
            Load a different game
          </button>
        )}
      </div>
    </motion.div>
  );
}
