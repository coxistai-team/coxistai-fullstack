import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus,
  FileText,
  Trash2,
  Edit3,
  Save,
  X,
  Tag
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { analytics } from "@/utils/analytics";
import { UploadButton } from "@/lib/uploadthing";
import { useAuthLoading } from "@/contexts/AuthContext";
import { SkeletonLoader } from "@/components/ui/page-loader";
import React, { Suspense } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  attachments: string[]; // Add this line
}

// ErrorBoundary for Notes
class NotesErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error('NotesHub error:', error, info); }
  render() { if (this.state.hasError) return <div className="text-red-500 text-center py-8">Something went wrong in NotesHub.</div>; return this.props.children; }
}

const NotesHub = () => {
  const { toast } = useToast();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Remove predefined categories for tags. Compute unique tags from notes, always include 'All'.
  const getAllTags = (notes: Note[]) => {
    const tagSet = new Set<string>();
    notes.forEach(note => safeArray(note.tags).forEach(tag => tagSet.add(tag)));
    return ["All", ...Array.from(tagSet).filter(Boolean)];
  };
  const [activeTag, setActiveTag] = useState("All");
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  // Add state for attachments
  const [attachments, setAttachments] = useState<string[]>([]);

  // Add loading and disabled states for all API-triggering buttons
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<null | string>(null); // noteId or null

  const isAuthLoading = useAuthLoading();
  const [isNotesLoading, setIsNotesLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // Load notes from localStorage on component mount
  useEffect(() => {
    if (isAuthLoading) return;
    setIsNotesLoading(true);
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/notes`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Note[] = await response.json();
        setNotes(data.map(safeNote));
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: "Failed to load notes",
          description: "Could not fetch notes from the server. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsNotesLoading(false);
      }
    };
    fetchNotes();
  }, [isAuthLoading]);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    // This useEffect is no longer needed as backend handles persistence
  }, [notes]);

  const categories = ["All", "Math", "Science", "History", "Literature", "Physics", "Chemistry"];
  
  const filteredNotes = notes.filter((note: Note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeTag === "All" || note.tags.some(tag => tag.toLowerCase() === activeTag.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your note.",
        variant: "destructive",
      });
      return;
    }
    setIsCreating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newNoteTitle,
          content: `<h1>${newNoteTitle}</h1><p>Start writing your notes here...</p>`,
          attachments,
          tags: newNoteTags.split(",").map(tag => tag.trim()).filter(Boolean),
          category: newNoteCategory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newNote: Note = safeNote(await response.json());
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      setIsEditing(true);
      setShowNewNoteDialog(false);
      setNewNoteTitle("");
      setNewNoteTags("");
      setNewNoteCategory("Math");
      setAttachments([]); // Clear attachments after creation

      // Track note creation activity
      analytics.trackNoteActivity({
        noteId: newNote.id,
        action: 'created',
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Note Created",
        description: "Your new note has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Failed to create note",
        description: "Could not create note on the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Helper to check if a note is a template (not saved in backend)
  const isTemplateNote = (note: Note) => note.id.startsWith("template-");

  const handleUpdateNote = async (content: string) => {
    if (!selectedNote) return;
    // If template note, save as new note first
    if (isTemplateNote(selectedNote)) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ...selectedNote,
            content,
          }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const newNote: Note = safeNote(await response.json());
        setNotes(prev => prev.map(note => note.id === selectedNote.id ? newNote : note));
        setSelectedNote(newNote);
        setIsEditing(false);
        toast({ title: 'Note Saved', description: 'Template note saved as a new note.' });
      } catch (error) {
        toast({ title: 'Failed to save note', description: 'Could not save template note.', variant: 'destructive' });
      }
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...selectedNote,
          content,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedNote: Note = safeNote(await response.json());
      setNotes(prev => prev.map(note => 
        note.id === selectedNote.id ? updatedNote : note
      ));
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Failed to update note",
        description: "Could not update note on the server. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    setIsSaving(true);

    if (isTemplateNote(selectedNote)) {
      // Save as new note (POST)
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ...selectedNote,
            // Optionally, remove the template id so backend generates a real id
            id: undefined,
          }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const newNote: Note = safeNote(await response.json());
        setNotes(prev => prev.map(note => note.id === selectedNote.id ? newNote : note));
        setSelectedNote(newNote);
        setIsEditing(false);
        toast({ title: 'Note Saved', description: 'Template note saved as a new note.' });
      } catch (error) {
        toast({ title: 'Failed to save note', description: 'Could not save template note.', variant: 'destructive' });
      }
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...selectedNote,
          content: selectedNote.content, // Ensure content is not overwritten by RichTextEditor
          attachments: selectedNote.attachments, // Ensure attachments are not overwritten
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedNote: Note = safeNote(await response.json());
      setNotes(prev => prev.map(note => 
        note.id === selectedNote.id ? savedNote : note
      ));
      setSelectedNote(savedNote);
      setIsEditing(false);
      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Failed to save note",
        description: "Could not save note on the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setIsDeleting(true);
    // If template note, just remove from state
    if (isTemplateNote({ id: noteId } as Note)) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
      toast({ title: 'Note Deleted', description: 'Template note removed.' });
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
      toast({
        title: "Note Deleted",
        description: "Note has been removed from your library.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Failed to delete note",
        description: "Could not delete note on the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Defensive helpers
  const safeArray = <T,>(val: T[] | undefined): T[] => Array.isArray(val) ? val : [];
  const safeNote = (note: any = {}): Note => ({
    id: note.id?.toString() || Date.now().toString(),
    title: note.title || 'Untitled',
    content: note.content || '',
    tags: safeArray(note.tags),
    category: note.category || 'General',
    createdAt: note.createdAt || new Date().toISOString(),
    updatedAt: note.updatedAt || new Date().toISOString(),
    attachments: safeArray(note.attachments),
  });

  // In the template selection handler, immediately POST to /api/notes to create the note in the backend
  const handleTemplateSelect = async (template: any) => {
    setIsCreating(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: template.title,
          content: template.content,
          tags: [template.category],
          category: template.category,
          attachments: [],
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const newNote: Note = safeNote(await response.json());
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      setIsEditing(true);
      toast({ title: 'Note Created', description: 'Template note created and saved.' });
    } catch (error) {
      toast({ title: 'Failed to create note', description: 'Could not create note from template.', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  if (isNotesLoading) {
    return (
      <main className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar skeleton */}
            <div className="lg:w-1/3 space-y-6">
              <div className="glassmorphism rounded-xl p-6 mb-6">
                <SkeletonLoader className="mb-4 w-1/2 h-8" lines={1} />
                <SkeletonLoader className="mb-4 w-full h-10" lines={1} />
                <SkeletonLoader className="mb-2 w-full h-8" lines={2} />
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <SkeletonLoader key={i} className="h-16 rounded-lg" lines={1} />
                ))}
              </div>
            </div>
            {/* Editor skeleton */}
            <div className="lg:w-2/3 space-y-6">
              <SkeletonLoader className="h-12 w-2/3 mb-4" lines={1} />
              <SkeletonLoader className="h-8 w-1/3 mb-2" lines={1} />
              <SkeletonLoader className="h-64 w-full rounded-xl" lines={8} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <NotesErrorBoundary>
      <main className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/3">
              <motion.div 
                className="glassmorphism rounded-xl p-6 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notes Hub</h2>
                  <GlassmorphismButton
                    onClick={() => setShowNewNoteDialog(true)}
                    className="bg-gradient-to-r from-blue-500 to-green-500"
                    size="sm"
                    disabled={isCreating || isNotesLoading}
                  >
                    {isCreating ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    New Note
                  </GlassmorphismButton>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search notes..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full glassmorphism rounded-lg p-3 pl-10 bg-transparent outline-none placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white"
                      disabled={isNotesLoading}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {getAllTags(notes).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                          activeTag === tag 
                            ? 'glassmorphism-button' 
                            : 'glassmorphism hover:glassmorphism-button'
                        }`}
                        disabled={isNotesLoading}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Notes List */}
              <div className="space-y-3">
                {isNotesLoading ? (
                  <SkeletonLoader />
                ) : filteredNotes.length === 0 ? (
                  <div className="text-center text-slate-600 dark:text-slate-400 py-8">
                    No notes found. Create your first note to get started.
                  </div>
                ) : (
                  filteredNotes.map((note: Note, index: number) => (
                    <motion.div
                      key={note.id}
                      className={`glassmorphism rounded-lg p-4 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all cursor-pointer ${
                        selectedNote?.id === note.id ? 'border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedNote(note);
                        setIsEditing(false);
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{note.title}</h3>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(note.updatedAt)}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mb-2">{note.category}</p>
                          {safeArray(note.tags).length > 0 && (
                            <div className="flex space-x-1 flex-wrap">
                              {safeArray(note.tags).map((tag: string) => (
                                <span 
                                  key={tag}
                                  className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteDialog(note.id);
                            }}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            disabled={isDeleting || isNotesLoading}
                          >
                            {isDeleting ? (
                              <svg className="animate-spin h-3 w-3 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </div>
          
          {/* Editor */}
          <div className="lg:w-2/3">
            {selectedNote ? (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Note Header */}
                <div className="glassmorphism rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white">{selectedNote.title}</h3>
                    <p className="text-sm text-slate-400">
                      {selectedNote.category} • Last edited {formatDate(selectedNote.updatedAt)}
                    </p>
                    {safeArray(selectedNote?.tags).length > 0 && (
                      <div className="flex space-x-2 mt-2">
                        {safeArray(selectedNote?.tags).map((tag: string) => (
                          <span 
                            key={tag}
                            className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400"
                          >
                            <Tag className="w-3 h-3 inline mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <GlassmorphismButton 
                        onClick={handleSaveNote}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-blue-500"
                        disabled={isSaving || isNotesLoading}
                      >
                        {isSaving ? (
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </GlassmorphismButton>
                    ) : (
                      <GlassmorphismButton 
                        onClick={() => setIsEditing(true)}
                        size="sm"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </GlassmorphismButton>
                    )}
                  </div>
                </div>
                
                {/* Rich Text Editor */}
                {isEditing ? (
                  <RichTextEditor
                    content={selectedNote.content}
                    onUpdate={handleUpdateNote}
                    title={selectedNote.title}
                  />
                ) : (
                  <motion.div 
                    className="glassmorphism rounded-xl p-6 min-h-[400px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div 
                      className="prose prose-slate dark:prose-invert max-w-none text-slate-900 dark:text-white"
                      dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Welcome Section */}
                <div className="glassmorphism rounded-xl p-6 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-semibold mb-2">Welcome to Notes Hub</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Organize your learning with smart note-taking and advanced search capabilities.</p>
                  <GlassmorphismButton onClick={() => setShowNewNoteDialog(true)} disabled={isCreating || isNotesLoading}>
                    {isCreating ? (
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Your First Note
                  </GlassmorphismButton>
                </div>

                {/* Quick Start Templates */}
                <div className="glassmorphism rounded-xl p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Start Templates</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Jump-start your note-taking with these professional templates</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        title: "Study Guide Template", 
                        category: "Study", 
                        icon: "📚",
                        color: "from-blue-500 to-cyan-500",
                        description: "Comprehensive study guide with key concepts and practice problems",
                        content: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem;">
  <h1 style="color: white; text-align: center; margin: 0; font-size: 2rem; font-weight: bold;">Study Guide: [Subject]</h1>
  <p style="color: #e2e8f0; text-align: center; margin: 0.5rem 0 0 0; font-size: 1.1rem;">[Course Name] - [Chapter/Unit]</p>
</div>

<div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #3b82f6;">
  <h2 style="color: #1e40af; margin-top: 0;">📋 Key Concepts</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li><strong>Concept 1:</strong> Definition and detailed explanation</li>
    <li><strong>Concept 2:</strong> Definition and detailed explanation</li>
    <li><strong>Concept 3:</strong> Definition and detailed explanation</li>
  </ul>
</div>

<div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #22c55e;">
  <h2 style="color: #166534; margin-top: 0;">🔢 Important Formulas</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li><strong>Formula 1:</strong> [Formula] - Used for [purpose]</li>
    <li><strong>Formula 2:</strong> [Formula] - Used for [purpose]</li>
  </ul>
</div>

<div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #f59e0b;">
  <h2 style="color: #92400e; margin-top: 0;">💪 Practice Problems</h2>
  <ol style="color: #334155; line-height: 1.6;">
    <li>Problem 1: [Description with step-by-step solution]</li>
    <li>Problem 2: [Description with step-by-step solution]</li>
  </ol>
</div>

<div style="background: #fce7f3; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ec4899;">
  <h2 style="color: #be185d; margin-top: 0;">❓ Review Questions</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li>Question 1: [Self-assessment question]</li>
    <li>Question 2: [Self-assessment question]</li>
  </ul>
</div>`
                      },
                      { 
                        title: "Lecture Notes", 
                        category: "Lecture", 
                        icon: "🎓",
                        color: "from-green-500 to-teal-500",
                        description: "Structured format for capturing and organizing lecture content",
                        content: `<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem;">
  <h1 style="color: white; text-align: center; margin: 0; font-size: 2rem; font-weight: bold;">Lecture Notes</h1>
  <p style="color: #d1fae5; text-align: center; margin: 0.5rem 0 0 0; font-size: 1.1rem;">[Date] - [Course Name]</p>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
  <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px;">
    <h3 style="color: #475569; margin-top: 0; font-size: 1rem;">📅 Date</h3>
    <p style="color: #334155; margin: 0;">[Date]</p>
  </div>
  <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px;">
    <h3 style="color: #475569; margin-top: 0; font-size: 1rem;">📚 Topic</h3>
    <p style="color: #334155; margin: 0;">[Main Topic]</p>
  </div>
</div>

<div style="background: #e0f2fe; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #0284c7;">
  <h2 style="color: #0369a1; margin-top: 0;">💡 Key Points</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li>Main point 1 with detailed explanation</li>
    <li>Main point 2 with detailed explanation</li>
    <li>Main point 3 with detailed explanation</li>
  </ul>
</div>

<div style="background: #fef7ff; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #a855f7;">
  <h2 style="color: #7c3aed; margin-top: 0;">📝 Important Details</h2>
  <p style="color: #334155; line-height: 1.6;">[Detailed explanations, examples, and additional context from the lecture]</p>
</div>

<div style="background: #fff1f2; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ef4444;">
  <h2 style="color: #dc2626; margin-top: 0;">📋 Action Items</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li>Read chapter [X] by [date]</li>
    <li>Complete assignment [Y] by [date]</li>
    <li>Review [topic] for next class</li>
  </ul>
</div>`
                      },
                      { 
                        title: "Research Notes", 
                        category: "Research", 
                        icon: "🔬",
                        color: "from-purple-500 to-indigo-500",
                        description: "Systematic approach to documenting research findings",
                        content: `<div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem;">
  <h1 style="color: white; text-align: center; margin: 0; font-size: 2rem; font-weight: bold;">Research Notes</h1>
  <p style="color: #e0e7ff; text-align: center; margin: 0.5rem 0 0 0; font-size: 1.1rem;">[Topic] - [Date]</p>
</div>

<div style="background: #f0f9ff; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #0284c7;">
  <h2 style="color: #0369a1; margin-top: 0;">🎯 Research Question</h2>
  <p style="color: #334155; line-height: 1.6; background: white; padding: 1rem; border-radius: 4px; border: 1px solid #e2e8f0;">[Your research question or hypothesis with clear objectives]</p>
</div>

<div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #22c55e;">
  <h2 style="color: #166534; margin-top: 0;">📚 Sources</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li><strong>Source 1:</strong> [Full citation with page numbers]</li>
    <li><strong>Source 2:</strong> [Full citation with page numbers]</li>
    <li><strong>Source 3:</strong> [Full citation with page numbers]</li>
  </ul>
</div>

<div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #f59e0b;">
  <h2 style="color: #92400e; margin-top: 0;">🔍 Key Findings</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li><strong>Finding 1:</strong> [Detailed description with supporting evidence]</li>
    <li><strong>Finding 2:</strong> [Detailed description with supporting evidence]</li>
  </ul>
</div>

<div style="background: #fce7f3; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #ec4899;">
  <h2 style="color: #be185d; margin-top: 0;">📊 Analysis</h2>
  <p style="color: #334155; line-height: 1.6;">[Your analysis and interpretation of the findings, including patterns and connections]</p>
</div>

<div style="background: #e0f2fe; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #0284c7;">
  <h2 style="color: #0369a1; margin-top: 0;">🎓 Conclusions</h2>
  <p style="color: #334155; line-height: 1.6;">[Your conclusions and implications for future research or practical applications]</p>
</div>`
                      },
                      { 
                        title: "Meeting Notes", 
                        category: "Meeting", 
                        icon: "📝",
                        color: "from-orange-500 to-red-500",
                        description: "Professional meeting documentation with action items",
                        content: `<div style="background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem;">
  <h1 style="color: white; text-align: center; margin: 0; font-size: 2rem; font-weight: bold;">Meeting Notes</h1>
  <p style="color: #fed7aa; text-align: center; margin: 0.5rem 0 0 0; font-size: 1.1rem;">[Meeting Title] - [Date]</p>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
  <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px;">
    <h3 style="color: #475569; margin-top: 0; font-size: 1rem;">📅 Date & Time</h3>
    <p style="color: #334155; margin: 0;">[Date] at [Time]</p>
  </div>
  <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px;">
    <h3 style="color: #475569; margin-top: 0; font-size: 1rem;">⏱️ Duration</h3>
    <p style="color: #334155; margin: 0;">[Duration]</p>
  </div>
</div>

<div style="background: #e0f2fe; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #0284c7;">
  <h2 style="color: #0369a1; margin-top: 0;">👥 Attendees</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li><strong>Attendee 1</strong> - [Role/Title]</li>
    <li><strong>Attendee 2</strong> - [Role/Title]</li>
    <li><strong>Attendee 3</strong> - [Role/Title]</li>
  </ul>
</div>

<div style="background: #fef3c7; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #f59e0b;">
  <h2 style="color: #92400e; margin-top: 0;">📋 Agenda</h2>
  <ol style="color: #334155; line-height: 1.6;">
    <li>Topic 1: [Description]</li>
    <li>Topic 2: [Description]</li>
    <li>Topic 3: [Description]</li>
  </ol>
</div>

<div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #22c55e;">
  <h2 style="color: #166534; margin-top: 0;">✅ Key Decisions</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li><strong>Decision 1:</strong> [Description and rationale]</li>
    <li><strong>Decision 2:</strong> [Description and rationale]</li>
  </ul>
</div>

<div style="background: #fff1f2; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #ef4444;">
  <h2 style="color: #dc2626; margin-top: 0;">🎯 Action Items</h2>
  <ul style="color: #334155; line-height: 1.6;">
    <li><strong>Action 1:</strong> [Description] - <em>Assigned to: [Person]</em> - <strong>Due: [Date]</strong></li>
    <li><strong>Action 2:</strong> [Description] - <em>Assigned to: [Person]</em> - <strong>Due: [Date]</strong></li>
  </ul>
</div>`
                      }
                    ].map((template, index) => (
                      <motion.div
                        key={index}
                        className="group glassmorphism rounded-lg p-6 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 border border-white/10 hover:border-white/20"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${template.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-2xl">{template.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{template.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{template.description}</p>
                            <div className="flex items-center mt-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${template.color} text-white shadow-sm`}>
                                {template.category}
                              </span>
                              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                                Click to create →
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Study Tips */}
                <div className="glassmorphism rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Effective Note-Taking Tips</h3>
                  <div className="space-y-3">
                    {[
                      {
                        tip: "Use the Cornell Note-Taking System",
                        description: "Divide your page into notes, cues, and summary sections for better organization."
                      },
                      {
                        tip: "Create Visual Connections",
                        description: "Use diagrams, charts, and mind maps to connect related concepts."
                      },
                      {
                        tip: "Review and Revise Regularly",
                        description: "Go back to your notes within 24 hours to reinforce learning and fill gaps."
                      },
                      {
                        tip: "Use Active Voice and Keywords",
                        description: "Write in your own words and highlight key terms for better retention."
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-blue-400 text-sm">{item.tip}</h4>
                          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* New Note Dialog */}
        <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Title</Label>
                <Input
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Enter note title"
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={isCreating || isNotesLoading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-medium">Category</Label>
                <div className="relative">
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white appearance-none cursor-pointer focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    disabled={isCreating || isNotesLoading}
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category} value={category} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {category}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-white">Tags (comma separated)</Label>
                <Input
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  placeholder="e.g., calculus, derivatives, math"
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={isCreating || isNotesLoading}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowNewNoteDialog(false)}
                  variant="outline"
                  className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                  disabled={isCreating || isNotesLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateNote}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isCreating || isNotesLoading}
                >
                  {isCreating ? (
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!showDeleteDialog} onOpenChange={open => { if (!open) setShowDeleteDialog(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to delete this note? This action cannot be undone.</p>
              <div className="flex space-x-2 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteDialog(null)} disabled={isDeleting}>Cancel</Button>
                <Button onClick={() => handleDeleteNote(showDeleteDialog!)} className="bg-red-500 text-white" disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </main>
    </NotesErrorBoundary>
  );
};

export default NotesHub;