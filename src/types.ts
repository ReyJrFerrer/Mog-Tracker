export type CardType = 'todo' | 'habit';
export type TimeOfDay = 'anytime' | 'morning' | 'day' | 'evening';
export type Priority = 'high' | 'medium' | 'low' | 'none';

export interface Card {
  id: string;
  title: string;
  type: CardType;
  completed?: boolean;
  createdAt: number;
  timeOfDay?: TimeOfDay;
  priority?: Priority;
  date?: string; // ISO date string YYYY-MM-DD
  duration?: string; // e.g., "30m", "1h"
}

export interface Column {
  id: string;
  title: string;
  date: string; // ISO date string
}
