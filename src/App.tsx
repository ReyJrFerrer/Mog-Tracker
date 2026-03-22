import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PlannerView } from './components/PlannerView';
import { Card, Priority } from './types';

const STORAGE_KEY = 'flexboard_app_data';

export default function App() {
  const [todos, setTodos] = useState<Card[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_todos');
    return saved ? JSON.parse(saved) : [
      { id: 't1', title: 'Call mom', type: 'todo', priority: 'high', createdAt: Date.now() },
      { id: 't2', title: 'Birthday gift for dad', type: 'todo', priority: 'medium', createdAt: Date.now() },
      { id: 't3', title: 'Groceries', type: 'todo', priority: 'medium', createdAt: Date.now() },
      { id: 't4', title: 'Plan camping trip', type: 'todo', priority: 'low', createdAt: Date.now() },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_todos', JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (title: string, priority: Priority) => {
    const newTodo: Card = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      type: 'todo',
      priority,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar 
        todos={todos}
        onAddTodo={handleAddTodo}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
      />
      
      <main className="flex-1 h-full overflow-hidden">
        <PlannerView 
          todos={todos}
        />
      </main>
    </div>
  );
}
