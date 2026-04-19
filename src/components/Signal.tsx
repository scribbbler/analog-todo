import { SIGNAL_GLYPHS, SIGNAL_ORDER, type TaskSignal } from '../types';

interface SignalProps {
  value: TaskSignal;
  onChange: (next: TaskSignal) => void;
}

export default function Signal({ value, onChange }: SignalProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = SIGNAL_ORDER.indexOf(value);
    onChange(SIGNAL_ORDER[(idx + 1) % SIGNAL_ORDER.length]);
  };

  return (
    <button
      onClick={handleClick}
      className="signal-btn w-5 h-5 flex items-center justify-center text-sm
                 cursor-pointer select-none shrink-0 transition-transform
                 hover:scale-125 active:scale-95"
      aria-label={`Status: ${value}. Click to change.`}
    >
      <span key={value} className="signal-stamp inline-block">
        {SIGNAL_GLYPHS[value]}
      </span>
    </button>
  );
}
