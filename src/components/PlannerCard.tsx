import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit2, Circle, CheckCircle2, Clock } from 'lucide-react';
import { Card as CardType } from '../types';
import { cn } from '../lib/utils';

interface PlannerCardProps {
  key?: string | number;
  item: CardType;
  onToggleComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
}

export function PlannerCard({ item, onToggleComplete, onDelete, onRename }: PlannerCardProps) {
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
        className="opacity-30 bg-white/20 p-4 rounded-3xl border-2 border-dashed border-white/40 min-h-[80px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-white/40 hover:bg-white/60 transition-all shadow-sm",
        item.completed && "opacity-50"
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggleComplete?.(item.id)}
          className="shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {item.completed ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} />}
        </button>

        <div className="flex-1 min-w-0" {...attributes} {...listeners}>
          {isEditing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="w-full bg-white/60 px-2 py-1 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
          ) : (
            <div className="space-y-1">
              <p className={cn(
                "text-sm font-semibold text-zinc-800 leading-tight break-words",
                item.completed && "line-through text-zinc-500"
              )}>
                {item.title}
              </p>
              {item.duration && (
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                  <Clock size={10} />
                  <span>{item.duration}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-white/60 rounded-full transition-all"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete?.(item.id)}
            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-white/60 rounded-full transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
