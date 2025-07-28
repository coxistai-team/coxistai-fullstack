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
  X
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
  onMoveToGroup: (noteId: string, groupId: number | null) => void;
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

  const handleMoveToGroup = (groupId: number | null) => {
    // Optimistic update - immediately update the note in the UI
    const updatedNote = { ...note, group_id: groupId };
    onUpdate(note.id, { group_id: groupId });
    onMoveToGroup(note.id, groupId);
  };

  const handleMoveToUngrouped = () => {
    handleMoveToGroup(null);
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
              } ${isLoading || isDeleting || isMoving ? 'opacity-50 pointer-events-none' : ''}`}
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
            disabled={isLoading || isDeleting}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Note
          </ContextMenuItem>
          
          <ContextMenuSeparator className="bg-slate-600" />
          
          <ContextMenuItem 
            onClick={handlePin}
            className="text-white hover:bg-slate-800"
            disabled={isLoading || isPinning}
          >
            <Pin className="w-4 h-4 mr-2" />
            {isPinning ? 'Pinning...' : note.is_pinned ? 'Unpin' : 'Pin'}
          </ContextMenuItem>
          
          <ContextMenuItem 
            onClick={handleArchive}
            className="text-white hover:bg-slate-800"
            disabled={isLoading || isArchiving}
          >
            <Archive className="w-4 h-4 mr-2" />
            {isArchiving ? 'Archiving...' : note.is_archived ? 'Unarchive' : 'Archive'}
          </ContextMenuItem>
          
          <ContextMenuItem 
            onClick={handleDuplicate}
            className="text-white hover:bg-slate-800"
            disabled={isLoading || isDuplicating}
          >
            <Copy className="w-4 h-4 mr-2" />
            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
          </ContextMenuItem>
          
          <ContextMenuSeparator className="bg-slate-600" />
          
          <ContextMenuItem 
            onClick={handleEditTags}
            className="text-white hover:bg-slate-800"
            disabled={isLoading || isEditingTags}
          >
            <Tag className="w-4 h-4 mr-2" />
            {isEditingTags ? 'Editing Tags...' : 'Edit Tags'}
          </ContextMenuItem>
          
          <ContextMenuSeparator className="bg-slate-600" />
          
          {/* Move to Group Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ContextMenuItem 
                className="text-white hover:bg-slate-800"
                disabled={isLoading || isMoving}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {isMoving ? 'Moving...' : 'Move to Group'}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </ContextMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-slate-700">
              <DropdownMenuItem 
                onClick={handleMoveToUngrouped}
                className="text-white hover:bg-slate-800"
                disabled={isMoving}
              >
                <div className="w-3 h-3 rounded-full bg-slate-500 mr-2" />
                Ungrouped
              </DropdownMenuItem>
              {noteGroups.map((group) => (
                <DropdownMenuItem 
                  key={group.id}
                  onClick={() => handleMoveToGroup(group.id)}
                  className="text-white hover:bg-slate-800"
                  disabled={isMoving}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ContextMenuSeparator className="bg-slate-600" />
          
          <ContextMenuItem 
            onClick={handleDelete}
            className="text-red-300 hover:bg-red-500/20"
            disabled={isLoading || isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
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
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tags Dialog */}
      <Dialog open={showEditTagsDialog} onOpenChange={setShowEditTagsDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Add New Tag
              </label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter tag name..."
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Current Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {editingTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`${getTagColor(tag)} border cursor-pointer hover:opacity-80`}
                  >
                    {tag}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
                {editingTags.length === 0 && (
                  <p className="text-slate-400 text-sm">No tags added yet</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditTagsDialog(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTags}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Save Tags
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteCard; 