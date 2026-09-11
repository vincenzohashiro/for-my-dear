import menuBg from '../assets/MenuBG.png';
import Fireflies from './Fireflies';
import CozyEffects from './CozyEffects';

export default function GameWorldBackdrop() {
  return (
    <div className="world-backdrop" aria-hidden="true">
      <img src={menuBg} alt="" className="world-backdrop-image" />
      <CozyEffects />
      <Fireflies />
    </div>
  );
}
