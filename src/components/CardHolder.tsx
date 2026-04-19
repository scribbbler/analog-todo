import type { CardData } from '../types';
import Card from './Card';

interface CardHolderProps {
  today: CardData;
  next: CardData;
  someday: CardData;
  onUpdate: (type: 'today' | 'next' | 'someday', card: CardData) => void;
  onNewToday: () => void;
}

export default function CardHolder({ today, next, someday, onUpdate, onNewToday }: CardHolderProps) {
  return (
    <div className="card-holder rounded-2xl p-6 pb-8 flex flex-col items-center gap-6">
      {/* New Today button */}
      <button
        onClick={onNewToday}
        className="self-end text-xs uppercase tracking-widest text-stone-400
                   border border-stone-600 rounded px-3 py-1 cursor-pointer
                   hover:text-[#B8860B] hover:border-[#B8860B] transition-colors"
      >
        New Today
      </button>

      <div className="flex gap-6 flex-wrap justify-center">
        <Card card={today} onUpdate={(c: CardData) => onUpdate('today', c)} />
        <Card card={next} onUpdate={(c: CardData) => onUpdate('next', c)} />
        <Card card={someday} onUpdate={(c: CardData) => onUpdate('someday', c)} />
      </div>
    </div>
  );
}
