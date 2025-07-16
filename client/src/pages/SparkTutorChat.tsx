import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Mic, 
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
  Search
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import FileUpload from "@/components/ui/file-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLoading } from "@/contexts/LoadingContext";
import { MiniLoader } from "@/components/ui/page-loader";

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'document' | 'other';
}

interface Message {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: string;
  attachedFiles?: UploadedFile[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  lastUpdated: string;
}

const SparkTutorChat = () => {
  const { showLoader, hideLoader } = useLoading();
  
  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('sparktutor-sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem('sparktutor-current-session');
    return saved || null;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Current chat state
  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (currentSession) return currentSession.messages;
    return [{
      id: "1",
      content: "Hello! I'm SparkTutor, your AI learning assistant. I can help you with homework, explain concepts, solve problems, and much more. You can also upload files for me to analyze! How can I assist you today?",
      isAI: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  });

  const [inputValue, setInputValue] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Save to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('sparktutor-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('sparktutor-current-session', currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update current session messages when messages change
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

  // Chat session management functions
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
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remaining = chatSessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        switchToSession(remaining[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle }
          : session
      )
    );
  };

  // Auto-generate title from first user message
  const generateTitle = (firstUserMessage: string) => {
    return firstUserMessage.length > 50 
      ? firstUserMessage.substring(0, 47) + "..."
      : firstUserMessage;
  };

  // Filter sessions based on search
  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSendMessage = () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || "Please analyze the attached files.",
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    // If this is the first user message and we're in a new chat, update the title
    if (!currentSessionId || (currentSession && currentSession.title === "New Chat" && currentSession.messages.length === 1)) {
      const title = generateTitle(userMessage.content);
      if (currentSessionId) {
        updateSessionTitle(currentSessionId, title);
      } else {
        // Create new session if none exists
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title,
          messages: [{
            id: "1",
            content: "Hello! I'm SparkTutor, your AI learning assistant. I can help you with homework, explain concepts, solve problems, and much more. You can also upload files for me to analyze! How can I assist you today?",
            isAI: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, userMessage],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        setChatSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages(newSession.messages);
        setInputValue("");
        setAttachedFiles([]);
        
        // Generate AI response
        setIsAITyping(true);
        setTimeout(() => {
          generateAIResponse(userMessage, newSession.messages);
        }, 1000);
        return;
      }
    }

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setAttachedFiles([]);

    // Generate AI response
    setIsAITyping(true);
    setTimeout(() => {
      generateAIResponse(userMessage, [...messages, userMessage]);
    }, 1000);
  };

  const generateAIResponse = (userMessage: Message, currentMessages: Message[]) => {
    let aiContent = "That's a great question! Let me help you understand this concept step by step.";
    
    if (userMessage.attachedFiles && userMessage.attachedFiles.length > 0) {
      const fileTypes = userMessage.attachedFiles.map(f => f.type);
      if (fileTypes.includes('image')) {
        aiContent = "I can see the image you've uploaded! Based on what I observe, let me analyze this for you. The image appears to contain educational content that I can help explain step by step.";
      } else if (fileTypes.includes('pdf') || fileTypes.includes('document')) {
        aiContent = "I've analyzed the document you uploaded. Let me break down the key concepts and help you understand the material better. What specific part would you like me to focus on?";
      }
      aiContent += " Feel free to ask specific questions about any part of the content!";
    }

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: aiContent,
      isAI: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiResponse]);
    setIsAITyping(false);
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    setAttachedFiles(files);
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-green-400" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-4 h-4 text-blue-400" />;
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

