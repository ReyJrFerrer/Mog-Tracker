import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Sun, Moon, Cloud, Zap } from 'lucide-react';
import { Column as ColumnType, Card as CardType, TimeOfDay } from '../types';
import { PlannerCard } from './PlannerCard';
import { cn } from '../lib/utils';

interface PlannerDayProps {
  key?: string | number;
  item: ColumnType;
  cards: CardType[];
  onAddCard: (columnId: string, timeOfDay: TimeOfDay) => void;
  onToggleComplete: (id: string) => void;
  onDeleteCard: (id: string) => void;
  onRenameCard: (id: string, newTitle: string) => void;
}

export function PlannerDay({
  item,
  cards,
  onAddCard,
  onToggleComplete,
  onDeleteCard,
  onRenameCard,
}: PlannerDayProps) {
  const cardIds = useMemo(() => cards.map((c) => c.id), [cards]);

  const { setNodeRef } = useDroppable({
    id: item.id,
    data: {
      type: 'Column',
      column: item,
    },
  });

  const sections: { label: string; timeOfDay: TimeOfDay; icon: React.ReactNode; color: string }[] = [
    { label: 'ANYTIME', timeOfDay: 'anytime', icon: <Zap size={14} />, color: 'bg-zinc-100/40' },
    { label: 'MORNING', timeOfDay: 'morning', icon: <Sun size={14} />, color: 'bg-orange-100/40' },
    { label: 'DAY', timeOfDay: 'day', icon: <Cloud size={14} />, color: 'bg-blue-100/40' },
    { label: 'EVENING', timeOfDay: 'evening', icon: <Moon size={14} />, color: 'bg-purple-100/40' },
  ];

  const date = new Date(item.date);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = date.getDate();

  return (
    <div className="flex flex-col w-96 shrink-0 h-full">
      <div className="flex flex-col items-center mb-10">
        <div className="text-[10px] font-black text-zinc-400 tracking-[0.2em] mb-2">{dayName}</div>
        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-xl font-bold text-zinc-800 shadow-sm">
          {dayNum}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-8 overflow-y-auto px-4 pb-10"
      >
        {sections.map(section => {
          const sectionCards = cards.filter(c => c.timeOfDay === section.timeOfDay);
          
          return (
            <div key={section.timeOfDay} className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-xl text-zinc-500", section.color)}>
                    {section.icon}
                  </div>
                  <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">
                    {section.label}
                  </span>
                </div>
                <button 
                  onClick={() => onAddCard(item.id, section.timeOfDay)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-white/40 rounded-full transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-3">
                <SortableContext items={sectionCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {sectionCards.map((card) => (
                    <PlannerCard
                      key={card.id}
                      item={card}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDeleteCard}
                      onRename={onRenameCard}
                    />
                  ))}
                </SortableContext>
                
                {sectionCards.length === 0 && (
                  <button 
                    onClick={() => onAddCard(item.id, section.timeOfDay)}
                    className="w-full py-4 border border-dashed border-white/40 rounded-3xl text-[10px] text-zinc-400 font-medium hover:bg-white/20 transition-all"
                  >
                    No plans yet
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
