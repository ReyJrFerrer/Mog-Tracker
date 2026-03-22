import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Column as ColumnType, Card as CardType, TimeOfDay } from '../types';
import { PlannerDay } from './PlannerDay';
import { PlannerCard } from './PlannerCard';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const STORAGE_KEY = 'flexboard_planner_data';

const getInitialColumns = (): ColumnType[] => {
  const today = new Date();
  const columns: ColumnType[] = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    columns.push({
      id: dateStr,
      title: dateStr,
      date: dateStr,
    });
  }
  return columns;
};

const initialCards: CardType[] = [
  { id: '1', title: 'Morning routine', type: 'habit', timeOfDay: 'morning', date: new Date().toISOString().split('T')[0], duration: '1h', createdAt: Date.now() },
  { id: '2', title: 'Bike to work', type: 'todo', timeOfDay: 'morning', date: new Date().toISOString().split('T')[0], duration: '20m', createdAt: Date.now() },
  { id: '3', title: 'Lunch', type: 'todo', timeOfDay: 'day', date: new Date().toISOString().split('T')[0], duration: '1h', createdAt: Date.now() },
  { id: '4', title: 'Deep work', type: 'todo', timeOfDay: 'day', date: new Date().toISOString().split('T')[0], duration: '2h', createdAt: Date.now() },
  { id: '5', title: 'Evening routine', type: 'habit', timeOfDay: 'evening', date: new Date().toISOString().split('T')[0], duration: '1h', createdAt: Date.now() },
];

export function PlannerView({ 
  todos,
  onAddTodoToPlanner
}: { 
  todos: CardType[],
  onAddTodoToPlanner?: (todo: CardType, date: string, timeOfDay: TimeOfDay) => void
}) {
  const [columns, setColumns] = useState<ColumnType[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_cols');
    return saved ? JSON.parse(saved) : getInitialColumns();
  });

  const [cards, setCards] = useState<CardType[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_cards');
    return saved ? JSON.parse(saved) : initialCards;
  });

  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_cols', JSON.stringify(columns));
    localStorage.setItem(STORAGE_KEY + '_cards', JSON.stringify(cards));
  }, [columns, cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Card') {
      setActiveCard(event.active.data.current.card);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === 'Card';
    const isOverACard = over.data.current?.type === 'Card';

    if (!isActiveACard) return;

    // Dropping a Card over another Card
    if (isActiveACard && isOverACard) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((t) => t.id === activeId);
        const overIndex = cards.findIndex((t) => t.id === overId);

        if (cards[activeIndex].date !== cards[overIndex].date || cards[activeIndex].timeOfDay !== cards[overIndex].timeOfDay) {
          cards[activeIndex].date = cards[overIndex].date;
          cards[activeIndex].timeOfDay = cards[overIndex].timeOfDay;
          return arrayMove(cards, activeIndex, overIndex - 1);
        }

        return arrayMove(cards, activeIndex, overIndex);
      });
    }

    // Dropping a Card over a Column
    const isOverAColumn = over.data.current?.type === 'Column';
    if (isActiveACard && isOverAColumn) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((t) => t.id === activeId);
        cards[activeIndex].date = overId as string;
        return arrayMove(cards, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
  };

  const addCard = (date: string, timeOfDay: TimeOfDay) => {
    const newCard: CardType = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      timeOfDay,
      title: 'New Plan',
      type: 'todo',
      createdAt: Date.now(),
    };
    setCards((prev) => [...prev, newCard]);
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const renameCard = (id: string, newTitle: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
  };

  const toggleComplete = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  const currentMonth = new Date(columns[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-400">
              <CalendarIcon size={18} />
              <button className="p-1 hover:bg-white/40 rounded-lg transition-all"><ChevronLeft size={16} /></button>
              <button className="p-1 hover:bg-white/40 rounded-lg transition-all"><ChevronRight size={16} /></button>
            </div>
            <h2 className="serif text-3xl font-bold text-zinc-800">{currentMonth}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-zinc-500">
              <span>3-days</span>
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 flex overflow-x-auto overflow-y-hidden px-8 gap-12 pb-10">
          <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            {columns.map((col) => (
              <PlannerDay
                key={col.id}
                item={col}
                cards={cards.filter((c) => c.date === col.date)}
                onAddCard={addCard}
                onToggleComplete={toggleComplete}
                onDeleteCard={deleteCard}
                onRenameCard={renameCard}
              />
            ))}
          </SortableContext>
        </div>
      </div>

      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeCard ? (
            <PlannerCard
              item={activeCard}
              onToggleComplete={() => {}}
              onDelete={() => {}}
              onRename={() => {}}
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
