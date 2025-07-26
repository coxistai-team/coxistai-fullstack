import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Camera, 
  ChevronDown,
  Bell,
  CreditCard,
  Shield
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogoutDialog } from "@/components/ui/logout-dialog";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileDropdownProps {
  className?: string;
}

export default function UserProfileDropdown({ className = "" }: UserProfileDropdownProps) {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, updateProfile } = useUser();
  const { logout } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          try {
            await updateProfile({ avatar: result });
          } catch (error) {
            console.error('Failed to update avatar:', error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
    setIsOpen(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutDialog(false);
    setLocation('/login');
  };

  const navigateTo = (path: string) => {
    setLocation(path);
    setIsOpen(false);
  };

  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';
  };

  const getUserName = () => {
    if (!user) return 'Loading...';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username;
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => {
          if (isMobile) {
            navigateTo('/profile');
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="flex items-center space-x-3 p-2 rounded-xl glassmorphism hover:glassmorphism-strong transition-all duration-300 w-full border border-white/10 hover:border-white/20"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Avatar className="w-10 h-10 ring-2 ring-blue-500/30 hover:ring-blue-400/50 transition-all">
          <AvatarImage src={user.avatar || undefined} alt={getUserName()} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold">
            {getInitials(user.firstName || '', user.lastName || '')}
          </AvatarFallback>
        </Avatar>
        <div className="text-left flex-1">
          <div className="text-sm font-semibold text-white sm:block hidden">{getUserName()}</div>
          <div className="text-sm font-semibold text-white sm:hidden block">Profile</div>
          <div className="text-xs text-gray-400 sm:block hidden">Pro Plan</div>
          <div className="text-xs text-gray-400 sm:hidden block">Settings & Account</div>
        </div>
        {!isMobile && (
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && !isMobile && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              className="absolute top-full mt-2 glassmorphism-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 w-80 max-w-[calc(100vw-1rem)] right-0"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* User Info Section */}
              <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 ring-2 ring-blue-500/30">
                      <AvatarImage src={user.avatar || undefined} alt={getUserName()} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg">
                        {getInitials(user.firstName || '', user.lastName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                      <Camera className="w-3 h-3 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-lg">{getUserName()}</div>
                    <div className="text-sm text-gray-400">{user.email || 'No email set'}</div>
                    <Badge className="mt-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro Plan
                    </Badge>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="p-4 border-b border-white/10">
                <div className="text-sm font-medium text-white mb-3">Account Details</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Occupation</span>
                    <span className="text-white">{user.occupation || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Location</span>
                    <span className="text-white">{user.location || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/20 transition-colors text-left group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 group-hover:text-red-300 font-medium">Log Out</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Logout Confirmation Dialog */}
      <LogoutDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={confirmLogout}
      />
    </div>
  );
}