import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabaseClient';
import PixelHeart from '../components/PixelHeart';

const TODAY = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const MAX_FILE_BYTES = 50 * 1024 * 1024; // Supabase free plan hard caps uploads at 50MB
const BUCKET = 'letter-attachments';

function autoGrow(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

function kindOf(file) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'file';
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function LetterEditorScreen({ onExit }) {
  const [title, setTitle] = useState('');
  const [dateDisplay, setDateDisplay] = useState(TODAY);
  const [body, setBody] = useState('');
  const [signoff, setSignoff] = useState('Yours,');
  const [signature, setSignature] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadLabel, setUploadLabel] = useState('');
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);

  const notConfigured = !supabase;

  const handleFilesChosen = (event) => {
    const chosen = Array.from(event.target.files || []);
    event.target.value = '';
    const accepted = [];
    const rejected = [];
    chosen.forEach((file) => {
      if (file.size > MAX_FILE_BYTES) {
        rejected.push(file.name);
        return;
      }
      const kind = kindOf(file);
      accepted.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        kind,
        previewUrl: kind !== 'file' ? URL.createObjectURL(file) : null,
      });
    });
    if (accepted.length) setPendingFiles((prev) => [...prev, ...accepted]);
    if (rejected.length) {
      setErrorMessage(`Too big (max 50MB), skipped: ${rejected.join(', ')}`);
    }
  };

  const removePendingFile = (id) => {
    setPendingFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !dateDisplay.trim() || !body.trim() || !signature.trim()) return;
    if (notConfigured) return;

    setStatus('saving');
    setErrorMessage('');

    const attachments = [];
    for (let i = 0; i < pendingFiles.length; i += 1) {
      const { file, kind } = pendingFiles[i];
      setUploadLabel(`Uploading ${i + 1}/${pendingFiles.length}...`);
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      // eslint-disable-next-line no-await-in-loop
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) {
        setStatus('idle');
        setUploadLabel('');
        setErrorMessage(`Couldn't upload ${file.name}: ${uploadError.message}`);
        return;
      }
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      attachments.push({ name: file.name, kind, url: urlData.publicUrl });
    }
    setUploadLabel('');

    const { error } = await supabase.from('letters').insert({
      title: title.trim(),
      date_display: dateDisplay.trim(),
      body: body.trim(),
      closing: `${signoff.trim()}\n${signature.trim()}`,
      attachments,
    });

    if (error) {
      setStatus('idle');
      setErrorMessage(error.message);
      return;
    }

    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#ff6b9d', '#ffd93d', '#ff9edb', '#ffffff'],
      shapes: ['square'],
      scalar: 1.2,
    });
    setStatus('saved');
  };

  const handleWriteAnother = () => {
    setTitle('');
    setDateDisplay(TODAY);
    setBody('');
    setSignoff('Yours,');
    setSignature('');
    pendingFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setPendingFiles([]);
    setStatus('idle');
  };

  if (status === 'saved') {
    return (
      <div className="letter-detail-screen">
        <motion.div
          className="editor-success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <PixelHeart size={44} color="var(--pink)" />
          <h1 className="editor-success-title">Saved!</h1>
          <p className="editor-success-body">
            Your letter is tucked away safely in the Letters archive, just the way you wrote it.
          </p>
          <button type="button" className="pixel-button" onClick={handleWriteAnother}>
            Write Another
          </button>
          {onExit && (
            <button type="button" className="editor-exit-link" onClick={onExit}>
              Back to Letters
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="letter-detail-screen">
      {onExit && (
        <button type="button" className="letter-detail-exit" onClick={onExit} aria-label="Back to letters">
          &times;
        </button>
      )}

      <form className="letter-detail-paper letter-editor-paper" onSubmit={handleSubmit}>
        <div className="letter-wax-seal" aria-hidden="true">
          &#10084;
        </div>

        {notConfigured && (
          <p className="editor-inline-warning">
            Not connected yet &mdash; ask him to finish setup before you write, or this won't save.
          </p>
        )}

        <input
          className="letter-eyebrow letter-field"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title..."
          required
        />

        <input
          className="letter-date letter-field"
          type="text"
          value={dateDisplay}
          onChange={(e) => setDateDisplay(e.target.value)}
          placeholder="October 12, 2026"
          required
        />

        <textarea
          ref={bodyRef}
          className="letter-paragraph letter-field letter-field-body"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            autoGrow(e.target);
          }}
          placeholder={'Write from the heart...\n\nLeave a blank line between paragraphs. Wrap a word in *asterisks* for emphasis.'}
          rows={6}
          required
        />

        <div className="editor-attachments">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFilesChosen}
            className="editor-file-input"
            id="editor-file-input"
          />
          <label htmlFor="editor-file-input" className="editor-attach-button">
            + Attach photos / videos / files
          </label>

          {pendingFiles.length > 0 && (
            <div className="editor-attachment-list">
              {pendingFiles.map((item) => (
                <div key={item.id} className="editor-attachment-chip">
                  {item.kind === 'image' && <img src={item.previewUrl} alt={item.file.name} />}
                  {item.kind === 'video' && <video src={item.previewUrl} muted />}
                  {item.kind === 'file' && <span className="editor-attachment-file-icon">&#128206;</span>}
                  <span className="editor-attachment-name">{item.file.name}</span>
                  <span className="editor-attachment-size">{formatBytes(item.file.size)}</span>
                  <button
                    type="button"
                    className="editor-attachment-remove"
                    onClick={() => removePendingFile(item.id)}
                    aria-label={`Remove ${item.file.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          className="letter-signoff letter-field"
          type="text"
          value={signoff}
          onChange={(e) => setSignoff(e.target.value)}
          placeholder="Yours,"
          required
        />

        <input
          className="letter-signature letter-field"
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Charmy"
          required
        />

        {errorMessage && <p className="editor-error">{errorMessage}</p>}

        <button type="submit" className="pixel-button letter-editor-submit" disabled={status === 'saving' || notConfigured}>
          {status === 'saving' ? uploadLabel || 'Saving...' : 'Save Letter'}
        </button>
      </form>
    </div>
  );
}
