import React, { useState } from 'react';
import { Plus, Layout, ChevronRight, ChevronLeft, Circle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Card, Priority } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  todos: Card[];
  onAddTodo: (title: string, priority: Priority) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onCardClick?: (card: Card) => void;
}

export function Sidebar({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onCardClick }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('none');

  const handleAdd = () => {
    if (newTodo.trim()) {
      onAddTodo(newTodo, selectedPriority);
      setNewTodo('');
    }
  };

  const categories: { label: string; priority: Priority; color: string }[] = [
    { label: 'HIGH', priority: 'high', color: 'bg-red-400' },
    { label: 'MEDIUM', priority: 'medium', color: 'bg-orange-400' },
    { label: 'LOW', priority: 'low', color: 'bg-blue-400' },
    { label: 'TO-DO', priority: 'none', color: 'bg-zinc-400' },
  ];

  const doneTodos = todos.filter(t => t.completed);

  return (
    <div
      className={cn(
        "relative h-screen transition-all duration-500 flex flex-col z-20",
        isOpen ? "w-80" : "w-16"
      )}
    >
      <div className={cn(
        "absolute inset-0 glass border-r border-white/20 transition-opacity duration-500",
        !isOpen && "opacity-0 pointer-events-none"
      )} />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 bg-white/80 backdrop-blur-md border border-zinc-200 rounded-full p-1.5 shadow-sm z-30 hover:bg-white transition-all"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className="relative z-10 flex flex-col h-full">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 liquid-glass rounded-2xl flex items-center justify-center text-black shadow-sm">
            <Layout size={22} />
          </div>
          {isOpen && <h1 className="serif font-bold text-2xl tracking-tight text-black">Home</h1>}
        </div>

        {isOpen && (
          <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-8">
            {/* Quick Add */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add to list..."
                  className="flex-1 bg-white/40 border border-white/40 rounded-2xl px-4 py-2.5 text-sm outline-none focus:bg-white/60 transition-all placeholder:text-zinc-600"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button
                  onClick={handleAdd}
                  className="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-2xl hover:scale-105 transition-transform"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat.priority}
                    onClick={() => setSelectedPriority(cat.priority)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider transition-all border",
                      selectedPriority === cat.priority 
                        ? "bg-zinc-800 text-white border-zinc-800" 
                        : "bg-white/30 text-zinc-800 border-white/40 hover:bg-white/50"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-6">
              {categories.map(cat => {
                const catTodos = todos.filter(t => t.priority === cat.priority && !t.completed);
                if (catTodos.length === 0 && cat.priority !== 'none') return null;
                
                return (
                  <div key={cat.priority} className="space-y-3">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", cat.color)} />
                        <span className="text-[10px] font-black text-zinc-900 tracking-widest uppercase">
                          {cat.label} ({catTodos.length})
                        </span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-black transition-all">
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {catTodos.map(todo => (
                        <div 
                          key={todo.id} 
                          className="group flex items-center justify-between p-3 bg-white/30 hover:bg-white/50 rounded-2xl border border-white/20 transition-all cursor-pointer"
                          onClick={() => onCardClick?.(todo)}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Circle 
                              size={18} 
                              className="shrink-0 text-zinc-600 hover:text-black transition-colors" 
                              onClick={(e) => { e.stopPropagation(); onToggleTodo(todo.id); }}
                            />
                            <span className="text-sm text-zinc-900 truncate">{todo.title}</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteTodo(todo.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      ))}
                      {catTodos.length === 0 && (
                        <div className="p-4 border border-dashed border-white/40 rounded-2xl text-center">
                          <span className="text-[10px] text-zinc-700 font-medium">Drop to add</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Done Section */}
              {doneTodos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-black text-zinc-900 tracking-widest uppercase">
                      DONE ({doneTodos.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {doneTodos.map(todo => (
                      <div 
                        key={todo.id} 
                        className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl border border-white/10 opacity-60"
                      >
                        <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                        <span className="text-sm text-zinc-700 line-through truncate">{todo.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
