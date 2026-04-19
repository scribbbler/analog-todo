import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useRef, useEffect } from 'react';
import { SIGNAL_GLYPHS, type Task } from '../types';
import Signal from './Signal';

interface TaskLineProps {
  task: Task;
  onUpdate: (task: Task) => void;
  readonly?: boolean;
}

export default function TaskLine({ task, onUpdate, readonly }: TaskLineProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: readonly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const isComplete = task.signal === 'complete';
  const isCancelled = task.signal === 'cancel';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!readonly ? listeners : {})}
      className={`flex items-center gap-3 py-2.5 group
                  ${!readonly ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {/* Signal circle */}
      {!readonly ? (
        <Signal
          value={task.signal}
          onChange={(signal) => onUpdate({ ...task, signal })}
        />
      ) : (
        <span className="w-7 h-7 flex items-center justify-center text-lg shrink-0 text-stone-400">
          {SIGNAL_GLYPHS[task.signal]}
        </span>
      )}

      {/* Task text with ruled line underneath */}
      <div className="flex-1 min-w-0">
        {editing && !readonly ? (
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none font-handwritten text-lg
                       text-stone-700 pb-1 border-b border-stone-300"
            value={task.text}
            onChange={(e) => onUpdate({ ...task, text: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditing(false); }}
          />
        ) : (
          <div
            onClick={() => !readonly && setEditing(true)}
            className="pb-1 border-b border-stone-300 min-h-[1.75rem] cursor-text"
          >
            <span
              className={`font-handwritten text-lg
                          ${isComplete ? 'line-through-hand text-stone-400' : ''}
                          ${isCancelled ? 'text-stone-300' : 'text-stone-700'}`}
            >
              {task.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
