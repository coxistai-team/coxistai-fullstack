import { motion } from "framer-motion";
import { Heart, Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      className="relative z-10 mt-auto border-t border-slate-800/50 bg-[#0B0D14]/80 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent mb-2">
              Coexist AI
            </h3>
            <p className="text-slate-400 text-sm">
              Transforming education through AI
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <div className="flex justify-center space-x-6 text-sm">
              <a href="/privacy" className="text-slate-400 hover:text-blue-400 transition-colors">
                Privacy
              </a>
              <a href="/privacy" className="text-slate-400 hover:text-blue-400 transition-colors">
                Terms
              </a>
              <a href="/support" className="text-slate-400 hover:text-blue-400 transition-colors">
                Support
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            <div className="flex justify-center md:justify-end space-x-4 mb-3">
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
                href="mailto:contact@coexistai.com" 
                className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-green-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Mail className="w-4 h-4 text-slate-400 hover:text-green-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center space-x-1">
            <span>© {currentYear} Coexist AI. Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>for learners everywhere</span>
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;