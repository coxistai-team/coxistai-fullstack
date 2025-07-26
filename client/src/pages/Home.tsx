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
  Heart as HeartIcon
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import ParticleField from "@/components/effects/ParticleField";

const Home = () => {
  const [, setLocation] = useLocation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { scrollY } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const stats = [
    { number: "50K+", label: "Active Students", icon: Users, color: "from-purple-500 to-pink-500" },
    { number: "98%", label: "Success Rate", icon: Star, color: "from-yellow-500 to-orange-500" },
    { number: "24/7", label: "AI Support", icon: Zap, color: "from-blue-500 to-cyan-500" },
    { number: "150+", label: "Countries", icon: Globe, color: "from-green-500 to-emerald-500" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content: "Coexist AI transformed my learning experience. The AI tutor helped me understand complex algorithms in minutes!",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Particle Field Background */}
      <ParticleField />
      
      {/* Creative Background Shapes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-2xl floating-element"></div>
        
        {/* Creative Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl creative-shape"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg creative-shape"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-md creative-shape"></div>
      </div>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4"
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
              className="inline-flex items-center space-x-2 glassmorphism rounded-full px-6 py-3 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Next-Generation AI Learning Platform
              </span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Coexist
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                AI
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              className="text-xl md:text-3xl text-gray-300 mb-6 font-light max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Transform your learning journey with{" "}
              <span className="text-blue-400 font-semibold">AI-powered education</span>
            </motion.p>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Personalized tutoring, intelligent note management, collaborative learning, 
              and smart study tools designed to unlock your full potential.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <motion.button
                className="btn-primary group relative z-10 glow-effect"
                onClick={() => setLocation('/chat')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center">
                  Start Learning Today
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 px-8 py-4 rounded-xl border border-gray-700 hover:border-gray-500 glassmorphism hover-lift"
                onClick={() => setLocation('/presentations')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                <span className="font-semibold">Watch Demo</span>
              </motion.button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.button
              onClick={scrollToFeatures}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 hover:text-white transition-colors floating-icon"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-8 h-8" />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        ref={statsRef}
        className="py-20 px-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={statsInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center glassmorphism-enhanced rounded-2xl p-8 hover-lift"
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-blue-400 floating-icon" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Bento Grid Features Section */}
      <motion.section 
        ref={featuresRef}
        className="py-20 px-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={featuresInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover how our AI-powered tools transform your educational journey
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Top Row - Large Cards */}
            <motion.div
              className="md:col-span-2 lg:col-span-2 feature-card group cursor-pointer relative overflow-hidden creative-border"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              onClick={() => setLocation('/chat')}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl"></div>
              <div className="relative p-8 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI TUTOR</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    SparkTutor AI Chat
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    Get instant help with homework, explanations, and step-by-step problem solving with our advanced AI tutor.
                  </p>
                  <div className="flex items-center text-blue-400 group-hover:text-purple-400 transition-colors">
                    <span className="font-semibold">Start Chatting</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg"></div>
            </motion.div>

            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              onClick={() => setLocation('/notes')}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl"></div>
              <div className="relative p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">SMART NOTES</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <NotebookPen className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    Notes Hub
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Organize your thoughts with intelligent note-taking and advanced search.
                  </p>
                  <div className="flex items-center text-purple-400 group-hover:text-pink-400 transition-colors">
                    <span className="font-semibold text-sm">Explore</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg"></div>
            </motion.div>

            {/* Middle Row - Mixed Cards */}
            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              onClick={() => setLocation('/community')}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl"></div>
              <div className="relative p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">COMMUNITY</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                    Learning Community
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Connect with fellow learners and join study groups.
                  </p>
                  <div className="flex items-center text-green-400 group-hover:text-emerald-400 transition-colors">
                    <span className="font-semibold text-sm">Join</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-lg"></div>
            </motion.div>

            <motion.div
              className="md:col-span-2 feature-card group cursor-pointer relative overflow-hidden creative-border"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              onClick={() => setLocation('/presentations')}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl"></div>
              <div className="relative p-8 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">AI PRESENTATIONS</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Presentation className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
                    AI Presentations
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    Create stunning presentations effortlessly with AI assistance and professional templates.
                  </p>
                  <div className="flex items-center text-indigo-400 group-hover:text-purple-400 transition-colors">
                    <span className="font-semibold">Create Now</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg"></div>
            </motion.div>

            {/* Bottom Row - Mixed Cards */}
            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              onClick={() => setLocation('/calendar')}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-3xl"></div>
              <div className="relative p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">CALENDAR</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                    Smart Calendar
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Optimize your study schedule with intelligent planning.
                  </p>
                  <div className="flex items-center text-teal-400 group-hover:text-blue-400 transition-colors">
                    <span className="font-semibold text-sm">Plan</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-lg"></div>
            </motion.div>

            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              onClick={() => setLocation('/code')}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-3xl"></div>
              <div className="relative p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">CODE</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    CodeSpark
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Interactive coding environment with real-time execution.
                  </p>
                  <div className="flex items-center text-orange-400 group-hover:text-red-400 transition-colors">
                    <span className="font-semibold text-sm">Code</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-lg"></div>
            </motion.div>

            <motion.div
              className="feature-card group cursor-pointer relative overflow-hidden creative-border"
              initial={{ opacity: 0, y: 50 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.6 }}
              onClick={() => setLocation('/college')}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-3xl"></div>
              <div className="relative p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">COLLEGE</span>
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                    College Recommender
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Discover the perfect college match with AI recommendations.
                  </p>
                  <div className="flex items-center text-yellow-400 group-hover:text-orange-400 transition-colors">
                    <span className="font-semibold text-sm">Find</span>
                    <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              {/* Creative Background Elements */}
              <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-lg"></div>
            </motion.div>
          </div>

          {/* Skill Tags Section */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-white mb-8">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Skills You Can Master
              </span>
            </h3>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {skillTags.map((tag, index) => (
                <motion.div
                  key={tag}
                  className="skill-tag hover:from-purple-500/30 hover:to-blue-500/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={featuresInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.9 + index * 0.02, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  {tag}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
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

          {/* Testimonial indicators */}
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

      {/* CTA Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="glassmorphism-enhanced rounded-3xl p-12 md:p-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Ready to Transform Your Learning?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Join thousands of students who are already experiencing the future of education
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <motion.button
                className="btn-primary group glow-effect"
                onClick={() => setLocation('/signup')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button
                className="px-8 py-4 rounded-xl border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white transition-all duration-300 glassmorphism hover-lift"
                onClick={() => setLocation('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
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
    </main>
  );
};

export default Home;