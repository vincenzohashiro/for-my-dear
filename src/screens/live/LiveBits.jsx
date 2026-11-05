import { useLive } from '../../lib/live';
import { PLAYERS } from '../../lib/scoreboard';

// Shows who's in the room; used at the top of every live screen.
export function LivePresence() {
  const live = useLive();
  return (
    <div className="live-presence">
      {PLAYERS.map((p) => {
        const here = p.id === live.player ? live.status === 'online' : live.opponentHere;
        return (
          <span key={p.id} className={`live-pill${here ? ' here' : ''}`} style={{ '--player-color': p.color }}>
            <span className="live-dot" aria-hidden="true" />
            {p.id}
            {p.id === live.player && ' (you)'}
          </span>
        );
      })}
    </div>
  );
}

// Shown over a live game when the other person drops out mid-match.
export function OpponentGone() {
  const live = useLive();
  if (live.opponentHere) return null;
  return <p className="live-waiting">waiting for {live.opponent} to come back...</p>;
}
