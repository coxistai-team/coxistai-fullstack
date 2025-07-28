import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, FolderPlus, BookOpen, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import TagFilter from './TagFilter';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import GlassmorphismButton from '@/components/ui/glassmorphism-button';

interface NoteGroup {
  id: number;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

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

interface NotesSidebarProps {
  noteGroups: NoteGroup[];
  selectedGroup: number | null;
  onGroupSelect: (groupId: number | null) => void;
  onCreateGroup: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notes: Note[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onGroupRename: (groupId: number, currentName: string) => void;
  onGroupDelete: (groupId: number) => void;
  deletingGroups?: Set<number>;
  creatingGroups?: boolean;
  renamingGroups?: Set<number>;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({
  noteGroups,
  selectedGroup,
  onGroupSelect,
  onCreateGroup,
  searchQuery,
  onSearchChange,
  notes,
  selectedTags,
  onTagsChange,
  onGroupRename,
  onGroupDelete,
  deletingGroups = new Set(),
  creatingGroups = false,
  renamingGroups = new Set(),
}) => {
  // Get all unique tags from notes
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [notes]);

  // Get note count for each group
  const getNoteCount = (groupId: number | null) => {
    return notes.filter(note => 
      groupId === null 
        ? !note.group_id 
        : note.group_id === groupId
    ).length;
  };

  const getGroupColor = (color: string) => {
    return color || '#3b82f6';
  };

  return (
    <motion.div 
      className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50 p-6 space-y-6"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          NotesHub
        </h2>
        <p className="text-sm text-slate-400">Organize your thoughts</p>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Groups</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateGroup}
            className="text-blue-300 hover:text-blue-200 hover:bg-slate-700/50 p-1"
            disabled={creatingGroups}
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {/* All Notes */}
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <button
                onClick={() => onGroupSelect(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedGroup === null
                    ? 'bg-slate-700/50 text-white border border-slate-600/50'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">All Notes</span>
                  <Badge variant="secondary" className="bg-slate-700/70 text-slate-200">
                    {notes.length}
                  </Badge>
                </div>
              </button>
            </ContextMenuTrigger>
            {/* No context menu for system groups */}
          </ContextMenu>

          {/* Ungrouped */}
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <button
                onClick={() => onGroupSelect(0)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedGroup === 0
                    ? 'bg-slate-700/50 text-white border border-slate-600/50'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-500" />
                    <span className="text-sm">Ungrouped</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-700/70 text-slate-200">
                    {getNoteCount(null)}
                  </Badge>
                </div>
              </button>
            </ContextMenuTrigger>
            {/* No context menu for system groups */}
          </ContextMenu>

          {/* Note Groups */}
          {noteGroups.map((group) => (
            <ContextMenu key={group.id}>
              <ContextMenuTrigger asChild>
                <button
                  onClick={() => onGroupSelect(group.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedGroup === group.id
                      ? 'bg-slate-700/50 text-white border border-slate-600/50'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getGroupColor(group.color) }}
                      />
                      <span className="text-sm">{group.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-slate-700/70 text-slate-200">
                      {getNoteCount(group.id)}
                    </Badge>
                  </div>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-slate-900 border-slate-700">
                <ContextMenuItem 
                  onClick={() => onGroupRename(group.id, group.name)}
                  className="text-white hover:bg-slate-800"
                  disabled={renamingGroups.has(group.id)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {renamingGroups.has(group.id) ? 'Renaming...' : 'Rename'}
                </ContextMenuItem>
                <ContextMenuSeparator className="bg-slate-600" />
                <ContextMenuItem 
                  onClick={() => onGroupDelete(group.id)}
                  className="text-red-300 hover:bg-red-500/20"
                  disabled={deletingGroups.has(group.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deletingGroups.has(group.id) ? 'Deleting...' : 'Delete'}
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">Tags</h3>
        <TagFilter
          allTags={allTags}
          selectedTags={selectedTags}
          onTagsChange={onTagsChange}
        />
      </div>
    </motion.div>
  );
};

export default NotesSidebar; 