import { useState, useEffect, useCallback } from 'react';
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { AppState, CardData, CardType, Task } from './types';
import { loadState, saveState, createCard, createTask } from './store';
import CardHolder from './components/CardHolder';
import Archive from './components/Archive';
import CarryOver from './components/CarryOver';

function findCardAndIndex(
  state: AppState,
  taskId: string,
): { cardType: CardType; taskIndex: number } | null {
  for (const ct of ['today', 'next', 'someday'] as const) {
    const idx = state[ct].tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) return { cardType: ct, taskIndex: idx };
  }
  return null;
}

function isUnfinished(task: Task): boolean {
  return task.text.trim() !== '' && task.signal !== 'complete' && task.signal !== 'cancel';
}

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [carryOverTasks, setCarryOverTasks] = useState<Task[] | null>(null);

  useEffect(() => { saveState(state); }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const updateCard = useCallback((type: CardType, card: CardData) => {
    setState((s) => ({ ...s, [type]: card }));
  }, []);

  const handleNewToday = useCallback(() => {
    const unfinished = state.today.tasks.filter(isUnfinished);
    if (unfinished.length > 0) {
      setCarryOverTasks(unfinished);
    } else {
      // No unfinished tasks — just archive and start fresh
      setState((s) => ({
        ...s,
        archive: [s.today, ...s.archive],
        today: createCard('today'),
      }));
    }
  }, [state.today]);

  const handleCarryOverConfirm = useCallback(
    (decisions: Map<string, 'today' | 'next' | 'drop'>) => {
      setState((s) => {
        const toToday: Task[] = [];
        const toNext: Task[] = [];

        for (const [id, dest] of decisions) {
          const task = s.today.tasks.find((t) => t.id === id);
          if (!task) continue;
          // Reset signal to empty for carried-over tasks
          const fresh = { ...task, id: crypto.randomUUID(), signal: 'empty' as const };
          if (dest === 'today') toToday.push(fresh);
          else if (dest === 'next') toNext.push(fresh);
          // 'drop' = leave in archive only
        }

        // Build new Today card: carried tasks + empty lines to fill to 10
        const newToday = createCard('today');
        const emptySlots = Math.max(0, 10 - toToday.length);
        newToday.tasks = [
          ...toToday,
          ...Array.from({ length: emptySlots }, () => createTask()),
        ].slice(0, 10);

        // Append carried tasks to Next card
        const updatedNext = {
          ...s.next,
          tasks: [...s.next.tasks, ...toNext],
        };

        return {
          ...s,
          archive: [s.today, ...s.archive],
          today: newToday,
          next: updatedNext,
        };
      });
      setCarryOverTasks(null);
    },
    [],
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    setState((prev) => {
      const source = findCardAndIndex(prev, String(active.id));
      if (!source) return prev;

      const next = { ...prev };

      let destType: CardType;
      const overInCard = findCardAndIndex(prev, String(over.id));

      if (overInCard) {
        destType = overInCard.cardType;
      } else if (['today', 'next', 'someday'].includes(String(over.id))) {
        destType = String(over.id) as CardType;
      } else {
        return prev;
      }

      if (source.cardType === destType) {
        const destIdx = overInCard ? overInCard.taskIndex : source.taskIndex;
        const reordered = arrayMove(
          [...prev[destType].tasks],
          source.taskIndex,
          destIdx,
        );
        next[destType] = { ...prev[destType], tasks: reordered };
        return next;
      }

      if (destType === 'today' && prev.today.tasks.length >= 10) return prev;

      const task = prev[source.cardType].tasks[source.taskIndex];
      const srcTasks = prev[source.cardType].tasks.filter((_, i) => i !== source.taskIndex);
      const destIdx = overInCard ? overInCard.taskIndex : prev[destType].tasks.length;
      const destTasks = [...prev[destType].tasks];
      destTasks.splice(destIdx, 0, task);

      next[source.cardType] = { ...prev[source.cardType], tasks: srcTasks };
      next[destType] = { ...prev[destType], tasks: destTasks };
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-8 font-sans">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <CardHolder
          today={state.today}
          next={state.next}
          someday={state.someday}
          onUpdate={updateCard}
          onNewToday={handleNewToday}
        />
      </DndContext>
      <Archive
        cards={state.archive}
        open={archiveOpen}
        onToggle={() => setArchiveOpen((o) => !o)}
      />
      {carryOverTasks && (
        <CarryOver
          tasks={carryOverTasks}
          onConfirm={handleCarryOverConfirm}
          onCancel={() => setCarryOverTasks(null)}
        />
      )}
    </div>
  );
}
