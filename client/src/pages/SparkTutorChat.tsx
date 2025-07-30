import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Mic, 
  MicOff,
  Paperclip, 
  Send, 
  User,
  X,
  FileText,
  Image as ImageIcon,
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  Search,
  Square,
  Brain,
  Zap,
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Edit3
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import FileUpload from "@/components/ui/file-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePageLoading } from "@/contexts/PageLoadingContext";
import { MiniLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import ParticleField from "@/components/effects/ParticleField";

const API_URL = import.meta.env.VITE_API_URL;
const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL;

const formatMessage = (content: string): string => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-blue-300">$1</strong>')
    .replace(/^\* (.+)$/gm, '<div class="flex items-start mb-2 ml-2"><span class="text-blue-400 mr-3 font-bold flex-shrink-0">•</span><span class="flex-1">$1</span></div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div class="flex items-start mb-2 ml-2"><span class="text-blue-400 mr-3 font-semibold flex-shrink-0">$1.</span><span class="flex-1">$2</span></div>')
    .replace(/\n/g, '<br class="my-1"/>');
};

interface AttachedFile {
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'document' | 'audio' | 'other';
}

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: string;
  attachedFiles?: AttachedFile[];
  status?: 'sending' | 'sent' | 'error';
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  lastUpdated: string;
}

