import { useState } from 'react';
import type { CardData, CardType } from '../types';
import Card from './Card';

interface CardHolderProps {
  today: CardData;
  next: CardData;
  someday: CardData;
  onUpdate: (type: CardType, card: CardData) => void;
  onNewToday: () => void;
}

const STACK_ORDER: CardType[] = ['today', 'next', 'someday'];

const LABELS: Record<CardType, string> = {
  today: 'Today',
  next: 'Next',
  someday: 'Someday',
};

export default function CardHolder({ today, next, someday, onUpdate, onNewToday }: CardHolderProps) {
  const [active, setActive] = useState<CardType>('today');

  const cards: Record<CardType, CardData> = { today, next, someday };

  // Build stacking: active card at front (z-30), others behind with offset
  const ordered = [active, ...STACK_ORDER.filter((t) => t !== active)];

  return (
    <div className="card-holder rounded-2xl p-8 pb-10 flex flex-col items-center gap-4">
      {/* New Today button */}
      <button
        onClick={onNewToday}
        className="self-end text-xs uppercase tracking-widest text-stone-400
                   border border-stone-600 rounded px-3 py-1 cursor-pointer
                   hover:text-[#B8860B] hover:border-[#B8860B] transition-colors"
      >
        New Today
      </button>

      {/* Card stack */}
      <div className="relative w-72 aspect-[3/5]">
        {ordered.map((type, i) => {
          const isActive = i === 0;
          // Back cards offset to the right and up, peeking out
          const xOffset = i * 28;
          const yOffset = i * -16;
          const zIndex = 30 - i * 10;

          return (
            <div
              key={type}
              className="absolute inset-0 transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${xOffset}px) translateY(${yOffset}px)`,
                zIndex,
              }}
            >
              {/* Clickable tab on non-active cards */}
              {!isActive && (
                <button
                  onClick={() => setActive(type)}
                  className="absolute -top-0 right-0 z-10 px-3 py-1
                             text-[10px] uppercase tracking-widest font-medium
                             cursor-pointer transition-colors
                             text-stone-400 hover:text-[#B8860B]"
                >
                  {LABELS[type]}
                </button>
              )}
              <Card
                card={cards[type]}
                onUpdate={(c: CardData) => onUpdate(type, c)}
                readonly={!isActive}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
