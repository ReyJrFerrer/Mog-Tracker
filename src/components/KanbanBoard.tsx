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
import { Column as ColumnType, Card as CardType } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

const STORAGE_KEY = 'flexboard_data';

const initialColumns: ColumnType[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const initialCards: CardType[] = [
  { id: '1', columnId: 'todo', title: 'Welcome to FlexBoard!', type: 'todo', createdAt: Date.now() },
  { id: '2', columnId: 'todo', title: 'Drink 2L of water', type: 'habit', completed: false, createdAt: Date.now() },
];

export function KanbanBoard({ 
  externalAddTrigger, 
  onAddCardRequest 
}: { 
  externalAddTrigger?: { title: string, type: 'todo' | 'habit' },
  onAddCardRequest?: (columnId: string) => void
}) {
  const [columns, setColumns] = useState<ColumnType[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_cols');
    return saved ? JSON.parse(saved) : initialColumns;
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

  useEffect(() => {
    const handleAddColumn = () => addColumn();
    window.addEventListener('add-column', handleAddColumn);
    return () => window.removeEventListener('add-column', handleAddColumn);
  }, []);

  // Handle quick add from sidebar
  useEffect(() => {
    if (externalAddTrigger && externalAddTrigger.title) {
      const newCard: CardType = {
        id: Math.random().toString(36).substr(2, 9),
        columnId: columns[0]?.id || 'todo',
        title: externalAddTrigger.title,
        type: externalAddTrigger.type,
        completed: externalAddTrigger.type === 'habit' ? false : undefined,
        createdAt: Date.now(),
      };
      setCards((prev) => [newCard, ...prev]);
    }
  }, [externalAddTrigger]);

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

        if (cards[activeIndex].columnId !== cards[overIndex].columnId) {
          cards[activeIndex].columnId = cards[overIndex].columnId;
          return arrayMove(cards, activeIndex, overIndex - 1);
        }

        return arrayMove(cards, activeIndex, overIndex);
      });
    }

    // Dropping a Card over a Column
    const isOverAColumn = over.data.current?.type === 'Column' || columns.some(c => c.id === overId);
    if (isActiveACard && isOverAColumn) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((t) => t.id === activeId);
        cards[activeIndex].columnId = overId as string;
        return arrayMove(cards, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === 'Column';
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);
      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const addCard = (columnId: string) => {
    const newCard: CardType = {
      id: Math.random().toString(36).substr(2, 9),
      columnId,
      title: 'New Task',
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

  const addColumn = () => {
    const newCol: ColumnType = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Column',
    };
    setColumns((prev) => [...prev, newCol]);
  };

  const deleteColumn = (id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setCards((prev) => prev.filter((c) => c.columnId !== id));
  };

  const renameColumn = (id: string, newTitle: string) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full overflow-x-auto overflow-y-hidden p-8 gap-6">
        <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              item={col}
              cards={cards.filter((c) => c.columnId === col.id)}
              onAddCard={addCard}
              onDeleteColumn={deleteColumn}
              onRenameColumn={renameColumn}
              onToggleComplete={toggleComplete}
              onDeleteCard={deleteCard}
              onRenameCard={renameCard}
            />
          ))}
        </SortableContext>
        
        <button
          onClick={addColumn}
          className="h-14 w-80 shrink-0 flex items-center justify-center gap-2 bg-zinc-200/50 hover:bg-zinc-200 rounded-2xl border border-dashed border-zinc-300 transition-all text-zinc-500 font-medium"
        >
          Add Column
        </button>
      </div>

      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeCard ? (
            <KanbanCard
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
