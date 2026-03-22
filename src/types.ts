export type CardType = 'todo' | 'habit';

export interface Card {
  id: string;
  columnId: string;
  title: string;
  type: CardType;
  completed?: boolean;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
}
