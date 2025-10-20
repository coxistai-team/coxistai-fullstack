import React from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Calendar,
  BarChart3,
  CheckSquare,
  Users,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const generalMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: false },
    { icon: FolderOpen, label: 'Projects', active: false },
    { icon: FileText, label: 'Documents', active: false },
    { icon: Calendar, label: 'Calendar', active: true },
  ];

  const untitledUIItems = [
    { icon: BarChart3, label: 'Reporting', active: false },
    { icon: CheckSquare, label: 'Tasks', active: false, badge: '8' },
    { icon: Users, label: 'Users', active: false },
  ];

  const teams = [
    { name: 'Catalog', color: 'bg-blue-500', icon: 'C' },
    { name: 'Warpspeed', color: 'bg-purple-500', icon: 'W' },
    { name: 'Boltshift', color: 'bg-green-500', icon: 'B' },
    { name: 'Sisyphus', color: 'bg-orange-500', icon: 'S' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CX</span>
              </div>
              <span className="font-semibold text-white">Coxist AI CFO</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* General Section */}
            <div className="px-6 mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                General
              </h3>
              <nav className="space-y-1">
                {generalMenuItems.map((item) => (
                  <a
                    key={item.label}
                    href="#"
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${item.active 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Untitled UI Section */}
            <div className="px-6 mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Productivity
              </h3>
              <nav className="space-y-1">
                {untitledUIItems.map((item) => (
                  <a
                    key={item.label}
                    href="#"
                    className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </nav>
            </div>

            {/* Your Teams Section */}
            <div className="px-6 mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Your Teams
              </h3>
              <nav className="space-y-1">
                {teams.map((team) => (
                  <a
                    key={team.name}
                    href="#"
                    className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors group"
                  >
                    <div className={`w-6 h-6 ${team.color} rounded text-white text-xs flex items-center justify-center mr-3`}>
                      {team.icon}
                    </div>
                    {team.name}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* User Profile */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">SH</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Finance Team
                </p>
                <p className="text-xs text-slate-400 truncate">
                  teamcoxistai@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;