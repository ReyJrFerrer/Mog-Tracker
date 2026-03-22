import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle2, Circle, Trash2, Edit2, Check } from 'lucide-react';
import { Card as CardType } from '../types';
import { cn } from '../lib/utils';

interface CardProps {
  key?: React.Key;
  item: CardType;
  onToggleComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
}

export function KanbanCard({ item, onToggleComplete, onDelete, onRename }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'Card',
      card: item,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== item.title) {
      onRename?.(item.id, editTitle);
    }
    setIsEditing(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-white p-4 rounded-xl border-2 border-dashed border-zinc-300 min-h-[100px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white p-4 rounded-xl shadow-sm border border-zinc-200 hover:border-zinc-300 transition-all",
        item.completed && "bg-zinc-50 border-zinc-100"
      )}
    >
      <div className="flex items-start gap-3">
        {item.type === 'habit' && (
          <button
            onClick={() => onToggleComplete?.(item.id)}
            className={cn(
              "mt-0.5 transition-colors",
              item.completed ? "text-emerald-500" : "text-zinc-300 hover:text-zinc-400"
            )}
          >
            {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>
        )}

        <div className="flex-1 min-w-0" {...attributes} {...listeners}>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="w-full bg-zinc-100 px-2 py-1 rounded text-sm outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          ) : (
            <p className={cn(
              "text-sm font-medium leading-tight break-words",
              item.completed && "text-zinc-400 line-through"
            )}>
              {item.title}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete?.(item.id)}
            className="p-1 text-zinc-400 hover:text-red-500 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider",
          item.type === 'habit' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
        )}>
          {item.type}
        </span>
        <span className="text-[10px] text-zinc-400 font-mono">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
