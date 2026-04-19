import { useState, useEffect, useCallback } from 'react';
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { AppState, CardData, CardType } from './types';
import { loadState, saveState, createCard } from './store';
import CardHolder from './components/CardHolder';
import Archive from './components/Archive';

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

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const updateCard = useCallback((type: CardType, card: CardData) => {
    setState((s) => ({ ...s, [type]: card }));
  }, []);

  const handleNewToday = useCallback(() => {
    setState((s) => ({
      ...s,
      archive: [s.today, ...s.archive],
      today: createCard('today'),
    }));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    setState((prev) => {
      const source = findCardAndIndex(prev, String(active.id));
      if (!source) return prev;

      const next = { ...prev };

      // Determine destination card type
      let destType: CardType;
      const overInCard = findCardAndIndex(prev, String(over.id));

      if (overInCard) {
        destType = overInCard.cardType;
      } else if (['today', 'next', 'someday'].includes(String(over.id))) {
        destType = String(over.id) as CardType;
      } else {
        return prev;
      }

      // Same card: reorder
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

      // Different cards: move task
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
    </div>
  );
}
