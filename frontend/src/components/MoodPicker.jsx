import './mood.css';
import MoodFace from './MoodFace';
import { MOODS } from '../lib/emotion';

export default function MoodPicker({ onPick, selected }) {
  return (
    <div className="seats" role="group" aria-label="Elegí tu ánimo a mano">
      {Object.entries(MOODS).map(([key, m]) => (
        <button
          key={key}
          className={selected === key ? 'seat on' : 'seat'}
          style={{ '--seat': m.color }}
          aria-pressed={selected === key}
          onClick={() => onPick({ emotion: key, confidence: null })}
        >
          <MoodFace emotion={key} className="face" />
          {m.label}
        </button>
      ))}
    </div>
  );
}