import React, { useState } from 'react';
import { Plus, Layout, ChevronRight, ChevronLeft, Circle, CheckCircle2, Trash2, Edit2, Check } from 'lucide-react';
import { Card, Priority } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  todos: Card[];
  projectTitle: string;
  onUpdateProjectTitle: (title: string) => void;
  onAddTodo: (title: string, priority: Priority) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onRenameTodo: (id: string, title: string) => void;
  onCardClick?: (card: Card) => void;
}

export function Sidebar({ todos, projectTitle, onUpdateProjectTitle, onAddTodo, onToggleTodo, onDeleteTodo, onRenameTodo, onCardClick }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(projectTitle);
  const [newTodo, setNewTodo] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('none');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoTitle, setEditingTodoTitle] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      onAddTodo(newTodo, selectedPriority);
      setNewTodo('');
    }
  };

  const handleTitleSave = () => {
    if (editTitleValue.trim()) {
      onUpdateProjectTitle(editTitleValue);
    } else {
      setEditTitleValue(projectTitle);
    }
    setIsEditingTitle(false);
  };

  const handleRenameTodo = (id: string) => {
    if (editingTodoTitle.trim()) {
      onRenameTodo(id, editingTodoTitle);
    }
    setEditingTodoId(null);
  };

  const startEditingTodo = (e: React.MouseEvent, todo: Card) => {
    e.stopPropagation();
    setEditingTodoId(todo.id);
    setEditingTodoTitle(todo.title);
  };

  const categories: { label: string; priority: Priority; color: string }[] = [
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
          {isOpen && (
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <input
                  autoFocus
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  className="w-full bg-white/40 border border-white/40 rounded-xl px-2 py-1 text-xl font-bold serif outline-none focus:bg-white/60 transition-all text-black"
                />
              ) : (
                <h1 
                  onClick={() => setIsEditingTitle(true)}
                  className="serif font-bold text-2xl tracking-tight text-black cursor-pointer hover:bg-white/20 px-2 py-1 rounded-xl transition-all truncate"
                >
                  {projectTitle}
                </h1>
              )}
            </div>
          )}
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
                          <div className="flex items-center gap-3 overflow-hidden flex-1">
                            <Circle 
                              size={18} 
                              className="shrink-0 text-zinc-600 hover:text-black transition-colors" 
                              onClick={(e) => { e.stopPropagation(); onToggleTodo(todo.id); }}
                            />
                            {editingTodoId === todo.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  autoFocus
                                  value={editingTodoTitle}
                                  onChange={(e) => setEditingTodoTitle(e.target.value)}
                                  onBlur={() => handleRenameTodo(todo.id)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleRenameTodo(todo.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 bg-white/60 border border-white/40 rounded-lg px-2 py-0.5 text-sm outline-none text-black"
                                />
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleRenameTodo(todo.id); }}
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  <Check size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-zinc-900 truncate">{todo.title}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={(e) => startEditingTodo(e, todo)}
                              className="p-1 text-zinc-600 hover:text-black hover:bg-white/40 rounded-lg transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteTodo(todo.id); }}
                              className="p-1 text-zinc-600 hover:text-red-400 hover:bg-white/40 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
                        className="group flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 opacity-60 transition-all cursor-pointer"
                        onClick={() => onToggleTodo(todo.id)}
                      >
                        <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                        <span className="text-sm text-zinc-700 line-through truncate flex-1">{todo.title}</span>
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
