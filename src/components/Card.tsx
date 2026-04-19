import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CardData, Task } from '../types';
import { createTask } from '../store';
import TaskLine from './TaskLine';

interface CardProps {
  card: CardData;
  onUpdate: (card: CardData) => void;
  readonly?: boolean;
}

const CARD_BG: Record<string, string> = {
  today: 'bg-[#F8F6F3]',
  next: 'bg-[#F2EDE4]',
  someday: 'bg-[#E0D5C1]',
};

const CARD_LABEL: Record<string, string> = {
  today: 'Today',
  next: 'Next',
  someday: 'Someday',
};

export default function Card({ card, onUpdate, readonly }: CardProps) {
  const { setNodeRef } = useDroppable({ id: card.type });

  const updateTask = (updated: Task) => {
    onUpdate({
      ...card,
      tasks: card.tasks.map((t) => (t.id === updated.id ? updated : t)),
    });
  };

  const addLine = () => {
    if (card.type === 'today' && card.tasks.length >= 10) return;
    onUpdate({ ...card, tasks: [...card.tasks, createTask()] });
  };

  return (
    <div
      ref={setNodeRef}
      className={`card-surface ${CARD_BG[card.type]} rounded-2xl
                  px-6 py-5 flex flex-col aspect-[3/5] w-full
                  transition-all duration-200
                  ${readonly ? 'pointer-events-none' : 'hover:-translate-y-1 hover:shadow-lg'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-xl font-medium text-stone-500 tracking-wide">
          {CARD_LABEL[card.type]}
        </span>
        <div className="flex items-start gap-2">
          {!readonly ? (
            <input
              className="text-right text-sm text-stone-400 bg-transparent outline-none
                         w-28 placeholder:text-stone-300 font-sans mt-1
                         border-b border-stone-300"
              value={card.title}
              onChange={(e) => onUpdate({ ...card, title: e.target.value })}
              placeholder=""
            />
          ) : (
            card.title && (
              <span className="text-sm text-stone-400 mt-1">{card.title}</span>
            )
          )}
          {/* Vertical rating dots */}
          <div className="flex flex-col gap-1.5 mt-0.5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => !readonly && onUpdate({ ...card, rating: card.rating === n ? n - 1 : n })}
                className="w-3 h-3 rounded-full border border-stone-400
                           transition-colors cursor-pointer"
                style={{ backgroundColor: n <= card.rating ? '#B8860B' : 'transparent' }}
                aria-label={`Rate ${n}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Task lines */}
      <div className="flex-1 overflow-y-auto">
        <SortableContext items={card.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {card.tasks.map((task) => (
            <TaskLine
              key={task.id}
              task={task}
              onUpdate={updateTask}
              readonly={readonly}
            />
          ))}
        </SortableContext>
        {!readonly && card.type !== 'today' && (
          <button
            onClick={addLine}
            className="text-xs text-stone-300 hover:text-stone-500 mt-2 ml-10
                       transition-colors cursor-pointer"
          >
            + add line
          </button>
        )}
      </div>
    </div>
  );
}
