import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  MessageCircle, 
  NotebookPen, 
  Users, 
  GraduationCap, 
  Presentation, 
  Calendar, 
  Code,
  ArrowRight,
  Sparkles
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";

const Home = () => {
  const [, setLocation] = useLocation();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: "SparkTutor Chat",
      description: "AI-powered tutoring with text, voice, and image support for instant learning assistance.",
      path: "/chat",
      gradient: "from-blue-500 to-green-500"
    },
    {
      icon: NotebookPen,
      title: "Notes Hub",
      description: "Smart note-taking with advanced search, tagging, and PDF export capabilities.",
      path: "/notes",
      gradient: "from-green-500 to-blue-500"
    },
    {
      icon: Users,
      title: "SparkHub Community",
      description: "Connect with fellow learners, share notes, and collaborate on projects.",
      path: "/community",
      gradient: "from-blue-500 to-green-500"
    },
    {
      icon: GraduationCap,
      title: "College Recommender",
      description: "AI-powered college recommendations based on your profile and preferences.",
      path: "/college",
      gradient: "from-green-500 to-blue-500"
    },
    {
      icon: Presentation,
      title: "AI Presentations",
      description: "Create stunning presentations with AI assistance and export to PowerPoint.",
      path: "/presentations",
      gradient: "from-blue-500 to-green-500"
    },
    {
      icon: Calendar,
      title: "Smart Calendar",
      description: "Intelligent scheduling with Google Calendar sync and AI-powered suggestions.",
      path: "/calendar",
      gradient: "from-green-500 to-blue-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <main className="relative z-10 pt-20">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center space-x-2 glassmorphism rounded-full px-4 py-2 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Next-Generation AI Learning Platform</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Coexist AI
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-4 leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              The Future of Personalized Education
            </motion.p>
            
            <motion.p 
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Transform your learning journey with AI-powered tutoring, intelligent note management, 
              collaborative study environments, and personalized educational tools designed to unlock your full potential.
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-8 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">50K+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Active Students</div>
              </div>
              <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">98%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
              </div>
              <div className="w-px h-8 bg-slate-300 dark:bg-slate-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">AI Support</div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <GlassmorphismButton 
                size="lg"
                onClick={() => setLocation('/chat')}
                className="group"
              >
                Start Learning Today
                <ArrowRight className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </GlassmorphismButton>
              <button 
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 px-6 py-3 font-semibold"
                onClick={() => setLocation('/presentations')}
              >
                Watch Demo
              </button>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Voice & Image Recognition</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time Collaboration</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Smart Study Planning</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements - Hidden on mobile */}
        <motion.div 
          className="hidden lg:flex absolute top-1/4 left-10 w-12 h-12 xl:w-16 xl:h-16 glassmorphism rounded-full items-center justify-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <NotebookPen className="w-5 h-5 xl:w-6 xl:h-6 text-blue-400" />
        </motion.div>
        
        <motion.div 
          className="hidden lg:flex absolute top-1/3 right-10 w-10 h-10 xl:w-12 xl:h-12 glassmorphism rounded-full items-center justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <GraduationCap className="w-4 h-4 xl:w-5 xl:h-5 text-green-400" />
        </motion.div>
      </section>

      {/* Feature Previews */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Experience AI-Powered Learning</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Discover how our intelligent tools transform your educational journey</p>
          </div>
          
          {/* SparkTutor Chat Preview */}
          <motion.div 
            className="glassmorphism rounded-2xl p-8 mb-12 scroll-reveal cursor-pointer group"
            onClick={() => setLocation('/chat')}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">SparkTutor AI Chat</h3>
                    <p className="text-slate-600 dark:text-slate-400">Your personal AI learning assistant</p>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  Get instant help with homework, explanations of complex concepts, and step-by-step problem solving. 
                  Our AI tutor supports text, voice, and image inputs to help you learn in your preferred way.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm">Voice Recognition</span>
                  <span className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm">Image Analysis</span>
                  <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm">24/7 Available</span>
                </div>
                <GlassmorphismButton>
                  Start Chatting <ArrowRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </GlassmorphismButton>
              </div>
              <div className="glassmorphism rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="glassmorphism rounded-lg rounded-tl-none p-3 flex-1">
                      <p className="text-sm text-slate-900 dark:text-white">Hello! I can help you with calculus derivatives. What specific topic would you like to explore?</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-blue-500 rounded-lg rounded-tr-none p-3 max-w-xs">
                      <p className="text-sm text-white">Can you explain the chain rule?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Presentations Preview */}
          <motion.div 
            className="glassmorphism rounded-2xl p-8 mb-12 scroll-reveal cursor-pointer group"
            onClick={() => setLocation('/presentations')}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <div className="aspect-video glassmorphism rounded-lg bg-white dark:bg-gradient-to-br dark:from-purple-500 dark:to-blue-600 flex flex-col justify-center items-center text-center p-6 border border-slate-200 dark:border-transparent">
                  <h1 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">The Solar System</h1>
                  <h2 className="text-lg mb-4 text-slate-700 dark:text-white">An Introduction to Our Cosmic Neighborhood</h2>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Presentation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">AI Presentations</h3>
                    <p className="text-slate-600 dark:text-slate-400">Create stunning slides with AI assistance</p>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  Transform your ideas into professional presentations effortlessly. Our AI helps with content generation, 
                  design suggestions, and slide optimization. Export directly to PowerPoint format.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-700 dark:text-purple-400 text-sm">Auto-Design</span>
                  <span className="px-3 py-1 bg-pink-500/20 rounded-full text-pink-700 dark:text-pink-400 text-sm">Content AI</span>
                  <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-700 dark:text-blue-400 text-sm">PPT Export</span>
                </div>
                <GlassmorphismButton>
                  Create Presentation <ArrowRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </GlassmorphismButton>
              </div>
            </div>
          </motion.div>

          {/* Smart Calendar Preview */}
          <motion.div 
            className="glassmorphism rounded-2xl p-8 mb-12 scroll-reveal cursor-pointer group"
            onClick={() => setLocation('/calendar')}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Calendar</h3>
                    <p className="text-slate-600 dark:text-slate-400">AI-powered scheduling and planning</p>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  Optimize your study schedule with intelligent suggestions. Sync with Google Calendar, 
                  get AI-powered study recommendations, and never miss important deadlines again.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 bg-green-500/20 rounded-full text-green-700 dark:text-green-400 text-sm">Google Sync</span>
                  <span className="px-3 py-1 bg-teal-500/20 rounded-full text-teal-700 dark:text-teal-400 text-sm">Smart Suggestions</span>
                  <span className="px-3 py-1 bg-blue-500/20 rounded-full text-blue-700 dark:text-blue-400 text-sm">Deadline Tracking</span>
                </div>
                <GlassmorphismButton>
                  Open Calendar <ArrowRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </GlassmorphismButton>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`day-${index}`} className="text-center py-1 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 21 }, (_, i) => (
                    <div key={i} className="aspect-square bg-slate-50 dark:bg-slate-700 rounded text-center text-xs pt-1 relative border border-slate-200 dark:border-slate-600">
                      <span className="text-slate-900 dark:text-white">{i + 1}</span>
                      {[5, 12, 18].includes(i + 1) && (
                        <div className={`absolute bottom-1 left-1 right-1 h-1 rounded ${
                          i + 1 === 5 ? 'bg-blue-500' :
                          i + 1 === 12 ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded"></div>
                    <span className="text-slate-700 dark:text-slate-300">Math Exam</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                    <span className="text-slate-700 dark:text-slate-300">Study Group</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Features Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.slice(3).map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glassmorphism rounded-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
                variants={itemVariants}
                onClick={() => setLocation(feature.path)}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{feature.description}</p>
                <button className="text-blue-500 hover:text-green-500 transition-colors duration-300 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="inline w-4 h-4 ml-1" />
                </button>
              </motion.div>
            ))}

            {/* CodeSpark Feature - Full Width */}
            <motion.div
              className="lg:col-span-3 glassmorphism rounded-xl p-8 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
              variants={itemVariants}
              onClick={() => setLocation('/code')}
            >
              <div className="flex flex-col lg:flex-row items-center text-center lg:text-left">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4 lg:mb-0 lg:mr-6 group-hover:scale-110 transition-transform duration-300">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">CodeSpark Module</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Master programming with interactive lessons, code editor, and structured learning paths for Python and JavaScript.</p>
                  <GlassmorphismButton>
                    Start Coding <ArrowRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </GlassmorphismButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;
