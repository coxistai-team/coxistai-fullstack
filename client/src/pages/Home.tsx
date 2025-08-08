import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
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
  Sparkles,
  Star,
  Zap,
  Shield,
  Globe,
  ChevronDown,
  Play,
  CheckCircle,
  Brain,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Lightbulb,
  Rocket,
  Heart,
  Eye,
  Clock,
  Users2,
  Bookmark,
  Activity,
  BarChart3,
  Cpu,
  Palette,
  Database,
  Cloud,
  Lock,
  Sparkle,
  Target as TargetIcon,
  Zap as ZapIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  Coffee,
  Music,
  Camera,
  Gift,
  Flame
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import ParticleField from "@/components/effects/ParticleField";
import Footer from "@/components/layout/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const [, setLocation] = useLocation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { scrollY } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const heroInView = useInView(heroRef, { once: true });

  const statsInView = useInView(statsRef, { once: true });

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const stats = [
    { number: "100+", label: "Active Students", icon: Users, color: "from-purple-500 to-pink-500" },
    { number: "24/7", label: "AI Support", icon: Zap, color: "from-blue-500 to-cyan-500" },
    { number: "10+", label: "Countries", icon: Globe, color: "from-green-500 to-emerald-500" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content: "CoXist AI transformed my learning experience. The AI tutor helped me understand complex algorithms in minutes!",
      avatar: "SC",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "High School Senior",
      content: "The college recommender feature was a game-changer. I found my dream university and got accepted!",
      avatar: "MR",
      rating: 5
    },
    {
      name: "Emily Zhang",
      role: "Medical Student",
      content: "The note-taking system and study groups helped me ace my medical exams. Highly recommended!",
      avatar: "EZ",
      rating: 5
    }
  ];

  const skillTags = [
    "AI Learning", "Machine Learning", "Python", "JavaScript", "React", "Node.js",
    "Data Science", "Web Development", "Mobile Apps", "Cloud Computing", "DevOps",
    "UI/UX Design", "Product Management", "Marketing", "Finance", "Healthcare",
    "Education", "Research", "Writing", "Public Speaking", "Leadership"
  ];

  const funElements = [
    { icon: Coffee, text: "Fuel your creativity", color: "text-orange-400" },
    { icon: Music, text: "Learn with rhythm", color: "text-purple-400" },
    { icon: Camera, text: "Capture knowledge", color: "text-blue-400" },
    { icon: Gift, text: "Unlock your potential", color: "text-green-400" },
    { icon: Flame, text: "Ignite your passion", color: "text-red-400" },
    { icon: Brain, text: "Expand your mind", color: "text-pink-400" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigation = async (path: string) => {
    setIsLoading(true);
    // Simulate optimistic UI update
    setTimeout(() => {
      setLocation(path);
      setIsLoading(false);
    }, 300);
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden mobile-safe -mt-20 sm:-mt-24">
      {/* Particle Field Background */}
      <ParticleField />
      
      {/* Creative Background Shapes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-48 sm:h-48 bg-green-500/10 rounded-full blur-2xl floating-element"></div>
        
        {/* Creative Shapes */}
        <div className="absolute top-20 right-20 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl creative-shape"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg creative-shape"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-md creative-shape"></div>
      </div>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:pt-5 mobile-safe-top"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
                        <motion.div
              className="inline-flex items-center space-x-2 glassmorphism rounded-full px-3 py-2 sm:px-5 sm:py-2 mb-4 sm:mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Next-Generation AI Learning Platform
              </span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="block mb-2 sm:mb-4">Your</span>
              <span className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                <motion.span 
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-purple-500 rounded-full text-base sm:text-6xl sm:font-bold font-semibold"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Sparkles className="w-5 h-5 sm:w-10 sm:h-10 text-white mr-2" />
                  <span className="text-white">Complete</span>
                </motion.span>
              </span>
              <span className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <motion.span 
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-cyan-500 rounded-full text-base sm:text-6xl sm:font-bold font-semibold"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2" />
                  <span className="text-white">Learning</span>
                </motion.span>
                <motion.span 
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-yellow-400 rounded-full text-base sm:text-6xl sm:font-bold font-semibold"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2" />
                  <span className="text-white">Hub</span>
                </motion.span>
              </span>
            </motion.h1>
            
            {/* Extended Subtitle */}
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl sm:max-w-5xl mx-auto mb-6 sm:mb-8 leading-relaxed text-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              Everything you need for academic success in one place: AI-powered tutoring, smart note-taking, presentation creation, 
              intelligent scheduling, and interactive coding exercises. Your complete student toolkit for modern education.
            </motion.p>

            {/* Fun Elements Row */}
            <motion.div 
              className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {funElements.map((element, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.02 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <element.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${element.color}`} />
                  <span className="text-gray-400">{element.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <motion.button
                className={`btn-primary group relative z-10 glow-effect touch-target ${
                  isLoading ? 'optimistic-loading' : ''
                }`}
                onClick={() => handleNavigation('/chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                aria-label="Start Learning Today"
              >
                <span className="relative z-10 flex items-center">
                  Start Learning Today
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-gray-700 hover:border-gray-500 glassmorphism hover-lift touch-target"
                onClick={() => handleNavigation('/presentations')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Watch Demo"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">Watch Demo</span>
              </motion.button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.button
              onClick={scrollToFeatures}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 hover:text-white transition-colors floating-icon touch-target"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              aria-label="Scroll to features"
            >
              <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        ref={statsRef}
        className="py-12 sm:py-20 px-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={statsInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Platform Statistics
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Join our growing community of learners and educators
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center glassmorphism-enhanced rounded-2xl p-6 sm:p-8 hover-lift touch-target"
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 sm:mb-4 text-blue-400 floating-icon" />
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">{stat.number}</div>
                <div className="text-gray-400 font-medium text-sm sm:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Bento Grid Features Section */}
      <motion.section 
        ref={featuresRef}
        className="py-12 sm:py-20 px-4 relative z-10"

      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 sm:mb-20"

          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
              Discover how our AI-powered tools transform your educational journey
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {/* Top Row - Large Cards */}
            <motion.div
              className="sm:col-span-2 lg:col-span-2 feature-card group cursor-pointer relative overflow-hidden creative-border touch-target"
              onClick={() => handleNavigation('/chat')}
              whileHover={{ y: -10 }}
              aria-label="Navigate to SparkTutor AI Chat"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl"></div>
              <div className="relative p-6 sm:p-8 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI TUTOR</span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-blue-400 transition-colors">
                    SparkTutor AI Chat
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    Get instant help with homework, explanations, and step-by-step problem solving with our advanced AI tutor.
                  </p>
                  <div className="flex items-center text-blue-400 group-hover:text-purple-400 transition-colors">
                    <span className="font-semibold text-sm sm:text-base">Start Chatting</span>
                    <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg"></div>
            </motion.div>

            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border touch-target"
              onClick={() => handleNavigation('/notes')}
              whileHover={{ y: -10 }}
              aria-label="Navigate to Notes Hub"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl"></div>
              <div className="relative p-4 sm:p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">SMART NOTES</span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <NotebookPen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-purple-400 transition-colors">
                    Notes Hub
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3 sm:mb-4">
                    Organize your thoughts with intelligent note-taking and advanced search.
                  </p>
                  <div className="flex items-center text-purple-400 group-hover:text-pink-400 transition-colors">
                    <span className="font-semibold text-sm">Explore</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg"></div>
            </motion.div>

            {/* Middle Row - Mixed Cards */}
            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border touch-target"
              onClick={() => handleNavigation('/community')}
              whileHover={{ y: -10 }}
              aria-label="Navigate to Learning Community"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl"></div>
              <div className="relative p-4 sm:p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">COMMUNITY</span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-green-400 transition-colors">
                    Learning Community
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3 sm:mb-4">
                    Connect with fellow learners and join study groups.
                  </p>
                  <div className="flex items-center text-green-400 group-hover:text-emerald-400 transition-colors">
                    <span className="font-semibold text-sm">Join</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-lg"></div>
            </motion.div>

            <motion.div
              className="sm:col-span-2 feature-card group cursor-pointer relative overflow-hidden creative-border touch-target"
              onClick={() => handleNavigation('/presentations')}
              whileHover={{ y: -10 }}
              aria-label="Navigate to AI Presentations"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl"></div>
              <div className="relative p-6 sm:p-8 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">AI PRESENTATIONS</span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Presentation className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-indigo-400 transition-colors">
                    AI Presentations
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    Create stunning presentations effortlessly with AI assistance and professional templates.
                  </p>
                  <div className="flex items-center text-indigo-400 group-hover:text-purple-400 transition-colors">
                    <span className="font-semibold text-sm sm:text-base">Create Now</span>
                    <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg"></div>
            </motion.div>

            {/* Bottom Row - Mixed Cards */}
            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border touch-target"
              onClick={() => handleNavigation('/calendar')}
              whileHover={{ y: -10 }}
              aria-label="Navigate to Smart Calendar"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-3xl"></div>
              <div className="relative p-4 sm:p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">CALENDAR</span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-teal-400 transition-colors">
                    Smart Calendar
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3 sm:mb-4">
                    Optimize your study schedule with intelligent planning.
                  </p>
                  <div className="flex items-center text-teal-400 group-hover:text-blue-400 transition-colors">
                    <span className="font-semibold text-sm">Plan</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-lg"></div>
            </motion.div>

            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border touch-target"
              onClick={() => handleNavigation('/code')}
              whileHover={{ y: -10 }}
              aria-label="Navigate to CodeSpark"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl"></div>
              <div className="relative p-4 sm:p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">CODE</span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Code className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-orange-400 transition-colors">
                    CodeSpark
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3 sm:mb-4">
                    Interactive coding environment with real-time execution.
                  </p>
                  <div className="flex items-center text-orange-400 group-hover:text-red-400 transition-colors">
                    <span className="font-semibold text-sm">Code</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-lg"></div>
            </motion.div>

            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border touch-target"
              onClick={() => handleNavigation('/college')}
              whileHover={{ y: -10 }}
              aria-label="Navigate to College Recommender"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-3xl"></div>
              <div className="relative p-4 sm:p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">COLLEGE</span>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-yellow-400 transition-colors">
                    College Recommender
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3 sm:mb-4">
                    Discover the perfect college match with AI recommendations.
                  </p>
                  <div className="flex items-center text-yellow-400 group-hover:text-orange-400 transition-colors">
                    <span className="font-semibold text-sm">Find</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-lg"></div>
            </motion.div>
          </div>

          {/* Skill Tags Section */}
          <motion.div
            className="mt-12 sm:mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Skills You Can Master
              </span>
            </h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto px-4">
              {skillTags.map((tag, index) => (
                <motion.div
                  key={tag}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-purple-500/30 hover:to-blue-500/30 backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium text-white/90 hover:text-white transition-all duration-300 touch-target cursor-pointer"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ 
                    scale: 1.08, 
                    y: -3,
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
                    borderColor: "rgba(147, 51, 234, 0.5)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section 
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                What Students Say
              </span>
            </h2>
            <p className="text-xl text-gray-400">Real stories from our learning community</p>
          </motion.div>

          <motion.div
            className="glassmorphism-enhanced rounded-3xl p-8 md:p-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <motion.p
                key={currentTestimonial}
                className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                "{testimonials[currentTestimonial].content}"
              </motion.p>
              
              <motion.div
                key={`author-${currentTestimonial}`}
                className="flex items-center justify-center space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-400">{testimonials[currentTestimonial].role}</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-blue-400 scale-125' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>
      */}

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="glassmorphism-enhanced rounded-3xl p-8 sm:p-12 md:p-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Ready to Transform Your Learning?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 leading-relaxed">
              Join thousands of students who are already experiencing the future of education
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
              <motion.button
                className={`btn-primary group glow-effect touch-target ${
                  isLoading ? 'optimistic-loading' : ''
                }`}
                onClick={() => handleNavigation('/signup')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                aria-label="Get Started Free"
              >
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white transition-all duration-300 glassmorphism hover-lift touch-target"
                onClick={() => handleNavigation('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Sign In"
              >
                Sign In
              </motion.button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Instant access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default Home;