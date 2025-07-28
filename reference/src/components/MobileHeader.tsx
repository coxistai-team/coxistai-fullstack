import React from 'react';
import { Menu, X } from 'lucide-react';

interface MobileHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">UI</span>
        </div>
        <span className="font-semibold text-gray-900">Untitled UI</span>
      </div>
      
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>
    </div>
  );
};

export default MobileHeader;