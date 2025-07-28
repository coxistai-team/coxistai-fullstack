import React from 'react';
import { motion } from 'framer-motion';
import { 
  Grid3X3, 
  List, 
  Plus,
  Settings,
  Filter
} from 'lucide-react';
import GlassmorphismButton from '@/components/ui/glassmorphism-button';

interface NoteGroup {
  id: number;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface NotesTopToolbarProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onCreateNote: () => void;
  selectedGroup: number | null;
  noteGroups: NoteGroup[];
}

const NotesTopToolbar: React.FC<NotesTopToolbarProps> = ({
  viewMode,
  onViewModeChange,
  onCreateNote,
  selectedGroup,
  noteGroups
}) => {
  const selectedGroupData = noteGroups.find(g => g.id === selectedGroup);

  return (
    <motion.div 
      className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 p-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              {selectedGroupData ? selectedGroupData.name : 'All Notes'}
            </h1>
            {selectedGroupData && (
              <p className="text-sm text-slate-400 mt-1">
                {selectedGroupData.description || 'No description'}
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-600/50">
            <motion.button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid3X3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Create Note Button */}
          <GlassmorphismButton
            onClick={onCreateNote}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </GlassmorphismButton>

          {/* Settings Button */}
          <motion.button
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotesTopToolbar; 