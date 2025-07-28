import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home,
  Palette,
  Users,
  Plus,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  selectedWorkspace: string;
  onWorkspaceChange: (workspace: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedWorkspace, onWorkspaceChange }) => {
  const menuItems = [
    { icon: Home, label: 'Home', active: false },
    { icon: Palette, label: 'Brand', active: false }
  ];

  const workspaces = [
    { name: 'Welcome to Strut', selected: false },
    { name: 'Marketing', selected: true, highlighted: true },
    { name: 'Social', selected: false },
  ];

  return (
    <motion.div 
      className="fixed left-0 top-0 h-full w-64 bg-slate-100 border-r border-slate-200 shadow-sm z-10"
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Profile Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">JS</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">John Smith</h3>
            <p className="text-sm text-slate-500">Marketing Team</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                item.active 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Workspaces Section */}
      <div className="p-4 pt-0">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 px-3">Workspaces</h4>
        <div className="space-y-1">
          {workspaces.map((workspace, index) => (
            <motion.button
              key={workspace.name}
              onClick={() => onWorkspaceChange(workspace.name)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                workspace.selected 
                  ? 'bg-white shadow-sm border border-slate-200 text-slate-800' 
                  : workspace.highlighted
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="font-medium text-sm">{workspace.name}</span>
              {workspace.highlighted && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </motion.button>
          ))}
          
          {/* Add Workspace Button */}
          <motion.button
            className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium text-sm">Add a workspace</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;