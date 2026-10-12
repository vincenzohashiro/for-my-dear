import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabaseClient';
import PixelHeart from '../components/PixelHeart';

const TODAY = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

function autoGrow(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

export default function LetterEditorScreen() {
  const [title, setTitle] = useState('');
  const [dateDisplay, setDateDisplay] = useState(TODAY);
  const [body, setBody] = useState('');
  const [signoff, setSignoff] = useState('Yours,');
  const [signature, setSignature] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const bodyRef = useRef(null);

  const notConfigured = !supabase;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !dateDisplay.trim() || !body.trim() || !signature.trim()) return;
    if (notConfigured) return;

    setStatus('saving');
    setErrorMessage('');

    const { error } = await supabase.from('letters').insert({
      title: title.trim(),
      date_display: dateDisplay.trim(),
      body: body.trim(),
      closing: `${signoff.trim()}\n${signature.trim()}`,
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="letter-detail-screen">
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
          {status === 'saving' ? 'Saving...' : 'Save Letter'}
        </button>
      </form>
    </div>
  );
}
