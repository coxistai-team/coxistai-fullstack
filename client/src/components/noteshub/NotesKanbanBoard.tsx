import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  rectIntersection,
  pointerWithin,
  useDroppable,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Plus, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NoteCard from './NoteCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RichTextEditor from '@/components/ui/rich-text-editor';
import GlassmorphismButton from '@/components/ui/glassmorphism-button';
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
  loadingOperations?: Set<string>;
  deletingNotes?: Set<string>;
  movingNotes?: Set<string>;
  pinningNotes?: Set<string>;
  archivingNotes?: Set<string>;
  duplicatingNotes?: Set<string>;
  editingTags?: Set<string>;
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
  loadingOperations = new Set(),
  deletingNotes = new Set(),
  movingNotes = new Set(),
  pinningNotes = new Set(),
  archivingNotes = new Set(),
  duplicatingNotes = new Set(),
  editingTags = new Set(),
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [editMode, setEditMode] = useState<'normal' | 'markdown'>('normal');
  const editorRef = useRef<any>(null);

  // Enhanced sensors for better drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Enhanced collision detection
  const collisionDetectionStrategy = (args: any) => {
    // First, let's see if we have any droppable areas
    const pointerIntersections = pointerWithin(args);
    
    if (pointerIntersections.length > 0) {
      return pointerIntersections;
    }
    
    // If not, fall back to rectangle intersection
    return rectIntersection(args);
  };

  // Group notes by their group_id
  const groupedNotes = useMemo(() => {
    const groups = new Map<number, { id: number; name: string; color: string; notes: Note[] }>();
    
    // Add ungrouped notes (group_id is null or undefined)
    groups.set(0, { id: 0, name: 'Ungrouped', color: '#6b7280', notes: [] });
    
    // Add all note groups
    noteGroups.forEach(group => {
      groups.set(group.id, { 
        id: group.id, 
        name: group.name, 
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
    
    if (active.id !== over?.id && over) {
      const activeNote = notes.find(n => n.id === active.id);
      
      if (activeNote) {
        // Check if dropping on a group header (group area)
        const overId = String(over.id); // Convert to string safely
        
        // Check if dropping on a group header (starts with "group-")
        if (overId.startsWith('group-')) {
          const groupId = parseInt(overId.replace('group-', ''));
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

  // Droppable Group Header Component
  const DroppableGroupHeader: React.FC<{
    group: { id: number; name: string; color: string; notes: Note[] };
    onCreateNoteInGroup: (groupId: number | null) => void;
    activeId: string | null;
  }> = ({ group, onCreateNoteInGroup, activeId }) => {
    const { setNodeRef } = useDroppable({
      id: `group-${group.id}`,
    });

    return (
      <div 
        ref={setNodeRef}
        className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 group"
        data-group-id={group.id}
        style={{
          borderColor: activeId ? getGroupColor(group.color) : undefined,
          backgroundColor: activeId ? `${getGroupColor(group.color)}10` : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: getGroupColor(group.color) }}
          />
          <div>
            <h3 className="text-lg font-semibold text-white">{group.name}</h3>
            {activeId && (
              <p className="text-xs text-slate-400 mt-1">
                Drop note here to move to this group
              </p>
            )}
          </div>
          <Badge variant="secondary" className="bg-slate-700/70 text-slate-200 border-slate-600">
            {group.notes.length}
          </Badge>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateNoteInGroup(group.id === 0 ? null : group.id)}
          className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/70"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Note
        </Button>
      </div>
    );
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
            isLoading={loadingOperations.has(note.id)}
            isDeleting={deletingNotes.has(note.id)}
            isMoving={movingNotes.has(note.id)}
            isPinning={pinningNotes.has(note.id)}
            isArchiving={archivingNotes.has(note.id)}
            isDuplicating={duplicatingNotes.has(note.id)}
            isEditingTags={editingTags.has(note.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
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
            {/* Group Header - Enhanced drop target with visual feedback */}
            <DroppableGroupHeader
              group={group}
              onCreateNoteInGroup={onCreateNoteInGroup}
              activeId={activeId}
            />

            {/* Notes Grid with enhanced sortable context */}
            <SortableContext 
              items={group.notes.map(note => note.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[100px]">
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
                    isLoading={loadingOperations.has(note.id)}
                    isDeleting={deletingNotes.has(note.id)}
                    isMoving={movingNotes.has(note.id)}
                    isPinning={pinningNotes.has(note.id)}
                    isArchiving={archivingNotes.has(note.id)}
                    isDuplicating={duplicatingNotes.has(note.id)}
                    isEditingTags={editingTags.has(note.id)}
                  />
                ))}
                
                {/* Empty state with drop zone styling */}
                {group.notes.length === 0 && (
                  <div className="col-span-full flex items-center justify-center p-8 border-2 border-dashed border-slate-600/30 rounded-lg bg-slate-800/20">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-400 text-sm">No notes in this group</p>
                      <p className="text-slate-500 text-xs">Drag notes here or click "Add Note"</p>
                    </div>
                  </div>
                )}
              </div>
            </SortableContext>
          </motion.div>
        ))}
      </div>

      {/* Drag Overlay for better visual feedback */}
      <DragOverlay>
        {draggedNote ? (
          <div className="transform rotate-3 scale-105">
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
              isLoading={loadingOperations.has(draggedNote.id)}
              isDeleting={deletingNotes.has(draggedNote.id)}
              isMoving={movingNotes.has(draggedNote.id)}
              isPinning={pinningNotes.has(draggedNote.id)}
              isArchiving={archivingNotes.has(draggedNote.id)}
              isDuplicating={duplicatingNotes.has(draggedNote.id)}
              isEditingTags={editingTags.has(draggedNote.id)}
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* Note Editor Dialog */}
      {selectedNote && (
        <Dialog open={isEditing} onOpenChange={onEditToggle}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center justify-between">
                <span>Edit Note</span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => editorRef.current?.exportToPDF()}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 border-2 border-transparent hover:border-white/20"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
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
              {/* Note Title */}
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
              
              {/* Edit Mode Toggle */}
              <div className="flex items-center gap-2">
                <Label className="text-white text-sm font-medium">Edit Mode:</Label>
                <Button
                  type="button"
                  variant={editMode === 'normal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditMode('normal')}
                  className="text-xs"
                >
                  Normal Edit
                </Button>
                <Button
                  type="button"
                  variant={editMode === 'markdown' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditMode('markdown')}
                  className="text-xs"
                >
                  Markdown Edit
                </Button>
              </div>
              
              {/* Note Content */}
              <div>
                <Label htmlFor="note-content" className="text-white text-sm font-medium">
                  Content
                </Label>
                <div className="mt-2">
                  {editMode === 'normal' ? (
                    <RichTextEditor
                      ref={editorRef}
                      content={selectedNote.content}
                      onUpdate={onUpdateNote}
                      title={selectedNote.title}
                      mode="simple"
                      className="min-h-[400px]"
                    />
                  ) : (
                    <RichTextEditor
                      ref={editorRef}
                      content={selectedNote.content}
                      onUpdate={onUpdateNote}
                      title={selectedNote.title}
                      mode="rich"
                      className="min-h-[400px]"
                    />
                  )}
                </div>
              </div>
              
              {/* Note Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <Label className="text-white text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNote.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-200">
                        {tag}
                      </Badge>
                    ))}
                    {(!selectedNote.tags || selectedNote.tags.length === 0) && (
                      <span className="text-slate-500 text-sm">No tags</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-white text-sm font-medium">Group</Label>
                  <div className="mt-1">
                    {selectedNote.group_id ? (
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {noteGroups.find(g => g.id === selectedNote.group_id)?.name || 'Unknown Group'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        Ungrouped
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-white text-sm font-medium">Status</Label>
                  <div className="flex gap-1 mt-1">
                    {selectedNote.is_pinned && (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-300">
                        Pinned
                      </Badge>
                    )}
                    {selectedNote.is_archived && (
                      <Badge variant="outline" className="border-orange-500 text-orange-300">
                        Archived
                      </Badge>
                    )}
                    {!selectedNote.is_pinned && !selectedNote.is_archived && (
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Bar */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-700">
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
    </DndContext>
  );
};

export default NotesKanbanBoard; 