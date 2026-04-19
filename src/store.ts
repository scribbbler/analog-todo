import type { AppState, CardData, CardType, Task } from './types';

const STORAGE_KEY = 'analog-todo-v1';

export function createTask(text = ''): Task {
  return { id: crypto.randomUUID(), text, signal: 'empty' };
}

export function createCard(type: CardType): CardData {
  const count = type === 'today' ? 10 : 3;
  return {
    id: crypto.randomUUID(),
    type,
    title: '',
    rating: 0,
    tasks: Array.from({ length: count }, () => createTask()),
    date: new Date().toISOString().slice(0, 10),
  };
}

export function defaultState(): AppState {
  return {
    today: createCard('today'),
    next: createCard('next'),
    someday: createCard('someday'),
    archive: [],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch { /* corrupted — start fresh */ }
  return defaultState();
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
