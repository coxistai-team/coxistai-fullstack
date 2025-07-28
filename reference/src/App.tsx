import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CalendarHeader from './components/CalendarHeader';
import CalendarGrid from './components/CalendarGrid';
import MobileHeader from './components/MobileHeader';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 10)); // January 10, 2025
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <MobileHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Calendar Area */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {/* Header */}
              <div className="mb-6">
                <CalendarHeader
                  currentDate={currentDate}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onToday={handleToday}
                  isMobile={isMobile}
                />
              </div>

              {/* Calendar Grid */}
              <CalendarGrid currentDate={currentDate} isMobile={isMobile} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;