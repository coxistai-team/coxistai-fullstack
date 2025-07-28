import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FileText, Clock, Tag, Edit3, Save, Trash2, Plus, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RichTextEditor from '@/components/ui/rich-text-editor';
import GlassmorphismButton from '@/components/ui/glassmorphism-button';
import NoteCard from './NoteCard';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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

interface NotesKanbanBoardProps {
  notes: Note[];
  noteGroups: NoteGroup[];
  viewMode: 'grid' | 'list';
  onNoteSelect: (note: Note) => void;
  onNoteDelete: (noteId: string) => void;
  onNoteUpdate: (noteId: string, updates: Partial<Note>) => void;
  onNoteDuplicate: (noteId: string) => void;
  onNotePin: (noteId: string, isPinned: boolean) => void;
  onNoteArchive: (noteId: string, isArchived: boolean) => void;
  onNoteMoveToGroup: (noteId: string, groupId: number | null) => void;
  onNoteEditTags: (noteId: string, tags: string[]) => void;
  onNoteReorder: (noteId: string, newPosition: number, groupId?: number) => void;
  selectedNote: Note | null;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  onSaveNote: () => void;
  onUpdateNote: (content: string) => void;
  onUpdateNoteTitle: (title: string) => void;
  isSaving: boolean;
  formatDate: (date: string) => string;
  onCreateNoteInGroup: (groupId: number | null) => void;
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

const NotesKanbanBoard: React.FC<NotesKanbanBoardProps> = ({
  notes,
  noteGroups,
  viewMode,
  onNoteSelect,
  onNoteDelete,
  onNoteUpdate,
  onNoteDuplicate,
  onNotePin,
  onNoteArchive,
  onNoteMoveToGroup,
  onNoteEditTags,
  onNoteReorder,
  selectedNote,
  isEditing,
  onEditToggle,
  onSaveNote,
  onUpdateNote,
  onUpdateNoteTitle,
  isSaving,
  formatDate,
  onCreateNoteInGroup,
  autoSaveStatus = 'idle',
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group notes by their group_id, with ungrouped notes in group 0
  const groupedNotes = React.useMemo(() => {
    const groups = new Map<number, { id: number; name: string; description?: string; color: string; notes: Note[] }>();
    
    // Initialize with ungrouped group
    groups.set(0, { id: 0, name: 'Ungrouped', color: '#6b7280', notes: [] });
    
    // Add all note groups
    noteGroups.forEach(group => {
      groups.set(group.id, { 
        id: group.id, 
        name: group.name, 
        description: group.description, 
        color: group.color, 
        notes: [] 
      });
    });
    
    // Distribute notes to their groups
    notes.forEach(note => {
      const groupId = note.group_id || 0;
      const group = groups.get(groupId);
      if (group) {
        group.notes.push(note);
      }
    });
    
    // Sort notes within each group by position
    groups.forEach(group => {
      group.notes.sort((a, b) => (a.position || 0) - (b.position || 0));
    });
    
    return Array.from(groups.values()).sort((a, b) => a.id - b.id);
  }, [notes, noteGroups]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const note = notes.find(n => n.id === active.id);
    setDraggedNote(note || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const activeNote = notes.find(n => n.id === active.id);
      
      if (activeNote && over) {
        // Check if dropping on a group header (group area)
        const groupId = parseInt(over.id as string);
        const targetGroup = groupedNotes.find(g => g.id === groupId);
        
        if (targetGroup) {
          // Dropping on a group - move note to that group
          onNoteMoveToGroup(activeNote.id, groupId === 0 ? null : groupId);
        } else {
          // Dropping on another note
          const overNote = notes.find(n => n.id === over.id);
          if (overNote) {
            // If dropping on a different group
            if (activeNote.group_id !== overNote.group_id) {
              onNoteMoveToGroup(activeNote.id, overNote.group_id || null);
            }
            
            // Reorder within the same group
            const groupNotes = notes.filter(n => n.group_id === overNote.group_id);
            const oldIndex = groupNotes.findIndex(n => n.id === active.id);
            const newIndex = groupNotes.findIndex(n => n.id === over.id);
            
            if (oldIndex !== newIndex) {
              const newPosition = newIndex;
              onNoteReorder(activeNote.id, newPosition, overNote.group_id || undefined);
            }
          }
        }
      }
    }
    
    setActiveId(null);
    setDraggedNote(null);
  };

  const getGroupColor = (color: string) => {
    return color || '#3b82f6';
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            noteGroups={noteGroups}
            isSelected={selectedNote?.id === note.id}
            onSelect={onNoteSelect}
            onDelete={onNoteDelete}
            onUpdate={onNoteUpdate}
            onDuplicate={onNoteDuplicate}
            onPin={onNotePin}
            onArchive={onNoteArchive}
            onMoveToGroup={onNoteMoveToGroup}
            onEditTags={onNoteEditTags}
            formatDate={formatDate}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {groupedNotes.map((group, groupIndex) => (
          <motion.div 
            key={group.id} 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            {/* Group Header - Make it a drop target */}
            <div 
              className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600/30 hover:border-slate-500/50 transition-colors"
              data-group-id={group.id}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getGroupColor(group.color) }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-slate-300">{group.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="bg-slate-700/70 text-slate-200 border-slate-600">
                  {group.notes.length}
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreateNoteInGroup(group.id === 0 ? null : group.id)}
                className="text-blue-300 hover:text-blue-200 hover:bg-slate-700/50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>

            {/* Notes Grid */}
            <SortableContext 
              items={group.notes.map(note => note.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {group.notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    noteGroups={noteGroups}
                    isSelected={selectedNote?.id === note.id}
                    onSelect={onNoteSelect}
                    onDelete={onNoteDelete}
                    onUpdate={onNoteUpdate}
                    onDuplicate={onNoteDuplicate}
                    onPin={onNotePin}
                    onArchive={onNoteArchive}
                    onMoveToGroup={onNoteMoveToGroup}
                    onEditTags={onNoteEditTags}
                    formatDate={formatDate}
                    isDragging={activeId === note.id}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Empty State */}
            {group.notes.length === 0 && (
              <div className="text-center py-8 bg-slate-800/20 rounded-lg border border-slate-700/30">
                <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">No notes in this group</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateNoteInGroup(group.id === 0 ? null : group.id)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add First Note
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedNote ? (
          <NoteCard
            note={draggedNote}
            noteGroups={noteGroups}
            isSelected={false}
            onSelect={() => {}}
            onDelete={() => {}}
            onUpdate={() => {}}
            onDuplicate={() => {}}
            onPin={() => {}}
            onArchive={() => {}}
            onMoveToGroup={() => {}}
            onEditTags={() => {}}
            formatDate={formatDate}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>

      {/* Note Editor Dialog */}
      {selectedNote && (
        <Dialog open={isEditing} onOpenChange={onEditToggle}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center justify-between">
                <span>Edit Note</span>
                <div className="flex items-center gap-2">
                  {autoSaveStatus === 'saving' && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Auto-saving...</span>
                    </div>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <span>✓ Saved</span>
                    </div>
                  )}
                  {autoSaveStatus === 'error' && (
                    <div className="flex items-center gap-2 text-sm text-red-400">
                      <span>✗ Save failed</span>
                    </div>
                  )}
                  {isSaving && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Manual saving...</span>
                    </div>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-title" className="text-white text-sm font-medium">
                  Title
                </Label>
                <Input
                  id="note-title"
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => onUpdateNoteTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Note title..."
                />
              </div>
              
              <div>
                <Label htmlFor="note-content" className="text-white text-sm font-medium">
                  Content
                </Label>
                <RichTextEditor
                  content={selectedNote.content}
                  onUpdate={onUpdateNote}
                  className="min-h-[400px]"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-400">
                  Last updated: {formatDate(selectedNote.updated_at)}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-500">
                    <span className="hidden sm:inline">Keyboard shortcuts: </span>
                    <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Ctrl+S</kbd> Save
                    <span className="mx-1">•</span>
                    <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Esc</kbd> Close
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => onEditToggle(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onSaveNote}
                      disabled={isSaving}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Delete Note</DialogTitle>
            </DialogHeader>
            <p className="text-slate-300">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(null)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (showDeleteDialog) {
                    onNoteDelete(showDeleteDialog);
                    setShowDeleteDialog(null);
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DndContext>
  );
};

export default NotesKanbanBoard; 