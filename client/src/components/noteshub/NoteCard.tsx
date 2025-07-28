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
  Share2
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
  onMoveToGroup: (noteId: string, groupId: number | null) => void;
  onEditTags: (noteId: string, tags: string[]) => void;
  formatDate: (date: string) => string;
  isDragging?: boolean;
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
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleMoveToGroup = (groupId: number | null) => {
    onMoveToGroup(note.id, groupId);
  };

  const handleEditTags = () => {
    // For now, just toggle a tag for demonstration
    const currentTags = note.tags || [];
    const newTags = currentTags.includes('edited') 
      ? currentTags.filter(t => t !== 'edited')
      : [...currentTags, 'edited'];
    onEditTags(note.id, newTags);
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
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`bg-slate-800/50 backdrop-blur-sm border-slate-600/50 hover:border-slate-500/70 transition-all ${
                isSelected ? 'ring-2 ring-blue-500/50 shadow-lg' : ''
              } ${note.is_pinned ? 'ring-2 ring-yellow-500/50' : ''} ${
                note.is_archived ? 'opacity-60' : ''
              }`}
              onClick={handleCardClick}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {note.is_pinned && (
                        <Pin className="w-3 h-3 text-yellow-400 fill-current" />
                      )}
                      <h3 className="font-semibold text-white truncate">
                        {note.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(note.updated_at)}</span>
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getGroupColor(note.group_id) }}
                      />
                      <span className="text-xs">{getGroupName(note.group_id)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-slate-300 line-clamp-3 mb-3">
                  {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                  {note.content.length > 150 && '...'}
                </p>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={`text-xs ${getTagColor(tag)}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-slate-600/20 text-slate-300 border-slate-500/30">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </ContextMenuTrigger>
        
        <ContextMenuContent className="bg-slate-900 border-slate-700">
          <ContextMenuItem 
            onClick={handleContextMenuEdit}
            className="text-white hover:bg-slate-800"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Note
          </ContextMenuItem>
          
          <ContextMenuSeparator className="bg-slate-600" />
          
          <ContextMenuItem 
            onClick={handlePin}
            className="text-white hover:bg-slate-800"
          >
            <Pin className="w-4 h-4 mr-2" />
            {note.is_pinned ? 'Unpin' : 'Pin'}
          </ContextMenuItem>
          
          <ContextMenuItem 
            onClick={handleArchive}
            className="text-white hover:bg-slate-800"
          >
            <Archive className="w-4 h-4 mr-2" />
            {note.is_archived ? 'Unarchive' : 'Archive'}
          </ContextMenuItem>
          
          <ContextMenuItem 
            onClick={handleDuplicate}
            className="text-white hover:bg-slate-800"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </ContextMenuItem>
          
          <ContextMenuSeparator className="bg-slate-600" />
          
          <ContextMenuItem 
            onClick={handleEditTags}
            className="text-white hover:bg-slate-800"
          >
            <Tag className="w-4 h-4 mr-2" />
            Edit Tags
          </ContextMenuItem>
          
          <ContextMenuSeparator className="bg-slate-600" />
          
          <ContextMenuItem 
            onClick={handleDelete}
            className="text-red-300 hover:bg-red-500/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Note</h3>
            <p className="text-slate-300 mb-4">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteCard; 