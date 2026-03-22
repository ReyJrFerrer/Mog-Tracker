import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlignLeft, 
  CheckSquare, 
  Paperclip, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  MoreHorizontal,
  Clock,
  User,
  Tag,
  Calendar
} from 'lucide-react';
import { Card, Checklist, ChecklistItem, Attachment } from '../types';
import { cn } from '../lib/utils';

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
}

export function CardModal({ card, onClose, onUpdate }: CardModalProps) {
  const [description, setDescription] = useState(card.description || '');
  const [checklists, setChecklists] = useState<Checklist[]>(card.checklists || []);
  const [attachments, setAttachments] = useState<Attachment[]>(card.attachments || []);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    const updatedCard = {
      ...card,
      description,
      checklists,
      attachments,
      lastUpdated: Date.now()
    };
    if (JSON.stringify(updatedCard) !== JSON.stringify(card)) {
      onUpdate(updatedCard);
    }
  }, [description, checklists, attachments]);

  const addChecklist = () => {
    const newChecklist: Checklist = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Checklist',
      items: []
    };
    setChecklists([...checklists, newChecklist]);
  };

  const addChecklistItem = (checklistId: string) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: [...cl.items, { id: Math.random().toString(36).substr(2, 9), title: 'New item', completed: false }]
        };
      }
      return cl;
    }));
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: cl.items.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item)
        };
      }
      return cl;
    }));
  };

  const addAttachment = (type: 'image' | 'link') => {
    const url = prompt(`Enter ${type} URL:`);
    if (url) {
      const newAttachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        url,
        name: url.split('/').pop() || url,
        createdAt: Date.now()
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden liquid-glass rounded-[40px] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-900 tracking-widest uppercase">
              <span>{card.timeOfDay || 'ANYTIME'}</span>
            </div>
            <h2 className="serif text-4xl font-bold text-black leading-tight">{card.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/40 rounded-full transition-all text-zinc-900 hover:text-black"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 space-y-10 custom-scrollbar">
          {/* Quick Info */}
          <div className="flex flex-wrap gap-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-zinc-900 tracking-widest uppercase">Members</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">RJ</div>
                <button className="w-8 h-8 rounded-full glass flex items-center justify-center text-zinc-900 hover:text-black transition-all">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-zinc-900 tracking-widest uppercase">Last updated</span>
              <div className="glass px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-900">
                {new Date(card.lastUpdated || card.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/60 rounded-2xl text-xs font-bold text-zinc-900 transition-all">
              <Tag size={14} /> Labels
            </button>
            <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/60 rounded-2xl text-xs font-bold text-zinc-900 transition-all">
              <Calendar size={14} /> Dates
            </button>
            <button onClick={addChecklist} className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/60 rounded-2xl text-xs font-bold text-zinc-900 transition-all">
              <CheckSquare size={14} /> Checklist
            </button>
            <button onClick={() => addAttachment('link')} className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/60 rounded-2xl text-xs font-bold text-zinc-900 transition-all">
              <Paperclip size={14} /> Attachment
            </button>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-black">
              <AlignLeft size={20} />
              <h3 className="font-bold text-lg">Description</h3>
            </div>
            {isEditingDescription ? (
              <div className="space-y-3">
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  className="w-full min-h-[120px] bg-white/40 border border-white/40 rounded-3xl p-4 text-sm text-zinc-900 outline-none focus:bg-white/60 transition-all"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingDescription(false)}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:scale-105 transition-transform"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setIsEditingDescription(false)}
                    className="px-4 py-2 glass rounded-xl text-xs font-bold text-zinc-900 hover:bg-white/60 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingDescription(true)}
                className="w-full min-h-[80px] bg-white/20 hover:bg-white/40 border border-dashed border-white/40 rounded-3xl p-4 text-sm text-zinc-900 cursor-pointer transition-all"
              >
                {description || "Add a more detailed description..."}
              </div>
            )}
          </div>

          {/* Checklists */}
          {checklists.map(cl => (
            <div key={cl.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-black">
                  <CheckSquare size={20} />
                  <h3 className="font-bold text-lg">{cl.title}</h3>
                </div>
                <button 
                  onClick={() => setChecklists(prev => prev.filter(c => c.id !== cl.id))}
                  className="p-2 glass hover:text-red-500 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="space-y-2">
                {cl.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <input 
                      type="checkbox" 
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(cl.id, item.id)}
                      className="w-5 h-5 rounded-lg border-2 border-white/40 bg-white/20 checked:bg-black transition-all cursor-pointer"
                    />
                    <span className={cn("text-sm text-zinc-900", item.completed && "line-through text-zinc-400")}>
                      {item.title}
                    </span>
                  </div>
                ))}
                <button 
                  onClick={() => addChecklistItem(cl.id)}
                  className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/60 rounded-2xl text-xs font-bold text-zinc-900 transition-all"
                >
                  <Plus size={14} /> Add an item
                </button>
              </div>
            </div>
          ))}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-black">
                <Paperclip size={20} />
                <h3 className="font-bold text-lg">Attachments</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {attachments.map(at => (
                  <div key={at.id} className="group relative liquid-glass p-3 rounded-3xl border border-white/40 hover:bg-white/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-zinc-900">
                        {at.type === 'image' ? <ImageIcon size={20} /> : <LinkIcon size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black truncate">{at.name}</p>
                        <p className="text-[10px] text-zinc-700 font-medium">Added {new Date(at.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAttachments(prev => prev.filter(a => a.id !== at.id))}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 glass hover:text-red-500 rounded-full transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
