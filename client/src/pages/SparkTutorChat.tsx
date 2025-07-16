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
  Square
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import FileUpload from "@/components/ui/file-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLoading } from "@/contexts/LoadingContext";
import { MiniLoader } from "@/components/ui/page-loader";
import axios from 'axios';

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
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `voice-recording-${Date.now()}.wav`, {
          type: 'audio/wav'
        });
        
        setAttachedFile({
          file: audioFile,
          type: 'audio'
        });
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Clean up without saving
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !attachedFile) || isLoading) return;

    // Create user message
    let userMessageContent = inputValue;
    if (attachedFile && inputValue.trim()) {
      userMessageContent = `${inputValue}\n\n📎 **Attached file:** ${attachedFile.file.name}`;
    } else if (attachedFile && !inputValue.trim()) {
      userMessageContent = `📎 **Attached file:** ${attachedFile.file.name}\n\nPlease analyze this file.`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: userMessageContent,
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFiles: attachedFile ? [attachedFile] : undefined,
    };

    // Update session title if this is the first user message in a "New Chat"
    if (!currentSessionId || (currentSession && currentSession.title === "New Chat" && currentSession.messages.length === 1)) {
      const title = generateTitle(userMessage.content);
      if (currentSessionId) {
        updateSessionTitle(currentSessionId, title);
      } else {
        // Create new session if none exists
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title,
          messages: [
            {
              id: "1",
              content: "Hello! I'm SparkTutor, your AI learning assistant. I can help you with homework, explain concepts, solve problems, and much more. You can also upload files for me to analyze! How can I assist you today?",
              isAI: true,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            userMessage,
          ],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        setChatSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages(newSession.messages);
        setInputValue("");
        setAttachedFile(null);
        setIsLoading(true);
        await sendToAPI(userMessageContent, attachedFile);
        return;
      }
    }

    // For existing sessions, just add the message
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setAttachedFile(null);
    setIsLoading(true);
    await sendToAPI(userMessageContent, attachedFile);
  };

  // Helper function to send message to API
  const sendToAPI = async (messageContent: string, file: AttachedFile | null) => {
    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append("file", file.file);
        if (messageContent.trim()) {
          formData.append("query", messageContent);
        }
        response = await axios.post("http://localhost:3001/api/chat/file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axios.post("http://localhost:3001/api/chat/text", {
          message: messageContent,
        });
      }

      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"));
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.ai_response,
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error calling API:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"));
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting to the server. Please try again later.",
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesChange = (files: AttachedFile[]) => {
    if (files.length > 0) {
      setAttachedFile(files[0]); // Take only the first file for single file mode
    }
  };

  const removeAttachedFile = () => {
    if (attachedFile?.preview) {
      URL.revokeObjectURL(attachedFile.preview);
    }
    setAttachedFile(null);
  };

  const getFileIcon = (type: AttachedFile['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4 text-red-400" />;
      case 'document': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'audio': return <Mic className="w-4 h-4 text-green-400" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clean up on unmount
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

  // AI typing indicator: true when loading AI response
  const isAITyping = isLoading;

  return (
    <main className="relative z-10 h-screen">
      <div className="flex h-full bg-slate-900 pt-20">
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
                className="fixed top-20 bottom-0 left-0 w-80 bg-slate-800/98 backdrop-blur-xl border-r border-white/20 z-50 flex flex-col shadow-2xl"
              >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Chat History</h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
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
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
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
                            : 'hover:bg-white/5'
                        }`}
                        onClick={() => switchToSession(session.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate text-sm">
                              {session.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
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
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">SparkTutor Chat</h1>
            <div className="w-10" />
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between p-6 border-b border-white/10 bg-slate-800/50">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">SparkTutor Chat</h1>
                <p className="text-slate-400">Your AI learning companion is here to help</p>
              </div>
            </div>
            <GlassmorphismButton onClick={createNewChat} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </GlassmorphismButton>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 flex flex-col bg-slate-900">
            {/* Chat Header */}
            <div className="border-b border-white/10 p-4 flex items-center justify-between bg-slate-800/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">SparkTutor AI</h3>
                  <p className="text-sm text-slate-400">Online • Ready to help</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">AI Ready</span>
              </div>
            </div>
            
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
                      ? 'glassmorphism rounded-tl-none' 
                      : 'bg-blue-500 rounded-tr-none'
                  }`}>
                    {/* Attached Files */}
                    {message.attachedFiles && message.attachedFiles.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {message.attachedFiles.map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg"
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
                          </div>
                        ))}
                      </div>
                    )}
                    <div 
                      className={`text-white leading-relaxed ${message.isAI ? 'formatted-content' : ''}`}
                      dangerouslySetInnerHTML={{ 
                        __html: message.isAI ? formatMessage(message.content) : formatMessage(message.content)
                      }}
                    />
                    <p className="text-xs text-slate-400 mt-3 border-t border-white/10 pt-2">
                      {message.timestamp}
                    </p>
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
                  <div className="max-w-lg p-3 rounded-lg glassmorphism rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">SparkTutor is typing...</p>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="border-t border-white/10 p-4">
              {/* Recording Indicator */}
              {isRecording && (
                <div className="mb-3 p-3 glassmorphism rounded-lg border border-red-400/30">
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
                </div>
              )}

              {/* File Attachment Preview */}
              {attachedFile && (
                <div className="mb-3 p-3 glassmorphism rounded-lg">
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
                </div>
              )}

              <div className="flex items-end space-x-3">
                <div className="flex-1 glassmorphism rounded-xl p-3">
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      attachedFile 
                        ? "Add a question about your file (optional)..." 
                        : "Ask me anything about your studies..."
                    }
                    className="w-full bg-transparent resize-none outline-none placeholder-slate-400 text-white"
                    rows={1}
                    disabled={isLoading || isRecording}
                  />
                </div>
                <div className="flex space-x-2">
                  <GlassmorphismButton 
                    size="sm" 
                    variant={isRecording ? "default" : "outline"}
                    className={`p-3 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                    title={isRecording ? "Recording... Click to stop" : "Record Voice Message"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </GlassmorphismButton>
                  <GlassmorphismButton 
                    size="sm" 
                    variant="outline"
                    className="p-3"
                    title="Attach File"
                    onClick={() => setShowFileDialog(true)}
                    disabled={isLoading || isRecording}
                  >
                    <Paperclip className="w-5 h-5" />
                  </GlassmorphismButton>
                  <GlassmorphismButton 
                    size="sm"
                    className="p-3"
                    onClick={handleSendMessage}
                    title="Send Message"
                    disabled={isLoading || isRecording || (!inputValue.trim() && !attachedFile)}
                  >
                    <Send className="w-5 h-5" />
                  </GlassmorphismButton>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {isRecording 
                  ? "Recording in progress... Click the stop button or mic button to finish recording"
                  : attachedFile 
                    ? "You can add a question about your file or send it as is for general analysis"
                    : "Click mic to record voice • Max file size: 16MB • Supports images (PNG, JPG), documents (PDF, DOCX), and audio recordings"
                }
              </p>
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
                    disabled={!attachedFile}
                    className="bg-gradient-to-r from-blue-500 to-green-500"
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