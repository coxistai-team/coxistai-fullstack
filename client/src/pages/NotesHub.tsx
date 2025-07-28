import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useLoading } from '@/contexts/LoadingContext';
import { useToast } from '@/hooks/use-toast';
import ParticleField from '@/components/effects/ParticleField';
import NotesSidebar from '@/components/noteshub/NotesSidebar';
import NotesKanbanBoard from '@/components/noteshub/NotesKanbanBoard';
import NotesTopToolbar from '@/components/noteshub/NotesTopToolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// ErrorBoundary for Notes
class NotesErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error('NotesHub error:', error, info); }
  render() { 
    if (this.state.hasError) return <div className="text-red-500 text-center py-8">Something went wrong in NotesHub.</div>; 
    return this.props.children; 
  }
}

// Custom hook for debouncing
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const NotesHub = () => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const { showLoader, hideLoader } = useLoading();
  const { toast } = useToast();
  
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteGroups, setNoteGroups] = useState<NoteGroup[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Debounce the editing note changes
  const debouncedEditingNote = useDebounce(editingNote, 1000); // 1 second delay

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch notes and groups on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if not authenticated or still loading auth
      if (!isAuthenticated || isAuthLoading || hasLoaded) {
        return;
      }
      
      const token = getAuthToken();
      if (!token) {
        return;
      }
      
      setIsLoading(true);
      showLoader('Loading notes...');
      try {
        const [notesResponse, groupsResponse] = await Promise.all([
          fetch(`${API_URL}/api/notes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/note-groups`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (notesResponse.ok && groupsResponse.ok) {
          const notesData = await notesResponse.json();
          const groupsData = await groupsResponse.json();
          setNotes(notesData);
          setNoteGroups(groupsData);
          setHasLoaded(true);
        } else {
          console.error('Notes response:', notesResponse.status, notesResponse.statusText);
          console.error('Groups response:', groupsResponse.status, groupsResponse.statusText);
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load notes and groups.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        hideLoader();
      }
    };

    fetchData();
  }, [isAuthenticated, isAuthLoading, hasLoaded, API_URL]);

  // Auto-save when debounced editing note changes
  useEffect(() => {
    if (debouncedEditingNote && selectedNote) {
      handleUpdateNote(selectedNote.id, debouncedEditingNote);
    }
  }, [debouncedEditingNote]);

  // Filter notes based on search, group, and tags
  const filteredNotes = useMemo(() => {
    return notes.filter((note: Note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesGroup = selectedGroup === null || note.group_id === selectedGroup;
      
      const matchesTags = selectedTags.length === 0 || 
                         note.tags.some(tag => selectedTags.includes(tag));
      
      return matchesSearch && matchesGroup && matchesTags;
    });
  }, [notes, searchQuery, selectedGroup, selectedTags]);

  // Format date helper
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Note CRUD operations
  const handleCreateNote = async (noteData: any) => {
    const token = getAuthToken();
    if (!token) return;
    
    setIsCreating(true);
    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes(prev => [...prev, newNote]);
        setShowNewNoteDialog(false);
        toast({
          title: "Success",
          description: "Note created successfully.",
        });
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to create note: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create note.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Optimistic updates for better UX
  const handleOptimisticUpdate = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    ));
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Optimistic update
    handleOptimisticUpdate(noteId, updates);
    
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(prev => prev.map(note => 
          note.id === noteId ? updatedNote : note
        ));
        setSelectedNote(updatedNote);
        // Only show toast for manual saves, not auto-saves
        if (!debouncedEditingNote) {
          toast({
            title: "Success",
            description: "Note updated successfully.",
          });
        }
      } else {
        const errorData = await response.text();
        console.error('Server response:', response.status, errorData);
        // Revert optimistic update on error
        setNotes(prev => prev.map(note => 
          note.id === noteId ? { ...note, ...updates } : note
        ));
        throw new Error(`Failed to update note: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update note.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
          setIsEditing(false);
          setEditingNote(null);
        }
        toast({
          title: "Success",
          description: "Note deleted successfully.",
        });
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to delete note: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateNote = async (noteId: string) => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const duplicatedNote = await response.json();
        setNotes(prev => [...prev, duplicatedNote]);
        toast({
          title: "Success",
          description: "Note duplicated successfully.",
        });
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to duplicate note: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error duplicating note:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to duplicate note.",
        variant: "destructive",
      });
    }
  };

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_pinned: isPinned })
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(prev => prev.map(note => 
          note.id === noteId ? updatedNote : note
        ));
        if (selectedNote?.id === noteId) {
          setSelectedNote(updatedNote);
        }
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to pin/unpin note: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error pinning note:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to pin/unpin note.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveNote = async (noteId: string, isArchived: boolean) => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_archived: isArchived })
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(prev => prev.map(note => 
          note.id === noteId ? updatedNote : note
        ));
        if (selectedNote?.id === noteId) {
          setSelectedNote(updatedNote);
        }
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to archive/unarchive note: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error archiving note:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to archive/unarchive note.",
        variant: "destructive",
      });
    }
  };

  const handleMoveNoteToGroup = async (noteId: string, groupId: number | null) => {
    await handleUpdateNote(noteId, { group_id: groupId || undefined });
  };

  const handleEditNoteTags = async (noteId: string, tags: string[]) => {
    await handleUpdateNote(noteId, { tags });
  };

  const handleReorderNote = async (noteId: string, newPosition: number, groupId?: number) => {
    await handleUpdateNote(noteId, { position: newPosition, group_id: groupId });
  };

  // Group CRUD operations
  const handleCreateGroup = async (groupData: any) => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/note-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        const newGroup = await response.json();
        setNoteGroups(prev => [...prev, newGroup]);
        setShowNewGroupDialog(false);
        toast({
          title: "Success",
          description: "Group created successfully.",
        });
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to create group: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group.",
        variant: "destructive",
      });
    }
  };

  const handleRenameGroup = async (groupId: number, newName: string) => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/note-groups/${groupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        setNoteGroups(prev => prev.map(group => 
          group.id === groupId ? updatedGroup : group
        ));
        toast({
          title: "Success",
          description: "Group renamed successfully.",
        });
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to rename group: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error renaming group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rename group.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/note-groups/${groupId}?moveNotesToUngrouped=true`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNoteGroups(prev => prev.filter(group => group.id !== groupId));
        // Move notes to ungrouped
        setNotes(prev => prev.map(note => 
          note.group_id === groupId ? { ...note, group_id: undefined } : note
        ));
        toast({
          title: "Success",
          description: "Group deleted and notes moved to ungrouped.",
        });
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to delete group: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete group.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNoteInGroup = (groupId: number | null) => {
    setShowNewNoteDialog(true);
    // The group selection will be handled in the dialog
  };

  // Save note content (manual save)
  const handleSaveNote = async () => {
    if (!selectedNote) return;
    
    setIsSaving(true);
    try {
      await handleUpdateNote(selectedNote.id, { content: selectedNote.content });
      setIsEditing(false);
      setEditingNote(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Update note content (for real-time editing)
  const handleUpdateNoteContent = (content: string) => {
    if (selectedNote) {
      setSelectedNote({ ...selectedNote, content });
      setEditingNote({ content });
    }
  };

  // Update note title (for real-time editing)
  const handleUpdateNoteTitle = (title: string) => {
    if (selectedNote) {
      setSelectedNote({ ...selectedNote, title });
      setEditingNote({ title });
    }
  };

  // Handle note selection
  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setEditingNote(null); // Reset editing state
  };

  // Handle edit toggle
  const handleEditToggle = (editing: boolean) => {
    setIsEditing(editing);
    if (!editing) {
      setSelectedNote(null);
      setEditingNote(null);
    }
  };

  // Show loading state while auth is loading
  if (isAuthLoading || isLoading) {
    return (
      <main className="relative z-10 pt-16 bg-black text-white overflow-hidden">
        <ParticleField />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="relative z-10 pt-16 bg-black text-white overflow-hidden">
        <ParticleField />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-400 mb-4">Please log in to access NotesHub.</p>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditing && selectedNote) {
          handleSaveNote();
        }
      }
      
      // Escape to close editor
      if (e.key === 'Escape' && isEditing) {
        handleEditToggle(false);
      }
      
      // Ctrl/Cmd + N to create new note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowNewNoteDialog(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, selectedNote]);

  // Auto-save indicator
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Update auto-save status
  useEffect(() => {
    if (editingNote) {
      setAutoSaveStatus('saving');
      const timer = setTimeout(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [editingNote]);

  return (
    <NotesErrorBoundary>
      <main className="relative z-10 pt-16 bg-black text-white overflow-hidden">
        <ParticleField />
        <div className="flex h-screen">
          <NotesSidebar
            noteGroups={noteGroups}
            selectedGroup={selectedGroup}
            onGroupSelect={setSelectedGroup}
            onCreateGroup={() => setShowNewGroupDialog(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            notes={notes}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            onGroupRename={handleRenameGroup}
            onGroupDelete={handleDeleteGroup}
          />

          <div className="flex-1 flex flex-col">
            <NotesTopToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onCreateNote={() => setShowNewNoteDialog(true)}
              selectedGroup={selectedGroup}
              noteGroups={noteGroups}
            />

            <div className="flex-1 p-6 overflow-auto">
              <NotesKanbanBoard
                notes={filteredNotes}
                noteGroups={noteGroups}
                viewMode={viewMode}
                onNoteSelect={handleNoteSelect}
                onNoteDelete={handleDeleteNote}
                onNoteUpdate={handleUpdateNote}
                onNoteDuplicate={handleDuplicateNote}
                onNotePin={handlePinNote}
                onNoteArchive={handleArchiveNote}
                onNoteMoveToGroup={handleMoveNoteToGroup}
                onNoteEditTags={handleEditNoteTags}
                onNoteReorder={handleReorderNote}
                selectedNote={selectedNote}
                isEditing={isEditing}
                onEditToggle={handleEditToggle}
                onSaveNote={handleSaveNote}
                onUpdateNote={handleUpdateNoteContent}
                onUpdateNoteTitle={handleUpdateNoteTitle}
                isSaving={isSaving}
                formatDate={formatDate}
                onCreateNoteInGroup={handleCreateNoteInGroup}
                autoSaveStatus={autoSaveStatus}
              />
            </div>
          </div>
        </div>

        {/* New Note Dialog */}
        <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Note</DialogTitle>
            </DialogHeader>
            <NewNoteForm 
              noteGroups={noteGroups}
              onSubmit={handleCreateNote}
              onCancel={() => setShowNewNoteDialog(false)}
              isCreating={isCreating}
            />
          </DialogContent>
        </Dialog>

        {/* New Group Dialog */}
        <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Group</DialogTitle>
            </DialogHeader>
            <NewGroupForm 
              onSubmit={handleCreateGroup}
              onCancel={() => setShowNewGroupDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </NotesErrorBoundary>
  );
};

// New Note Form Component
const NewNoteForm: React.FC<{
  noteGroups: NoteGroup[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isCreating: boolean;
}> = ({ noteGroups, onSubmit, onCancel, isCreating }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [groupId, setGroupId] = useState<string>('ungrouped');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onSubmit({
      title,
      content,
      tags: tagArray,
      group_id: groupId === 'ungrouped' ? undefined : parseInt(groupId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-white">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="content" className="text-white">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content..."
          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[100px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="tags" className="text-white">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="work, ideas, important..."
          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <Label htmlFor="group" className="text-white">Group</Label>
        <Select value={groupId} onValueChange={setGroupId}>
          <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <SelectValue placeholder="Select a group (optional)" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="ungrouped">Ungrouped</SelectItem>
            {noteGroups.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isCreating}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isCreating ? 'Creating...' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
};

// New Group Form Component
const NewGroupForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, color });
  };

  const colors = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', 
    '#ef4444', '#06b6d4', '#84cc16', '#f97316'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name..."
          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description" className="text-white">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter group description..."
          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <Label className="text-white">Color</Label>
        <div className="flex gap-2 mt-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                color === c ? 'border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Create Group
        </Button>
      </div>
    </form>
  );
};

export default NotesHub;