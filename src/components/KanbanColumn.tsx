import React, { useMemo, useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Column as ColumnType, Card as CardType } from '../types';
import { KanbanCard } from './KanbanCard';
import { cn } from '../lib/utils';

interface ColumnProps {
  key?: React.Key;
  item: ColumnType;
  cards: CardType[];
  onAddCard: (columnId: string) => void;
  onDeleteColumn: (id: string) => void;
  onRenameColumn: (id: string, newTitle: string) => void;
  onToggleComplete: (id: string) => void;
  onDeleteCard: (id: string) => void;
  onRenameCard: (id: string, newTitle: string) => void;
}

export function KanbanColumn({
  item,
  cards,
  onAddCard,
  onDeleteColumn,
  onRenameColumn,
  onToggleComplete,
  onDeleteCard,
  onRenameCard,
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  const cardIds = useMemo(() => cards.map((c) => c.id), [cards]);

  const { setNodeRef } = useDroppable({
    id: item.id,
  });

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== item.title) {
      onRenameColumn(item.id, editTitle);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col w-80 shrink-0 bg-zinc-100/50 rounded-2xl border border-zinc-200/60 max-h-full">
      <div className="p-4 flex items-center justify-between group">
        <div className="flex items-center gap-2 flex-1">
          {isEditing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="bg-white px-2 py-1 rounded text-sm font-semibold outline-none ring-2 ring-zinc-400 w-full"
            />
          ) : (
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">
              {item.title}
              <span className="ml-2 text-zinc-400 font-mono text-xs">({cards.length})</span>
            </h2>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-white rounded-lg transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDeleteColumn(item.id)}
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px]"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              item={card}
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteCard}
              onRename={onRenameCard}
            />
          ))}
        </SortableContext>
      </div>

      <div className="p-3">
        <button
          onClick={() => onAddCard(item.id)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 hover:bg-white rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 transition-all"
        >
          <Plus size={16} />
          Add Card
        </button>
      </div>
    </div>
  );
}
