import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import UserProfileDropdown from "@/components/ui/user-profile-dropdown";
import { useAuth } from "@/contexts/AuthContext";
import { usePageLoading } from "@/contexts/PageLoadingContext";
import logoBlack from "../../../assets/1x.png";

const Navigation = () => {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { showPageLoader, hidePageLoader } = usePageLoading();

  const isActive = (path: string) => location === path;
  const isDropdownActive = (dropdown: readonly any[]) => dropdown.some(item => location === item.path);

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

  return (
    <>
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glassmorphism-strong border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => handleNavigation('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <img 
                  src={logoBlack} 
                  alt="Coexist AI Logo" 
                  className="w-12 h-12 rounded-xl shadow-lg object-cover group-hover:shadow-blue-500/25 transition-shadow duration-300" 
                  width={48} 
                  height={48} 
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Coexist AI
                </span>
                <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                  Learning Platform
                </div>
              </div>
            </motion.div>
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {NAVIGATION_ITEMS.map((item) => (
                <motion.button
                  key={item.id}
                  className={`nav-link px-6 py-3 rounded-xl transition-all duration-300 font-medium ${location === item.path ? 'active bg-white/5' : 'hover:bg-white/5'}`}
                  onClick={() => handleNavigation(item.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.label}
                </motion.button>
              ))}
              {/* Auth Section */}
              <div className="ml-6 flex items-center space-x-4">
                {isAuthenticated ? (
                  <UserProfileDropdown />
                ) : (
                  <>
                    <motion.button
                      className="px-6 py-3 text-white/80 hover:text-white transition-colors font-medium"
                      onClick={() => handleNavigation('/login')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Login
                    </motion.button>
                    <motion.button
                      className="glassmorphism-button px-6 py-3 rounded-xl font-semibold"
                      onClick={() => handleNavigation('/signup')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign Up
                    </motion.button>
                  </>
                )}
              </div>
            </div>
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-3 glassmorphism rounded-xl"
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                className="lg:hidden glassmorphism-strong mt-2 mx-4 rounded-2xl border border-white/10 overflow-hidden relative z-50 max-h-[calc(100vh-6rem)] overflow-y-auto"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 space-y-2">
                  {NAVIGATION_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${location === item.path ? 'bg-blue-500/20 text-blue-400' : 'text-white hover:bg-white/10'}`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                    {isAuthenticated ? (
                      <div>
                        <UserProfileDropdown className="w-full" />
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 px-4 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
                          onClick={() => handleNavigation('/login')}
                        >
                          Login
                        </button>
                        <button
                          className="flex-1 glassmorphism-button px-4 py-3 rounded-xl font-semibold"
                          onClick={() => handleNavigation('/signup')}
                        >
                          Sign Up
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navigation;