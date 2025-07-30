import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  Tag, 
  Edit3, 
  Save, 
  Trash2, 
  Pin, 
  Archive, 
  Copy, 
  Download,
  MoreVertical,
  Star,
  Share2,
  FolderOpen,
  ChevronRight,
  Plus,
  X,
  RotateCcw,
  Undo2
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  group_id?: number;
  position?: number;
  is_pinned?: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

interface NoteGroup {
  id: number;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface NoteCardProps {
  note: Note;
  noteGroups: NoteGroup[];
  isSelected: boolean;
  onSelect: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  onDuplicate: (noteId: string) => void;
  onPin: (noteId: string, isPinned: boolean) => void;
  onArchive: (noteId: string, isArchived: boolean) => void;
  onMoveToGroup: (noteId: string, groupId: number | undefined) => void;
  onEditTags: (noteId: string, tags: string[]) => void;
  formatDate: (date: string) => string;
  isDragging?: boolean;
  isLoading?: boolean;
  isDeleting?: boolean;
  isMoving?: boolean;
  isPinning?: boolean;
  isArchiving?: boolean;
  isDuplicating?: boolean;
  isEditingTags?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  noteGroups,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  onDuplicate,
  onPin,
  onArchive,
  onMoveToGroup,
  onEditTags,
  formatDate,
  isDragging = false,
  isLoading = false,
  isDeleting = false,
  isMoving = false,
  isPinning = false,
  isArchiving = false,
  isDuplicating = false,
  isEditingTags = false,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditTagsDialog, setShowEditTagsDialog] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingTags, setEditingTags] = useState<string[]>(note.tags || []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-green-500/20 text-green-300 border-green-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'bg-red-500/20 text-red-300 border-red-500/30',
      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    ];
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getGroupName = (groupId?: number) => {
    if (!groupId) return 'Ungrouped';
    const group = noteGroups.find(g => g.id === groupId);
    return group?.name || 'Unknown';
  };

  const getGroupColor = (groupId?: number) => {
    if (!groupId) return '#6b7280';
    const group = noteGroups.find(g => g.id === groupId);
    return group?.color || '#3b82f6';
  };

  const handleMoveToGroup = (groupId: number | undefined) => {
    // Optimistic update - immediately update the note in the UI
    const updatedNote = { ...note, group_id: groupId };
    onUpdate(note.id, { group_id: groupId });
    onMoveToGroup(note.id, groupId);
  };

  const handleMoveToUngrouped = () => {
    handleMoveToGroup(undefined);
  };

  const handleEditTags = () => {
    setEditingTags(note.tags || []);
    setShowEditTagsDialog(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editingTags.includes(newTag.trim())) {
      setEditingTags([...editingTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditingTags(editingTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveTags = () => {
    onEditTags(note.id, editingTags);
    setShowEditTagsDialog(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDuplicate = () => {
    onDuplicate(note.id);
  };

  const handlePin = () => {
    onPin(note.id, !note.is_pinned);
  };

  const handleArchive = () => {
    onArchive(note.id, !note.is_archived);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(note.id);
    setShowDeleteDialog(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(note);
  };

  const handleContextMenuEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(note);
  };

  return (
          <motion.div
      className={`relative group cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-blue-500 bg-slate-800/80' : 'bg-slate-800/40 hover:bg-slate-800/60'
      } rounded-xl border border-slate-700/50 overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(note)}
      whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
      {/* Pin indicator */}
                      {note.is_pinned && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Pin className="w-3 h-3 text-yellow-400" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-white truncate mb-1">
              {note.title || 'Untitled Note'}
                      </h3>
            <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
              {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}
              {note.content.replace(/<[^>]*>/g, '').length > 100 && '...'}
            </p>
                    </div>
                  </div>

        {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-1.5 py-0.5 rounded-full text-xs border ${getTagColor(tag)}`}
                      >
                        {tag}
              </span>
                    ))}
                    {note.tags.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600">
                        +{note.tags.length - 3}
              </span>
                    )}
                  </div>
                )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>{formatDate(note.updated_at)}</span>
            {note.group_id && (
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getGroupColor(note.group_id) }}
                />
                <span className="truncate max-w-16">{getGroupName(note.group_id)}</span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ContextMenu>
              <ContextMenuTrigger asChild>
                                <button
                  className="p-1 hover:bg-slate-700/50 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTags();
                  }}
                  disabled={isEditingTags}
          >
                  <Tag className="w-3 h-3" />
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-slate-900 border-slate-700">
                <ContextMenuItem onClick={handleEditTags}>
                  <Tag className="w-4 h-4 mr-2" /> Edit Tags
          </ContextMenuItem>
                                <ContextMenuItem onClick={() => onPin(note.id, !note.is_pinned)}>
                  {note.is_pinned ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" /> Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4 mr-2" /> Pin
                    </>
                  )}
          </ContextMenuItem>
                <ContextMenuItem onClick={() => onArchive(note.id, !note.is_archived)}>
                  {note.is_archived ? (
                    <>
                      <Undo2 className="w-4 h-4 mr-2" /> Restore
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" /> Archive
                    </>
                  )}
          </ContextMenuItem>
                <ContextMenuItem onClick={() => onDuplicate(note.id)}>
                  <Copy className="w-4 h-4 mr-2" /> Duplicate
          </ContextMenuItem>
                <ContextMenuItem onClick={() => onDelete(note.id)} className="text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
          </div>
              </div>
            </div>
            
      {/* Loading overlay */}
      {(isLoading || isDeleting || isMoving || isPinning || isArchiving || isDuplicating || isEditingTags) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
      )}
    </motion.div>
  );
};

export default NoteCard; 