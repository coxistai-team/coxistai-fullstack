import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useLoading } from '@/contexts/LoadingContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
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
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Menu, X, BookOpen } from 'lucide-react';

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
  const isMobile = useIsMobile();
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
  const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{ id: number; name: string; noteCount: number } | null>(null);
  const [showRenameGroupDialog, setShowRenameGroupDialog] = useState(false);
  const [groupToRename, setGroupToRename] = useState<{ id: number; name: string } | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Loading states for individual operations
  const [loadingOperations, setLoadingOperations] = useState<Set<string>>(new Set());
  const [deletingNotes, setDeletingNotes] = useState<Set<string>>(new Set());
  const [movingNotes, setMovingNotes] = useState<Set<string>>(new Set());
  const [pinningNotes, setPinningNotes] = useState<Set<string>>(new Set());
  const [archivingNotes, setArchivingNotes] = useState<Set<string>>(new Set());
  const [duplicatingNotes, setDuplicatingNotes] = useState<Set<string>>(new Set());
  const [editingTags, setEditingTags] = useState<Set<string>>(new Set());
  const [deletingGroups, setDeletingGroups] = useState<Set<number>>(new Set());
  const [creatingGroups, setCreatingGroups] = useState(false);
  const [renamingGroups, setRenamingGroups] = useState<Set<number>>(new Set());

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

  // Filter notes based on search, group, and tags
  const filteredNotes = useMemo(() => {
    return notes.filter((note: Note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Handle group filtering
      let matchesGroup = true;
      if (selectedGroup !== null) {
        if (selectedGroup === 0) {
          // Ungrouped: show notes with no group_id (undefined, null, or 0)
          matchesGroup = !note.group_id || note.group_id === 0;
        } else {
          // Specific group: show notes that belong to this group
          matchesGroup = note.group_id === selectedGroup;
        }
      }
      
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

  // Optimistic updates for better UX
  const handleOptimisticUpdate = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    ));
  };

  // Note CRUD operations
  const handleCreateNote = async (noteData: any) => {
    const token = getAuthToken();
    if (!token) return;
    
    setIsCreating(true);
    
    // Optimistic update - add note immediately to UI
    const optimisticNote: Note = {
      id: `temp-${Date.now()}`, // Temporary ID
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags || [],
      group_id: noteData.group_id,
      position: 0,
      is_pinned: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setNotes(prev => [...prev, optimisticNote]);
    setShowNewNoteDialog(false);
    
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
        // Replace optimistic note with real note
        setNotes(prev => prev.map(note => 
          note.id === optimisticNote.id ? newNote : note
        ));
        toast({
          title: "Success",
          description: "Note created successfully.",
        });
      } else {
        // Remove optimistic note on error
        setNotes(prev => prev.filter(note => note.id !== optimisticNote.id));
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

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Add to loading operations
    setLoadingOperations(prev => new Set(prev).add(noteId));
    
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
    } finally {
      setLoadingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Add to deleting notes
    setDeletingNotes(prev => new Set(prev).add(noteId));
    
    // Optimistic update - remove note immediately
    const noteToDelete = notes.find(note => note.id === noteId);
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
      setEditingNote(null);
    }
    
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Note deleted successfully.",
        });
      } else {
        // Revert optimistic update on error
        if (noteToDelete) {
          setNotes(prev => [...prev, noteToDelete]);
        }
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
    } finally {
      setDeletingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const handleDuplicateNote = async (noteId: string) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Add to duplicating notes
    setDuplicatingNotes(prev => new Set(prev).add(noteId));
    
    // Optimistic update - add duplicated note immediately
    const originalNote = notes.find(note => note.id === noteId);
    if (originalNote) {
      const optimisticDuplicatedNote: Note = {
        ...originalNote,
        id: `temp-${Date.now()}`,
        title: originalNote.title + " (Copy)",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setNotes(prev => [...prev, optimisticDuplicatedNote]);
    }
    
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const duplicatedNote = await response.json();
        // Replace optimistic note with real note
        setNotes(prev => prev.map(note => 
          note.id === `temp-${Date.now() - 1}` ? duplicatedNote : note
        ));
        toast({
          title: "Success",
          description: "Note duplicated successfully.",
        });
      } else {
        // Remove optimistic note on error
        setNotes(prev => prev.filter(note => !note.id.startsWith('temp-')));
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
    } finally {
      setDuplicatingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Add to pinning notes
    setPinningNotes(prev => new Set(prev).add(noteId));
    
    // Optimistic update
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, is_pinned: isPinned } : note
    ));
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, is_pinned: isPinned } : null);
    }
    
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
        // Revert optimistic update on error
        setNotes(prev => prev.map(note => 
          note.id === noteId ? { ...note, is_pinned: !isPinned } : note
        ));
        if (selectedNote?.id === noteId) {
          setSelectedNote(prev => prev ? { ...prev, is_pinned: !isPinned } : null);
        }
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
    } finally {
      setPinningNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const handleArchiveNote = async (noteId: string, isArchived: boolean) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Add to archiving notes
    setArchivingNotes(prev => new Set(prev).add(noteId));
    
    // Optimistic update
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, is_archived: isArchived } : note
    ));
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, is_archived: isArchived } : null);
    }
    
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
        // Revert optimistic update on error
        setNotes(prev => prev.map(note => 
          note.id === noteId ? { ...note, is_archived: !isArchived } : note
        ));
        if (selectedNote?.id === noteId) {
          setSelectedNote(prev => prev ? { ...prev, is_archived: !isArchived } : null);
        }
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
    } finally {
      setArchivingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const handleMoveNoteToGroup = async (noteId: string, groupId: number | null) => {
    // Add to moving notes
    setMovingNotes(prev => new Set(prev).add(noteId));
    
    // Optimistic update - immediately update the note in the UI
    const updatedNoteData = { group_id: groupId || undefined };
    
    // Update the note in the local state immediately
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, ...updatedNoteData } : note
    ));
    
    // Update selected note if it's the one being moved
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, ...updatedNoteData } : null);
    }
    
    try {
      await handleUpdateNote(noteId, updatedNoteData);
      toast({
        title: "Success",
        description: "Note moved successfully.",
      });
    } catch (error) {
      // Revert optimistic update on error
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, group_id: note.group_id } : note
      ));
      if (selectedNote?.id === noteId) {
        setSelectedNote(prev => prev ? { ...prev, group_id: prev.group_id } : null);
      }
      toast({
        title: "Error",
        description: "Failed to move note.",
        variant: "destructive",
      });
    } finally {
      setMovingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const handleEditNoteTags = async (noteId: string, tags: string[]) => {
    // Add to editing tags
    setEditingTags(prev => new Set(prev).add(noteId));
    
    // Optimistic update
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, tags } : note
    ));
    if (selectedNote?.id === noteId) {
      setSelectedNote(prev => prev ? { ...prev, tags } : null);
    }
    
    try {
      await handleUpdateNote(noteId, { tags });
      toast({
        title: "Success",
        description: "Tags updated successfully.",
      });
    } catch (error) {
      // Revert optimistic update on error
      const originalNote = notes.find(note => note.id === noteId);
      if (originalNote) {
        setNotes(prev => prev.map(note => 
          note.id === noteId ? { ...note, tags: originalNote.tags } : note
        ));
        if (selectedNote?.id === noteId) {
          setSelectedNote(prev => prev ? { ...prev, tags: originalNote.tags } : null);
        }
      }
      toast({
        title: "Error",
        description: "Failed to update tags.",
        variant: "destructive",
      });
    } finally {
      setEditingTags(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const handleReorderNote = async (noteId: string, newPosition: number, groupId?: number) => {
    await handleUpdateNote(noteId, { position: newPosition, group_id: groupId });
  };

  // Group CRUD operations
  const handleCreateGroup = async (groupData: any) => {
    const token = getAuthToken();
    if (!token) return;
    
    setCreatingGroups(true);
    
    // Optimistic update - add group immediately
    const optimisticGroup: NoteGroup = {
      id: -Date.now(), // Temporary negative ID
      name: groupData.name,
      description: groupData.description,
      color: groupData.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setNoteGroups(prev => [...prev, optimisticGroup]);
    setShowNewGroupDialog(false);
    
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
        // Replace optimistic group with real group
        setNoteGroups(prev => prev.map(group => 
          group.id === optimisticGroup.id ? newGroup : group
        ));
        toast({
          title: "Success",
          description: "Group created successfully.",
        });
      } else {
        // Remove optimistic group on error
        setNoteGroups(prev => prev.filter(group => group.id !== optimisticGroup.id));
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
    } finally {
      setCreatingGroups(false);
    }
  };

  const handleRenameGroup = async (groupId: number, newName: string) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Add to renaming groups
    setRenamingGroups(prev => new Set(prev).add(groupId));
    
    // Optimistic update
    setNoteGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, name: newName } : group
    ));
    
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
        // Revert optimistic update on error
        const originalGroup = noteGroups.find(g => g.id === groupId);
        if (originalGroup) {
          setNoteGroups(prev => prev.map(group => 
            group.id === groupId ? originalGroup : group
          ));
        }
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
    } finally {
      setRenamingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleRenameGroupClick = (groupId: number, currentName: string) => {
    setGroupToRename({ id: groupId, name: currentName });
    setNewGroupName(currentName);
    setShowRenameGroupDialog(true);
  };

  const confirmRenameGroup = async () => {
    if (!groupToRename || !newGroupName.trim()) return;
    
    await handleRenameGroup(groupToRename.id, newGroupName.trim());
    setShowRenameGroupDialog(false);
    setGroupToRename(null);
    setNewGroupName('');
  };

  const handleDeleteGroup = async (groupId: number) => {
    // Check if group has notes
    const notesInGroup = notes.filter(note => note.group_id === groupId);
    const hasNotes = notesInGroup.length > 0;
    const group = noteGroups.find(g => g.id === groupId);
    
    if (!group) return;
    
    if (hasNotes) {
      // Show confirmation dialog
      setGroupToDelete({
        id: groupId,
        name: group.name,
        noteCount: notesInGroup.length
      });
      setShowDeleteGroupDialog(true);
    } else {
      // No notes in group, just delete the group
      await deleteGroupOnly(groupId);
    }
  };

  const confirmDeleteGroup = async (deleteNotes: boolean) => {
    if (!groupToDelete) return;
    
    if (deleteNotes) {
      await deleteGroupAndNotes(groupToDelete.id);
    } else {
      await deleteGroupAndMoveNotes(groupToDelete.id);
    }
    
    setShowDeleteGroupDialog(false);
    setGroupToDelete(null);
  };

  const deleteGroupAndMoveNotes = async (groupId: number) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Add to deleting groups
    setDeletingGroups(prev => new Set(prev).add(groupId));
    
    try {
      // Optimistic update - move notes to ungrouped immediately
      setNotes(prev => prev.map(note => 
        note.group_id === groupId ? { ...note, group_id: undefined } : note
      ));
      
      const response = await fetch(`${API_URL}/api/note-groups/${groupId}?moveNotesToUngrouped=true`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNoteGroups(prev => prev.filter(group => group.id !== groupId));
        toast({
          title: "Success",
          description: "Group deleted and notes moved to ungrouped.",
        });
      } else {
        // Revert optimistic update on error
        setNotes(prev => prev.map(note => 
          note.group_id === undefined ? { ...note, group_id: groupId } : note
        ));
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
    } finally {
      setDeletingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const deleteGroupAndNotes = async (groupId: number) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Add to deleting groups
    setDeletingGroups(prev => new Set(prev).add(groupId));
    
    try {
      // Optimistic update - remove notes from UI immediately
      const notesToDelete = notes.filter(note => note.group_id === groupId);
      setNotes(prev => prev.filter(note => note.group_id !== groupId));
      
      // Delete notes first, then delete group
      for (const note of notesToDelete) {
        await fetch(`${API_URL}/api/notes/${note.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      const response = await fetch(`${API_URL}/api/note-groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNoteGroups(prev => prev.filter(group => group.id !== groupId));
        toast({
          title: "Success",
          description: "Group and all notes deleted successfully.",
        });
      } else {
        // Revert optimistic update on error
        setNotes(prev => [...prev, ...notesToDelete]);
        const errorData = await response.text();
        throw new Error(`Failed to delete group: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error deleting group and notes:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete group and notes.",
        variant: "destructive",
      });
    } finally {
      setDeletingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const deleteGroupOnly = async (groupId: number) => {
    const token = getAuthToken();
    if (!token) return;
    
    // Add to deleting groups
    setDeletingGroups(prev => new Set(prev).add(groupId));
    
    try {
      // Optimistic update - remove group from UI immediately
      setNoteGroups(prev => prev.filter(group => group.id !== groupId));
      
      const response = await fetch(`${API_URL}/api/note-groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Group deleted successfully.",
        });
      } else {
        // Revert optimistic update on error
        const groupToRestore = noteGroups.find(g => g.id === groupId);
        if (groupToRestore) {
          setNoteGroups(prev => [...prev, groupToRestore]);
        }
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
    } finally {
      setDeletingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
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
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <NotesErrorBoundary>
      <main className="relative z-10 pt-16 bg-black text-white overflow-hidden">
        <ParticleField />
        <div className="flex h-screen">
          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && isMobile && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed top-16 inset-x-0 bottom-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                
                <motion.div
                  initial={{ x: -320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -320, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed top-16 bottom-0 left-0 w-80 glassmorphism-enhanced border-r border-white/20 z-50 flex flex-col shadow-2xl"
                >
                  <NotesSidebar
                    noteGroups={noteGroups}
                    selectedGroup={selectedGroup}
                    onGroupSelect={(group) => {
                      setSelectedGroup(group);
                      setSidebarOpen(false);
                    }}
                    onCreateGroup={() => setShowNewGroupDialog(true)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    notes={notes}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    onGroupRename={handleRenameGroupClick}
                    onGroupDelete={handleDeleteGroup}
                    deletingGroups={deletingGroups}
                    creatingGroups={creatingGroups}
                    renamingGroups={renamingGroups}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          {!isMobile && (
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
            onGroupRename={handleRenameGroupClick}
            onGroupDelete={handleDeleteGroup}
            deletingGroups={deletingGroups}
            creatingGroups={creatingGroups}
            renamingGroups={renamingGroups}
          />
          )}

          <div className={`flex-1 flex flex-col ${!isMobile ? '' : 'w-full'}`}>
            {/* Mobile Header */}
            {isMobile && (
              <div className="flex items-center justify-between p-4 border-b border-white/10 glassmorphism-enhanced">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-xl font-bold text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                  NotesHub
                </h1>
                <div className="w-10" />
              </div>
            )}

            <NotesTopToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onCreateNote={() => setShowNewNoteDialog(true)}
              selectedGroup={selectedGroup}
              noteGroups={noteGroups}
            />

            <div className="flex-1 p-3 sm:p-6 overflow-auto">
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
                loadingOperations={loadingOperations}
                deletingNotes={deletingNotes}
                movingNotes={movingNotes}
                pinningNotes={pinningNotes}
                archivingNotes={archivingNotes}
                duplicatingNotes={duplicatingNotes}
                editingTags={editingTags}
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

        {/* Rename Group Dialog */}
        <Dialog open={showRenameGroupDialog} onOpenChange={setShowRenameGroupDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Rename Group</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="newGroupName" className="text-white">New Group Name</Label>
              <Input
                id="newGroupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter new group name..."
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRenameGroupDialog(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRenameGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                disabled={!newGroupName.trim() || renamingGroups.has(groupToRename?.id || 0)}
              >
                {renamingGroups.has(groupToRename?.id || 0) ? 'Renaming...' : 'Rename Group'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Group Confirmation Dialog */}
        <Dialog open={showDeleteGroupDialog} onOpenChange={setShowDeleteGroupDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Delete Group</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-white mb-4">
                The group "{groupToDelete?.name}" contains {groupToDelete?.noteCount} note(s).
                What would you like to do with these notes?
              </p>
              <div className="space-y-3">
                <div className="p-3 border border-slate-600 rounded-lg">
                  <h4 className="font-medium text-white mb-1">Option 1: Move to Ungrouped</h4>
                  <p className="text-sm text-slate-300">
                    Delete the group but keep all notes in the "Ungrouped" section.
                  </p>
                </div>
                <div className="p-3 border border-red-500/30 rounded-lg">
                  <h4 className="font-medium text-red-300 mb-1">Option 2: Delete Everything</h4>
                  <p className="text-sm text-slate-300">
                    Delete the group and all notes in it. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteGroupDialog(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                disabled={deletingGroups.has(groupToDelete?.id || 0)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => confirmDeleteGroup(false)}
                className="border-blue-500 text-blue-300 hover:bg-blue-500/20"
                disabled={deletingGroups.has(groupToDelete?.id || 0)}
              >
                {deletingGroups.has(groupToDelete?.id || 0) ? 'Moving...' : 'Move to Ungrouped'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDeleteGroup(true)}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={deletingGroups.has(groupToDelete?.id || 0)}
              >
                {deletingGroups.has(groupToDelete?.id || 0) ? 'Deleting...' : 'Delete Everything'}
              </Button>
            </div>
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
  const [editMode, setEditMode] = useState<'normal' | 'markdown'>('normal');
  const [richContent, setRichContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onSubmit({
      title,
      content: editMode === 'normal' ? content : richContent,
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
        
        {/* Edit Mode Toggle */}
        <div className="flex items-center gap-2 mb-2">
          <Label className="text-white text-sm">Edit Mode:</Label>
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
        
        {editMode === 'normal' ? (
          <RichTextEditor
            content={content}
            onUpdate={setContent}
            title={title || 'New Note'}
            mode="simple"
            className="min-h-[200px]"
          />
        ) : (
          <div className="min-h-[200px]">
            <RichTextEditor
              content={richContent}
              onUpdate={setRichContent}
              title={title || 'New Note'}
              mode="rich"
              className="min-h-[200px]"
            />
          </div>
        )}
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
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
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
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
        >
          Create Group
        </Button>
      </div>
    </form>
  );
};

export default NotesHub;