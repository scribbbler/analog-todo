export type TaskSignal = 'empty' | 'complete' | 'in-progress' | 'delegated' | 'appointment' | 'cancel';

export const SIGNAL_ORDER: TaskSignal[] = [
  'empty', 'complete', 'in-progress', 'delegated', 'appointment', 'cancel',
];

export const SIGNAL_GLYPHS: Record<TaskSignal, string> = {
  'empty': '○',
  'complete': '●',
  'in-progress': '◐',
  'delegated': '→',
  'appointment': '◇',
  'cancel': '✕',
};

export type CardType = 'today' | 'next' | 'someday';

export interface Task {
  id: string;
  text: string;
  signal: TaskSignal;
}

export interface CardData {
  id: string;
  type: CardType;
  title: string;
  rating: number; // 0–3
  tasks: Task[];
  date: string; // ISO date string
}

export interface AppState {
  today: CardData;
  next: CardData;
  someday: CardData;
  archive: CardData[];
}
