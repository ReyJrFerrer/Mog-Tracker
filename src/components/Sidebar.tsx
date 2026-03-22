import React, { useState } from 'react';
import { Plus, ListTodo, Activity, Layout, ChevronRight, ChevronLeft } from 'lucide-react';
import { CardType } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  onQuickAdd: (title: string, type: CardType) => void;
  onAddColumn: () => void;
}

export function Sidebar({ onQuickAdd, onAddColumn }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [todoTitle, setTodoTitle] = useState('');
  const [habitTitle, setHabitTitle] = useState('');

  const handleQuickAdd = (type: CardType) => {
    const title = type === 'todo' ? todoTitle : habitTitle;
    if (title.trim()) {
      onQuickAdd(title, type);
      if (type === 'todo') setTodoTitle('');
      else setHabitTitle('');
    }
  };

  return (
    <div
      className={cn(
        "relative h-screen bg-white border-r border-zinc-200 transition-all duration-300 flex flex-col",
        isOpen ? "w-72" : "w-16"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 bg-white border border-zinc-200 rounded-full p-1 shadow-sm z-10 hover:bg-zinc-50"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
          <Layout size={20} />
        </div>
        {isOpen && <h1 className="font-bold text-xl tracking-tight">FlexBoard</h1>}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8">
        {isOpen && (
          <>
            <section>
              <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <ListTodo size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Quick Todo</span>
              </div>
              <div className="space-y-2">
                <input
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  placeholder="New task..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd('todo')}
                />
                <button
                  onClick={() => handleQuickAdd('todo')}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  <Plus size={16} />
                  Add Todo
                </button>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <Activity size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Quick Habit</span>
              </div>
              <div className="space-y-2">
                <input
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="New habit..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd('habit')}
                />
                <button
                  onClick={() => handleQuickAdd('habit')}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Habit
                </button>
              </div>
            </section>

            <section>
              <div className="h-px bg-zinc-100 my-6" />
              <button
                onClick={onAddColumn}
                className="w-full flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors text-sm font-medium"
              >
                <Plus size={18} />
                New Board Column
              </button>
            </section>
          </>
        )}
      </div>

      <div className="p-6 border-t border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200" />
          {isOpen && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">User Studio</p>
              <p className="text-xs text-zinc-400 truncate">Free Plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
