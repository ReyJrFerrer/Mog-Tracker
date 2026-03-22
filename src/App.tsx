import React, { useState, useEffect } from 'react';
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
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Sidebar } from './components/Sidebar';
import { PlannerView } from './components/PlannerView';
import { CardModal } from './components/CardModal';
import { PlannerCard } from './components/PlannerCard';
import { Card, Priority, TimeOfDay } from './types';

const STORAGE_KEY = 'flexboard_app_data';

const initialCards: Card[] = [
  { id: 't1', title: 'Call mom', type: 'todo', priority: 'none', createdAt: Date.now() },
  { id: 't2', title: 'Birthday gift for dad', type: 'todo', priority: 'none', createdAt: Date.now() },
  { id: 't3', title: 'Groceries', type: 'todo', priority: 'none', createdAt: Date.now() },
  { id: 't4', title: 'Plan camping trip', type: 'todo', priority: 'none', createdAt: Date.now() },
  { id: '1', title: 'Morning routine', type: 'habit', timeOfDay: 'morning', date: new Date().toISOString().split('T')[0], duration: '1h', createdAt: Date.now() },
  { id: '2', title: 'Bike to work', type: 'todo', timeOfDay: 'morning', date: new Date().toISOString().split('T')[0], duration: '20m', createdAt: Date.now() },
  { id: '3', title: 'Lunch', type: 'todo', timeOfDay: 'day', date: new Date().toISOString().split('T')[0], duration: '1h', createdAt: Date.now() },
  { id: '4', title: 'Deep work', type: 'todo', timeOfDay: 'day', date: new Date().toISOString().split('T')[0], duration: '2h', createdAt: Date.now() },
  { id: '5', title: 'Evening routine', type: 'habit', timeOfDay: 'evening', date: new Date().toISOString().split('T')[0], duration: '1h', createdAt: Date.now() },
];

export default function App() {
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_cards');
    return saved ? JSON.parse(saved) : initialCards;
  });

  const [projectTitle, setProjectTitle] = useState(() => {
    return localStorage.getItem(STORAGE_KEY + '_project_title') || 'Home';
  });

  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_project_title', projectTitle);
  }, [projectTitle]);

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

  const handleAddTodo = (title: string, priority: Priority) => {
    const newTodo: Card = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      type: 'todo',
      priority,
      createdAt: Date.now(),
    };
    setCards(prev => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setCards(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setCards(prev => prev.filter(t => t.id !== id));
  };

  const handleRenameTodo = (id: string, title: string) => {
    setCards(prev => prev.map(t => t.id === id ? { ...t, title } : t));
  };

  const handleCardUpdate = (updatedCard: Card) => {
    setCards(prev => prev.map(t => t.id === updatedCard.id ? updatedCard : t));
    setSelectedCard(updatedCard);
  };

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

        const activeCard = cards[activeIndex];
        const overCard = cards[overIndex];

        // If moving between Sidebar and Planner or between different days/times
        if (activeCard.date !== overCard.date || activeCard.timeOfDay !== overCard.timeOfDay) {
          const updatedCards = [...cards];
          updatedCards[activeIndex] = {
            ...activeCard,
            date: overCard.date,
            timeOfDay: overCard.timeOfDay
          };
          return arrayMove(updatedCards, activeIndex, overIndex);
        }

        return arrayMove(cards, activeIndex, overIndex);
      });
    }

    // Dropping a Card over a Column
    const isOverAColumn = over.data.current?.type === 'Column';
    if (isActiveACard && isOverAColumn) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((t) => t.id === activeId);
        const updatedCards = [...cards];
        updatedCards[activeIndex] = {
          ...cards[activeIndex],
          date: overId as string,
          timeOfDay: 'anytime'
        };
        return arrayMove(updatedCards, activeIndex, activeIndex);
      });
    }

    // Dropping a Card over the Sidebar container
    const isOverSidebar = over.id === 'sidebar';
    if (isActiveACard && isOverSidebar) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((t) => t.id === activeId);
        const activeCard = cards[activeIndex];
        
        if (activeCard.date === undefined) return cards; // Already in sidebar

        const updatedCards = [...cards];
        updatedCards[activeIndex] = {
          ...activeCard,
          date: undefined,
          timeOfDay: undefined
        };
        return arrayMove(updatedCards, activeIndex, 0);
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
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

  const todos = cards.filter(c => c.date === undefined);
  const plannerCards = cards.filter(c => c.date !== undefined);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar 
          todos={todos}
          projectTitle={projectTitle}
          onUpdateProjectTitle={setProjectTitle}
          onAddTodo={handleAddTodo}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          onRenameTodo={handleRenameTodo}
          onCardClick={setSelectedCard}
        />
        
        <main className="flex-1 h-full overflow-hidden">
          <PlannerView 
            cards={plannerCards}
            onUpdateCards={setCards}
            onCardClick={setSelectedCard}
          />
        </main>

        {selectedCard && (
          <CardModal 
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            onUpdate={handleCardUpdate}
          />
        )}

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
      </div>
    </DndContext>
  );
}
