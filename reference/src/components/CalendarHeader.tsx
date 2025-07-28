import React from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Plus
} from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  isMobile: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  isMobile
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filterTabs = [
    { name: 'All events', active: true },
    { name: 'Shared', active: false },
    { name: 'Public', active: false },
    { name: 'Archived', active: false },
  ];

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘K</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {filterTabs.map((tab) => (
            <button
              key={tab.name}
              className={`
                flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${tab.active 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-sm text-gray-500">
              {monthNames[currentDate.getMonth()].substring(0, 3)} 1, {currentDate.getFullYear()} — {monthNames[currentDate.getMonth()].substring(0, 3)} 31, {currentDate.getFullYear()}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
            <button
              onClick={onPrevMonth}
              className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              className="px-4 py-2 text-sm font-medium border-x border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={onNextMonth}
              className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium">Month view</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add event</span>
          </button>
        </div>

        <button className="w-full p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Search className="w-5 h-5 mx-auto" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Untitled UI
            </a>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </li>
          <li>
            <span className="text-sm font-medium text-gray-900">Calendar</span>
          </li>
        </ol>
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.name}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${tab.active 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Date Display */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {monthNames[currentDate.getMonth()].substring(0, 3).toUpperCase()}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              10
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-sm text-gray-500">
              {monthNames[currentDate.getMonth()].substring(0, 3)} 1, {currentDate.getFullYear()} — {monthNames[currentDate.getMonth()].substring(0, 3)} 31, {currentDate.getFullYear()}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-12 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘K</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
            <button
              onClick={onPrevMonth}
              className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              className="px-4 py-2 text-sm font-medium border-x border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={onNextMonth}
              className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Selector */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium">Month view</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Add Event Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;