import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Home, MessageCircle, NotebookPen, Users, GraduationCap, Presentation, Calendar, Code } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import UserProfileDropdown from "@/components/ui/user-profile-dropdown";
import { useAuth } from "@/contexts/AuthContext";
import { usePageLoading } from "@/contexts/PageLoadingContext";
import { useIsMobile } from "@/hooks/use-mobile";
import logoBlack from "../../../assets/5x.png";

const Navigation = () => {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showPageLoader, hidePageLoader } = usePageLoading();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location === path;
  const isDropdownActive = (dropdown: readonly any[]) => dropdown.some(item => location === item.path);

  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleNavigation = (path: string) => {
    if (path !== location) {
      showPageLoader();
      
      setTimeout(() => {
        setLocation(path);
        setMobileMenuOpen(false);
        setActiveDropdown(null);
        
        setTimeout(() => {
          hidePageLoader();
        }, 300);
      }, 100);
    } else {
      setMobileMenuOpen(false);
      setActiveDropdown(null);
    }
  };

  const handleDropdownToggle = (itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  // Mobile navigation items with icons
  const mobileNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/notes', label: 'Notes', icon: NotebookPen },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/college', label: 'College', icon: GraduationCap },
    { path: '/presentations', label: 'Presentations', icon: Presentation },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/code', label: 'Code', icon: Code },
  ];

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glassmorphism-strong border-b border-white/10' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              onClick={() => handleNavigation('/')}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <img 
                  src={logoBlack} 
                  alt="Coxist AI CFO Logo" 
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl shadow-lg object-cover transition-shadow duration-300" 
                  loading="eager"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Coxist AI CFO
                </span>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  Finance Copilot
                </div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {NAVIGATION_ITEMS.map((item) => (
                <motion.button
                  key={item.id}
                  className={`nav-link px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 font-medium touch-target ${
                    location === item.path ? 'active bg-white/5' : 'hover:bg-white/5'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                </motion.button>
              ))}
              
              {/* Auth Section */}
              <div className="ml-4 flex items-center space-x-3">
                {isAuthenticated ? (
                  <UserProfileDropdown />
                ) : (
                  <>
                    <motion.button
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-white/80 hover:text-white transition-colors font-medium touch-target"
                      onClick={() => handleNavigation('/login')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Login"
                    >
                      Login
                    </motion.button>
                    <motion.button
                      className="glassmorphism-button px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold whitespace-nowrap touch-target"
                      onClick={() => handleNavigation('/signup')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Sign Up"
                    >
                      Sign Up
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button - Hidden since we have bottom navigation */}
            <div className="hidden">
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 sm:p-3 glassmorphism rounded-xl touch-target"
                whileTap={{ scale: 0.95 }}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Mobile Menu Backdrop */}
              <motion.div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Mobile Menu Content */}
              <motion.div
                className="lg:hidden glassmorphism-strong mt-2 mx-4 rounded-2xl border border-white/10 overflow-hidden relative z-50 max-h-[calc(100vh-6rem)] overflow-y-auto mobile-safe"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="p-4 space-y-2">
                  {/* Mobile Navigation Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {mobileNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <motion.button
                          key={item.path}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 font-medium touch-target ${
                            location === item.path 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : 'text-white hover:bg-white/10 border border-transparent'
                          }`}
                          onClick={() => handleNavigation(item.path)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          aria-label={`Navigate to ${item.label}`}
                        >
                          <Icon className="w-5 h-5 mb-2" />
                          <span className="text-xs font-medium">{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Auth Section */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    {isAuthenticated ? (
                      <div>
                        <UserProfileDropdown className="w-full" />
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <motion.button
                          className="flex-1 px-4 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors touch-target"
                          onClick={() => handleNavigation('/login')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          aria-label="Login"
                        >
                          Login
                        </motion.button>
                        <motion.button
                          className="flex-1 glassmorphism-button px-4 py-3 rounded-xl font-semibold touch-target"
                          onClick={() => handleNavigation('/signup')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          aria-label="Sign Up"
                        >
                          Sign Up
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Bottom Navigation (for larger mobile screens) */}
      {isMobile && !mobileMenuOpen && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 z-40 glassmorphism-strong border-t border-white/10 mobile-nav lg:hidden"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex justify-around items-center py-2">
            {mobileNavItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.path}
                  className={`mobile-nav-item ${
                    location === item.path ? 'active' : ''
                  }`}
                  onClick={() => handleNavigation(item.path)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Navigation;