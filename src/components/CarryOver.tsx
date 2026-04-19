import { useState } from 'react';
import { SIGNAL_GLYPHS, type Task } from '../types';

type Destination = 'today' | 'next' | 'drop';

interface CarryOverProps {
  tasks: Task[];
  onConfirm: (decisions: Map<string, Destination>) => void;
  onCancel: () => void;
}

export default function CarryOver({ tasks, onConfirm, onCancel }: CarryOverProps) {
  const [decisions, setDecisions] = useState<Map<string, Destination>>(
    () => new Map(tasks.map((t) => [t.id, 'today' as Destination])),
  );

  const setAll = (dest: Destination) => {
    setDecisions(new Map(tasks.map((t) => [t.id, dest])));
  };

  const toggle = (id: string) => {
    setDecisions((prev) => {
      const next = new Map(prev);
      const cur = next.get(id) ?? 'today';
      const order: Destination[] = ['today', 'next', 'drop'];
      next.set(id, order[(order.indexOf(cur) + 1) % order.length]);
      return next;
    });
  };

  const destLabel: Record<Destination, string> = {
    today: 'Today',
    next: 'Next',
    drop: 'Archive',
  };

  const destColor: Record<Destination, string> = {
    today: 'bg-white text-stone-800 border-stone-300',
    next: 'bg-[#F2EDE4] text-stone-600 border-stone-300',
    drop: 'bg-stone-200 text-stone-400 border-stone-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#F5F0E8] rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-medium text-stone-700 mb-1">
          Carry over unfinished tasks
        </h2>
        <p className="text-sm text-stone-400 mb-4">
          Click each task to cycle: Today → Next → Archive
        </p>

        {/* Bulk actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setAll('today')}
            className="text-xs px-2.5 py-1 rounded border border-stone-300
                       text-stone-500 hover:text-[#B8860B] hover:border-[#B8860B]
                       transition-colors cursor-pointer"
          >
            All → Today
          </button>
          <button
            onClick={() => setAll('next')}
            className="text-xs px-2.5 py-1 rounded border border-stone-300
                       text-stone-500 hover:text-[#B8860B] hover:border-[#B8860B]
                       transition-colors cursor-pointer"
          >
            All → Next
          </button>
        </div>

        {/* Task list */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto mb-6">
          {tasks.map((task) => {
            const dest = decisions.get(task.id) ?? 'today';
            return (
              <button
                key={task.id}
                onClick={() => toggle(task.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border
                            transition-colors cursor-pointer ${destColor[dest]}`}
              >
                <span className="text-base shrink-0">{SIGNAL_GLYPHS[task.signal]}</span>
                <span className="flex-1 text-left font-handwritten text-base truncate">
                  {task.text}
                </span>
                <span className="text-[10px] uppercase tracking-widest shrink-0 font-sans">
                  {destLabel[dest]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm text-stone-400 hover:text-stone-600 px-4 py-2
                       transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(decisions)}
            className="text-sm bg-stone-800 text-stone-200 px-5 py-2 rounded-lg
                       hover:bg-stone-700 transition-colors cursor-pointer"
          >
            Start New Day
          </button>
        </div>
      </div>
    </div>
  );
}
