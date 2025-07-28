import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  ChevronDown, 
  Grid3X3, 
  List, 
  Plus,
  Home,
  Palette,
  Users,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import Sidebar from './Sidebar';
import KanbanBoard from './KanbanBoard';
import TopToolbar from './TopToolbar';

const MarketingDashboard = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWorkspace, setSelectedWorkspace] = useState('Marketing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          selectedWorkspace={selectedWorkspace}
          onWorkspaceChange={setSelectedWorkspace}
        />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          <TopToolbar 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          <main className="p-6">
            <KanbanBoard viewMode={viewMode} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;