const SparkTutorChat = () => {
  const { showPageLoader, hidePageLoader } = usePageLoading();
  const { toast } = useToast();
  
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('sparktutor-sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    content: "Hello! I'm SparkTutor, your AI learning assistant. I can help you with homework, explain concepts, solve problems, and much more. You can also upload files for me to analyze! How can I assist you today?",
    isAI: true,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageIndicator, setNewMessageIndicator] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "smooth"
        });
        // Update state after scrolling
        setTimeout(() => {
          setIsAtBottom(true);
          setShowScrollToBottom(false);
          setNewMessageIndicator(false);
        }, 500);
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsAtBottom(isBottom);
    setShowScrollToBottom(!isBottom);
  };

  // Optimistic UI: Update sessions immediately
  useEffect(() => {
    localStorage.setItem('sparktutor-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setChatSessions(sessions => 
        sessions.map(session => 
          session.id === currentSessionId 
            ? { ...session, messages, lastUpdated: new Date().toISOString() }
            : session
        )
      );
    }
  }, [messages, currentSessionId]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [{
        id: "1",
        content: "Hello! I'm SparkTutor, your AI learning assistant. I can help you with homework, explain concepts, solve problems, and much more. You can also upload files for me to analyze! How can I assist you today?",
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages);
    setSidebarOpen(false);
  };

  const switchToSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setSidebarOpen(false);
    }
  };

  const deleteSession = (sessionId: string) => {
    // Optimistic UI: Remove immediately
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remainingSessions = chatSessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        switchToSession(remainingSessions[0].id);
      } else {
        createNewChat();
      }
    }
    
    // Keep sidebar open - don't close it when deleting chats
    // The sidebar will only close when user explicitly closes it
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    setChatSessions(sessions => 
      sessions.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle }
          : session
      )
    );
    setEditingSessionId(null);
    setEditingSessionTitle("");
  };

  const startEditingSession = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingSessionTitle(currentTitle);
  };

  const cancelEditingSession = () => {
    setEditingSessionId(null);
    setEditingSessionTitle("");
  };

  const saveSessionTitle = () => {
    if (editingSessionId && editingSessionTitle.trim()) {
      updateSessionTitle(editingSessionId, editingSessionTitle.trim());
    }
  };

  const generateTitle = (firstUserMessage: string) => {
    const words = firstUserMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstUserMessage.split(' ').length > 5 ? '...' : '');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
        
        setAttachedFile({
          file: audioFile,
          type: 'audio'
        });
        
        setIsRecording(false);
        setRecordingTime(0);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Optimistic UI: Add message immediately
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
    };

    // Optimistic update
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    try {
      const response = await sendToAPI(inputValue.trim());

      // Update message status to sent
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id
            ? { ...msg, status: 'sent' }
            : msg
        )
      );

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show new message indicator if user is not at bottom
      if (!isAtBottom) {
        setNewMessageIndicator(true);
        setTimeout(() => setNewMessageIndicator(false), 3000);
      }

      // Update session title if it's the first user message
      if (currentSession && currentSession.messages.length === 1) {
        const newTitle = generateTitle(inputValue.trim());
        updateSessionTitle(currentSession.id, newTitle);
      }

    } catch (error) {
      console.error('Error sending message:', error);

      // Update message status to error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id
            ? { ...msg, status: 'error' }
            : msg
        )
      );

      toast({
        title: "Message Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update sendToAPI to use JSON and correct endpoint
  const sendToAPI = async (messageContent: string) => {
    setIsLoading(true);

    try {
      const payload = { message: messageContent };

      const response = await axios.post(
        `${CHATBOT_API_URL}/api/chat/text`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      setIsLoading(false);
      return (
        response.data.ai_response ||
        response.data.message ||
        "I'm sorry, I couldn't process your request. Please try again."
      );
    } catch (error) {
      setIsLoading(false);
      console.error('API Error:', error);
      throw new Error('Failed to get response from AI');
    }
  };

  const handleFilesChange = (files: AttachedFile[]) => {
    if (files.length > 0) {
      setAttachedFile(files[0]);
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

  const getFileIcon = (type: AttachedFile['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-400" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-green-400" />;
      case 'audio':
        return <Mic className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Auto-resize textarea
    const textarea = e.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter for new chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        createNewChat();
        // Show sidebar briefly to indicate new chat creation
        setSidebarOpen(true);
        setTimeout(() => {
          if (!sidebarOpen) {
            setSidebarOpen(false);
          }
        }, 2000);
      }
      // Ctrl/Cmd + K to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [sidebarOpen]);

  const isAITyping = isLoading;

  // Filter sessions based on search
  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="relative z-10 h-screen bg-black text-white overflow-hidden">
      {/* Particle Field Background */}
      <ParticleField />
      
      {/* Creative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-2xl floating-element"></div>
        
        {/* Creative Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl creative-shape"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg creative-shape"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-md creative-shape"></div>
      </div>

      <div className="flex h-full pt-16">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed top-16 inset-x-0 bottom-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-16 bottom-0 left-0 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 flex flex-col shadow-2xl"
              >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      SparkTutor
                    </h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                      title="Close Sidebar"
                    >
                      <Menu className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  
                  <button
                    onClick={createNewChat}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Chat
                  </button>

                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search your threads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500"
                    />
                  </div>
                </div>

                {/* Chat Sessions List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredSessions.length === 0 ? (
                    <motion.div 
                      className="text-center text-slate-400 py-12 px-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No chats yet</p>
                      <p className="text-sm text-slate-500">Start a new conversation to begin!</p>
                    </motion.div>
                  ) : (
                    <div className="p-4 space-y-1">
                      {filteredSessions.map((session, index) => (
                        <motion.div
                          key={session.id}
                          className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            currentSessionId === session.id
                              ? 'bg-slate-700/50 border border-slate-600'
                              : 'hover:bg-slate-800/50'
                          }`}
                          onClick={() => switchToSession(session.id)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                        {editingSessionId === session.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editingSessionTitle}
                              onChange={(e) => setEditingSessionTitle(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') saveSessionTitle();
                                if (e.key === 'Escape') cancelEditingSession();
                              }}
                              className="flex-1 text-sm bg-slate-800/50 border-slate-600 text-white focus:border-slate-500"
                              autoFocus
                            />
                            <button
                              onClick={saveSessionTitle}
                              className="p-1.5 hover:bg-green-500/20 rounded text-green-400 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditingSession}
                              className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-200 truncate">
                                {session.title}
                              </p>
                              <p className="text-xs text-slate-500 truncate mt-1">
                                {session.messages.length} messages • {new Date(session.lastUpdated).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingSession(session.id, session.title);
                                }}
                                className="p-1.5 hover:bg-slate-700/50 rounded text-slate-400 hover:text-blue-400 transition-colors"
                                title="Rename chat"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(session.id);
                                }}
                                className="p-1.5 hover:bg-slate-700/50 rounded text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete chat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Chat Container */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-80 lg:pl-4' : ''}`}>


          

          {/* Chat Messages Area */}
          <div className="flex-1 flex flex-col min-h-0">

            
            {/* Menu Button - Only visible when sidebar is closed */}
            {!sidebarOpen && (
              <motion.div 
                className="absolute top-24 left-6 z-50"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-3 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl hover:bg-slate-700/80 hover:border-slate-500/60 transition-all duration-200 hover:scale-105 shadow-lg"
                  title="Toggle Sidebar (⌘+K)"
                >
                  <Menu className="w-6 h-6 text-slate-200" />
                </button>
              </motion.div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 min-h-0 relative">
              <ScrollArea 
                ref={scrollAreaRef}
                className="h-full w-full"
                onScroll={handleScroll}
              >
                <div className="p-4 pt-20 space-y-6 min-h-full">
                  {messages.length === 0 && (
                    <motion.div 
                      className="flex flex-col items-center justify-center py-20 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-4">Welcome to SparkTutor AI</h2>
                      <p className="text-slate-400 max-w-md mb-6">
                        I'm your AI learning assistant. I can help you with homework, explain concepts, solve problems, and much more. You can also upload files for me to analyze!
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>Click menu button (top-left) or press ⌘+K to open sidebar</span>
                        <span>•</span>
                        <span>⌘+Enter for new chat</span>
                      </div>
                    </motion.div>
                  )}
                  {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex items-start gap-3 ${message.isAI ? '' : 'justify-end'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {message.isAI && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 floating-icon">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] p-4 rounded-2xl relative ${
                    message.isAI 
                      ? 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-tl-md' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-tr-md'
                  } shadow-lg`}>
                    {/* Message Status Indicators */}
                    {!message.isAI && (
                      <div className="absolute -top-2 -right-2">
                        {message.status === 'sending' && (
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {message.status === 'sent' && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        {message.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    )}

                    {/* Attached Files */}
                    {message.attachedFiles && message.attachedFiles.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachedFiles.map((file, fileIndex) => (
                          <motion.div
                            key={fileIndex}
                            className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {getFileIcon(file.type)}
                            <span className="text-sm text-white truncate flex-1">
                              {file.file.name}
                            </span>
                            {file.preview && (
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <div 
                      className={`text-white leading-relaxed break-words message-content ${message.isAI ? 'formatted-content' : ''}`}
                      dangerouslySetInnerHTML={{ 
                        __html: message.isAI ? formatMessage(message.content) : formatMessage(message.content)
                      }}
                      style={{ 
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    />
                    <p className="text-xs text-slate-400 mt-3 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {message.timestamp}
                    </p>
                  </div>
                  
                  {!message.isAI && (
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* AI Typing Indicator */}
              {isAITyping && (
                <motion.div
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 floating-icon">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-lg p-3 rounded-lg glassmorphism-enhanced rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      SparkTutor is thinking...
                    </p>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Scroll to Bottom Button */}
              <AnimatePresence>
                {showScrollToBottom && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 z-10 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    title="Scroll to bottom"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
              
              {/* New Message Indicator */}
              <AnimatePresence>
                {newMessageIndicator && !isAtBottom && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg text-sm font-medium"
                  >
                    New message
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Chat Input */}
            <div className="border-t border-slate-700/50 p-4 bg-slate-900/30 backdrop-blur-sm">
              {/* Recording Indicator */}
              {isRecording && (
                <motion.div 
                  className="mb-3 p-3 glassmorphism-enhanced rounded-lg border border-red-400/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium">Recording...</span>
                      <span className="text-red-400 font-mono">{formatTime(recordingTime)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={cancelRecording}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                        title="Cancel Recording"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={stopRecording}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400 hover:text-red-300"
                        title="Stop Recording"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* File Attachment Preview */}
              {attachedFile && (
                <motion.div 
                  className="mb-3 p-3 glassmorphism-enhanced rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {attachedFile.preview ? (
                        <img 
                          src={attachedFile.preview} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                          {getFileIcon(attachedFile.type)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-xs">
                          {attachedFile.file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(attachedFile.file.size / 1024 / 1024).toFixed(2)} MB • {attachedFile.type}
                          {attachedFile.type === 'audio' && (
                            <span className="ml-2 text-green-400">🎵 Voice Recording</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeAttachedFile}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="flex items-end space-x-3">
                <div className="flex-1 bg-slate-800/50 border border-slate-600 rounded-xl p-3 focus-within:border-slate-500 transition-colors">
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      attachedFile 
                        ? "Add a question about your file (optional)..." 
                        : "Type your message here..."
                    }
                    className="w-full bg-transparent resize-none outline-none placeholder-slate-400 text-white min-h-[20px] max-h-32"
                    rows={1}
                    disabled={isLoading || isRecording}
                    style={{ 
                      minHeight: '20px',
                      maxHeight: '128px'
                    }}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title="Toggle Sidebar (⌘+K)"
                    className="bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 hover:text-slate-200 p-3 rounded-lg transition-all duration-200 flex items-center justify-center border border-slate-600/50 hover:border-slate-500/60"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    title="Send Message (Enter)"
                    disabled={isLoading || isRecording || !inputValue.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                <span>
                  {attachedFile 
                    ? "You can add a question about your file or send it as is for general analysis"
                    : "Type your message and press Enter or click Send to chat with SparkTutor"
                  }
                </span>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="hidden sm:inline">⌘+Enter: New Chat</span>
                  <span className="hidden sm:inline">⌘+K: Toggle Sidebar</span>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Dialog */}
          <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
            <DialogContent className="max-w-2xl glassmorphism-enhanced border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center space-x-2">
                  <Paperclip className="w-5 h-5" />
                  <span>Attach Files for Analysis</span>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <FileUpload
                  onFilesChange={handleFilesChange}
                  maxFiles={3}
                  maxSize={10}
                  acceptedTypes={['image/*', '.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx']}
                />
                <div className="mt-6 flex justify-end space-x-3">
                  <GlassmorphismButton
                    variant="outline"
                    onClick={() => setShowFileDialog(false)}
                    className="hover-lift"
                  >
                    Cancel
                  </GlassmorphismButton>
                  <GlassmorphismButton
                    onClick={() => setShowFileDialog(false)}
                    disabled={!attachedFile}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover-lift"
                  >
                    Attach File{attachedFile ? " (1)" : ""}
                  </GlassmorphismButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  );
};

export default SparkTutorChat;