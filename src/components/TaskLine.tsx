import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useRef, useEffect } from 'react';
import { SIGNAL_GLYPHS, type Task } from '../types';
import Signal from './Signal';

interface TaskLineProps {
  task: Task;
  lineNum: number;
  onUpdate: (task: Task) => void;
  readonly?: boolean;
}

export default function TaskLine({ task, lineNum, onUpdate, readonly }: TaskLineProps) {
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
      className="flex items-center gap-1.5 h-8 group"
    >
      {!readonly && (
        <span
          {...listeners}
          className="cursor-grab text-[10px] text-stone-300 opacity-0
                     group-hover:opacity-100 transition-opacity select-none"
        >
          ⠿
        </span>
      )}
      <span className="text-[10px] text-stone-400 w-4 text-right shrink-0 tabular-nums">
        {lineNum}
      </span>
      {!readonly && (
        <Signal
          value={task.signal}
          onChange={(signal) => onUpdate({ ...task, signal })}
        />
      )}
      {readonly && (
        <span className="w-5 h-5 flex items-center justify-center text-sm shrink-0">
          {SIGNAL_GLYPHS[task.signal]}
        </span>
      )}
      {editing && !readonly ? (
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none font-handwritten text-sm
                     text-stone-800 border-b border-stone-200 focus:border-stone-400"
          value={task.text}
          onChange={(e) => onUpdate({ ...task, text: e.target.value })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') setEditing(false); }}
        />
      ) : (
        <span
          onClick={() => !readonly && setEditing(true)}
          className={`flex-1 font-handwritten text-sm cursor-text min-h-[1.25rem]
                      ${isComplete ? 'line-through-hand text-stone-400' : ''}
                      ${isCancelled ? 'text-stone-300' : 'text-stone-800'}`}
        >
          {task.text || (!readonly ? '' : '')}
        </span>
      )}
    </div>
  );
}
