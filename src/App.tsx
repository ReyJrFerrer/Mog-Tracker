import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { CardType } from './types';

export default function App() {
  const [quickAdd, setQuickAdd] = useState<{ title: string; type: CardType } | null>(null);

  const handleQuickAdd = (title: string, type: CardType) => {
    setQuickAdd({ title, type });
    // Reset after a short delay so the KanbanBoard can react
    setTimeout(() => setQuickAdd(null), 100);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50">
      <Sidebar 
        onQuickAdd={handleQuickAdd} 
        onAddColumn={() => {
          // This will be handled inside KanbanBoard via a ref or similar if needed, 
          // but for now we'll just let the board have its own add column button.
          // Or we can use a custom event.
          window.dispatchEvent(new CustomEvent('add-column'));
        }} 
      />
      
      <main className="flex-1 h-full overflow-hidden">
        <KanbanBoard 
          externalAddTrigger={quickAdd || undefined}
        />
      </main>
    </div>
  );
}
