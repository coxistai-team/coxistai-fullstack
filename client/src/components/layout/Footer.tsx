import { motion } from "framer-motion";
import { Heart, Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

const Footer = () => {
  const [, setLocation] = useLocation();
  const currentYear = new Date().getFullYear();

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <motion.footer 
      className="relative z-10 mt-auto border-t border-slate-800/50 bg-[#0B0D14]/80 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-2">
              CoXist AI
            </h3>
            <p className="text-slate-400 text-sm mb-4 max-w-md">
              Transforming education through AI-powered learning experiences. Your complete student toolkit for modern education.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-blue-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Github className="w-4 h-4 text-slate-400 hover:text-blue-400" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-blue-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-4 h-4 text-slate-400 hover:text-blue-400" />
              </a>
              <a 
                href="mailto:contact@coxistai.com" 
                className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-green-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Mail className="w-4 h-4 text-slate-400 hover:text-green-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <button 
                onClick={() => handleNavigation("/chat")}
                className="block text-slate-400 hover:text-blue-400 transition-colors text-sm"
              >
                AI Tutor
              </button>
              <button 
                onClick={() => handleNavigation("/notes")}
                className="block text-slate-400 hover:text-blue-400 transition-colors text-sm"
              >
                Notes Hub
              </button>
              <button 
                onClick={() => handleNavigation("/community")}
                className="block text-slate-400 hover:text-blue-400 transition-colors text-sm"
              >
                Community
              </button>
              <button 
                onClick={() => handleNavigation("/presentations")}
                className="block text-slate-400 hover:text-blue-400 transition-colors text-sm"
              >
                AI Presentations
              </button>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <div className="space-y-2">
              <button 
                onClick={() => handleNavigation("/terms")}
                className="block text-slate-400 hover:text-blue-400 transition-colors text-sm flex items-center group"
              >
                Terms & Conditions
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => handleNavigation("/privacy-policy")}
                className="block text-slate-400 hover:text-blue-400 transition-colors text-sm flex items-center group"
              >
                Privacy Policy
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => handleNavigation("/refund")}
                className="block text-slate-400 hover:text-blue-400 transition-colors text-sm flex items-center group"
              >
                Refund Policy
                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button 
                onClick={() => handleNavigation("/support")}
                className="block text-slate-400 hover:text-blue-400 transition-colors text-sm"
              >
                Support
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 pt-6 border-t border-slate-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Copyright */}
            <p className="text-slate-500 text-sm flex items-center justify-center sm:justify-start space-x-1">
              <span>© {currentYear} CoXist AI. Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for learners everywhere</span>
            </p>
            
            {/* Additional Info */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs text-slate-500">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>India</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
