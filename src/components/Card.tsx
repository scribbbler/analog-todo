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
  today: 'bg-white',
  next: 'bg-[#FAF6EF]',
  someday: 'bg-[#E8DCC8]',
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

  const ratingDots = [1, 2, 3].map((n) => (
    <button
      key={n}
      onClick={() => !readonly && onUpdate({ ...card, rating: card.rating === n ? n - 1 : n })}
      className="w-3 h-3 rounded-full border border-stone-400 transition-colors cursor-pointer"
      style={{ backgroundColor: n <= card.rating ? '#B8860B' : 'transparent' }}
      aria-label={`Rate ${n}`}
    />
  ));

  return (
    <div
      ref={setNodeRef}
      className={`card-surface ${CARD_BG[card.type]} rounded-lg shadow-md
                  p-4 pt-3 flex flex-col aspect-[3/5] w-full
                  transition-all duration-200
                  ${readonly ? 'pointer-events-none' : 'hover:-translate-y-1 hover:shadow-lg'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
          {CARD_LABEL[card.type]}
        </span>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-1">{ratingDots}</div>
          {!readonly ? (
            <input
              className="text-right text-xs text-stone-500 bg-transparent outline-none
                         w-24 placeholder:text-stone-300 font-sans"
              value={card.title}
              onChange={(e) => onUpdate({ ...card, title: e.target.value })}
              placeholder="title"
            />
          ) : (
            card.title && (
              <span className="text-xs text-stone-500">{card.title}</span>
            )
          )}
        </div>
      </div>

      {/* Ruled lines */}
      <div className="flex-1 border-t border-stone-200 pt-1 overflow-y-auto">
        <SortableContext items={card.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {card.tasks.map((task, i) => (
            <TaskLine
              key={task.id}
              task={task}
              lineNum={i + 1}
              onUpdate={updateTask}
              readonly={readonly}
            />
          ))}
        </SortableContext>
        {!readonly && card.type !== 'today' && (
          <button
            onClick={addLine}
            className="text-[10px] text-stone-300 hover:text-stone-500 mt-1 ml-6
                       transition-colors cursor-pointer"
          >
            + add line
          </button>
        )}
      </div>

      {/* Date footer */}
      <div className="text-[9px] text-stone-300 text-right mt-1 font-mono">
        {card.date}
      </div>
    </div>
  );
}
