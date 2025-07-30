import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  Home, 
  MessageCircle, 
  NotebookPen, 
  Users, 
  GraduationCap, 
  Presentation, 
  Calendar, 
  Code,
  Menu,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileNavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface MobileNavigationProps {
  items: MobileNavItem[];
  className?: string;
  showBottomNav?: boolean;
  showFloatingMenu?: boolean;
}

const MobileNavigation = ({ 
  items, 
  className,
  showBottomNav = true,
  showFloatingMenu = true
}: MobileNavigationProps) => {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsMenuOpen(false);
  };

  const currentItem = items.find(item => item.path === location);

  if (!isMobile) return null;

  return (
    <>
      {/* Bottom Navigation */}
      {showBottomNav && (
        <motion.div 
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 glassmorphism-strong mobile-nav",
            className
          )}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex justify-around items-center py-2">
            {items.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <motion.button
                  key={item.path}
                  className={cn(
                    "mobile-nav-item flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? "text-blue-400 bg-blue-500/10" 
                      : "text-gray-400 hover:text-white"
                  )}
                  onClick={() => handleNavigation(item.path)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Floating Action Button */}
      {showFloatingMenu && (
        <motion.div
          className="fixed bottom-20 right-4 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.button
            className="w-14 h-14 glassmorphism-button rounded-full flex items-center justify-center shadow-lg touch-target"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Floating Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="absolute bottom-16 right-0 glassmorphism-strong rounded-2xl p-4 min-w-[200px]"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    
                    return (
                      <motion.button
                        key={item.path}
                        className={cn(
                          "w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left",
                          isActive 
                            ? "bg-blue-500/20 text-blue-400" 
                            : "text-white hover:bg-white/10"
                        )}
                        onClick={() => handleNavigation(item.path)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`Navigate to ${item.label}`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-gray-400">{item.description}</div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Current Page Indicator */}
      {currentItem && (
        <motion.div
          className="fixed top-20 left-4 z-40 glassmorphism rounded-full px-3 py-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <currentItem.icon className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{currentItem.label}</span>
          </div>
        </motion.div>
      )}

      {/* Scroll to Top Button */}
      {isScrolled && (
        <motion.button
          className="fixed bottom-24 right-4 z-40 glassmorphism-button rounded-full w-12 h-12 flex items-center justify-center touch-target"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </motion.button>
      )}
    </>
  );
};

export default MobileNavigation; 