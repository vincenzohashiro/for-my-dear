import PixelSprite from './PixelSprite';
import { HEART_GRID } from '../pixelGrids';

export default function PixelHeart({ size = 28, color = 'currentColor', className }) {
  return <PixelSprite grid={HEART_GRID} size={size} color={color} className={className} />;
}
