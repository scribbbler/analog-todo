import type { CardData } from '../types';
import Card from './Card';

interface ArchiveProps {
  cards: CardData[];
  open: boolean;
  onToggle: () => void;
}

function stackRotation(index: number): string {
  const angles = [0, 1.5, -1.5, 2.5, -2.5];
  return `rotate(${angles[index % 5]}deg)`;
}

export default function Archive({ cards, open, onToggle }: ArchiveProps) {
  const visible = cards.slice(0, 5);
  const remaining = cards.length - visible.length;

  return (
    <>
      {/* Toggle tab */}
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-stone-900 text-stone-400
                   text-xs uppercase tracking-widest px-2 py-6 rounded-l-lg cursor-pointer
                   hover:text-[#B8860B] transition-colors"
        style={{ writingMode: 'vertical-rl' }}
      >
        Archive {cards.length > 0 && `(${cards.length})`}
      </button>

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-stone-900/95 backdrop-blur-sm
                    z-40 transition-transform duration-300 overflow-y-auto p-6
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <h2 className="text-stone-400 text-xs uppercase tracking-widest mb-6">
          Past Today Cards
        </h2>

        {cards.length === 0 && (
          <p className="text-stone-600 text-sm">No archived cards yet.</p>
        )}

        {/* Stacked preview */}
        {visible.length > 0 && (
          <div className="relative h-[420px] mb-8">
            {visible.map((card, i) => (
              <div
                key={card.id}
                className="absolute inset-x-0 mx-auto w-52 transition-transform"
                style={{
                  transform: `${stackRotation(i)} translateY(${i * 8}px)`,
                  zIndex: visible.length - i,
                }}
              >
                <Card card={card} onUpdate={() => {}} readonly />
              </div>
            ))}
            {remaining > 0 && (
              <div className="absolute bottom-0 inset-x-0 text-center
                              text-stone-500 text-xs">
                +{remaining} more
              </div>
            )}
          </div>
        )}

        {/* Full list */}
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.id} className="transform scale-75 origin-top-left">
              <Card card={card} onUpdate={() => {}} readonly />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