  return (
    <main className="relative z-10 min-h-screen bg-white dark:bg-slate-900">
      <div className="flex min-h-[calc(100vh-5rem)] pt-20">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Overlay for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed top-20 inset-x-0 bottom-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-20 bottom-0 left-0 w-80 bg-white dark:bg-slate-800 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 z-50 flex flex-col shadow-2xl"
              >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chat History</h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-slate-100/50 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  
                  <GlassmorphismButton
                    onClick={createNewChat}
                    className="w-full mb-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                  </GlassmorphismButton>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Chat Sessions List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredSessions.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No chats yet</p>
                      <p className="text-sm">Start a new conversation!</p>
                    </div>
                  ) : (
                    filteredSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          currentSessionId === session.id
                            ? 'bg-blue-500/20 border border-blue-500/30'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => switchToSession(session.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 dark:text-white truncate text-sm">
                              {session.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {new Date(session.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Chat Container */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-80 lg:pl-4' : ''}`}>
          {/* Fixed Header */}
          <div className="fixed top-20 left-0 right-0 z-30 flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100/50 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">SparkTutor AI</h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Online • Ready to help</span>
                  </div>
                </div>
              </div>
            </div>
            <GlassmorphismButton onClick={createNewChat} variant="outline" className="hidden sm:flex">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </GlassmorphismButton>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 pt-20">
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex items-start space-x-3 ${message.isAI ? '' : 'justify-end'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {message.isAI && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-lg p-3 rounded-lg ${
                    message.isAI 
                      ? 'bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-white/10 backdrop-blur-lg rounded-tl-none shadow-lg' 
                      : 'bg-blue-500 rounded-tr-none text-white'
                  }`}>
                    {/* Attached Files */}
                    {message.attachedFiles && message.attachedFiles.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachedFiles.map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className="flex items-center space-x-2 p-2 bg-slate-100/50 dark:bg-white/10 rounded-lg"
                          >
                            {getFileIcon(file.type)}
                            <span className="text-sm text-slate-900 dark:text-white truncate flex-1">
                              {file.file.name}
                            </span>
                            {file.preview && (
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-slate-900 dark:text-white">{message.content}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{message.timestamp}</p>
                  </div>
                  
                  {!message.isAI && (
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-lg p-3 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-white/10 backdrop-blur-lg rounded-tl-none shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">SparkTutor is typing...</p>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="border-t border-slate-200/50 dark:border-white/10 p-4">
              {/* Attached Files Preview */}
              <AnimatePresence>
                {attachedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-3 bg-white/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-white/10 backdrop-blur-lg rounded-lg shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-900 dark:text-slate-300 font-medium">
                        Attached Files ({attachedFiles.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {attachedFiles.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-2 bg-slate-100/50 dark:bg-white/10 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            {getFileIcon(file.type)}
                            <span className="text-sm text-slate-900 dark:text-white truncate">
                              {file.file.name}
                            </span>
                            {file.preview && (
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                          </div>
                          <button
                            onClick={() => removeAttachedFile(index)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end space-x-3">
                <div className="flex-1 glassmorphism rounded-xl p-3">
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={attachedFiles.length > 0 ? "Ask a question about your files..." : "Ask me anything about your studies..."} 
                    className="w-full bg-transparent resize-none outline-none placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white"
                    rows={1}
                  />
                </div>
                <div className="flex space-x-2">
                  <GlassmorphismButton 
                    size="sm" 
                    variant="outline"
                    className="p-3"
                    title="Voice Input"
                  >
                    <Mic className="w-5 h-5" />
                  </GlassmorphismButton>
                  <GlassmorphismButton 
                    size="sm" 
                    variant="outline"
                    className="p-3"
                    title="Attach File"
                    onClick={() => setShowFileDialog(true)}
                  >
                    <Paperclip className="w-5 h-5" />
                  </GlassmorphismButton>
                  <GlassmorphismButton 
                    size="sm"
                    className="p-3"
                    onClick={handleSendMessage}
                    title="Send Message"
                    disabled={!inputValue.trim() && attachedFiles.length === 0}
                  >
                    <Send className="w-5 h-5" />
                  </GlassmorphismButton>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Max file size: 10MB • Supports images, PDFs, documents
                {attachedFiles.length > 0 && " • Files attached - ready to analyze!"}
              </p>
            </div>
          </div>
        </div>

        {/* File Upload Dialog */}
        <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
          <DialogContent className="max-w-2xl bg-slate-900 border-white/20">
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
                >
                  Cancel
                </GlassmorphismButton>
                <GlassmorphismButton
                  onClick={() => setShowFileDialog(false)}
                  disabled={attachedFiles.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-green-500"
                >
                  Attach Files ({attachedFiles.length})
                </GlassmorphismButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

export default SparkTutorChat;