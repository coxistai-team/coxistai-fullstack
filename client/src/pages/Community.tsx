import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, Users, Trophy, TrendingUp, Plus, Search, Filter, Clock, 
  Heart, Share2, BookOpen, Star, Calendar, ThumbsUp, MessageCircle, Eye, 
  Pin, Edit3, Trash2, Send, Sparkles, Zap, Brain, Target, Lightbulb,
  CheckCircle, AlertCircle, Activity, BarChart3, Users2, Award, MoreVertical,
  Copy, Flag, UserCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import ParticleField from "@/components/effects/ParticleField";

// Interfaces from original functional component
interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
  category: string;
  tags: string[];
  timestamp: string;
  likes: number;
  replies: number;
  views: number;
  isPinned?: boolean;
  isLiked?: boolean;
  comments?: Comment[];
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  members: number;
  maxMembers: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  schedule: string;
  nextSession?: string;
  isJoined?: boolean;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  reputation: number;
  badges: string[];
  joinDate: string;
  postsCount: number;
  helpfulAnswers: number;
}

export default function Community() {
  const { user } = useUser();
  const { toast } = useToast();
  
  // All state management from original functional component
  const [activeTab, setActiveTab] = useState("forums");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
    tags: ""
  });

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    subject: "",
    level: "",
    schedule: "",
    maxMembers: 10
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postActionLoading, setPostActionLoading] = useState<string | null>(null); // postId or 'new'
  const [commentActionLoading, setCommentActionLoading] = useState<string | null>(null); // postId
  const [deleteCommentLoading, setDeleteCommentLoading] = useState<string | null>(null); // commentId
  const [likeLoading, setLikeLoading] = useState<string | null>(null); // postId
  const [deleteCommentDialog, setDeleteCommentDialog] = useState<string | null>(null);
  const [deletePostDialog, setDeletePostDialog] = useState<string | null>(null);
  const [deletePostLoading, setDeletePostLoading] = useState<string | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    postId: string | null;
    commentId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    postId: null,
    commentId: null
  });
  
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
    {
      id: "1",
      name: "Advanced Calculus Study Circle",
      description: "Weekly sessions covering multivariable calculus and differential equations",
      subject: "Mathematics",
      members: 8,
      maxMembers: 12,
      level: "Advanced",
      schedule: "Tuesdays & Thursdays 7-9 PM EST",
      nextSession: "Today at 7:00 PM",
      isJoined: false
    },
    {
      id: "2",
      name: "SAT Math Bootcamp",
      description: "Intensive SAT math prep with practice tests and review sessions",
      subject: "Test Prep",
      members: 15,
      maxMembers: 20,
      level: "Intermediate",
      schedule: "Saturdays 2-4 PM EST",
      nextSession: "Saturday at 2:00 PM",
      isJoined: true
    },
    {
      id: "3",
      name: "AP Chemistry Lab Partners",
      description: "Virtual lab sessions and homework help for AP Chemistry students",
      subject: "Chemistry",
      members: 6,
      maxMembers: 10,
      level: "Advanced",
      schedule: "Wednesdays 6-8 PM EST",
      nextSession: "Wednesday at 6:00 PM",
      isJoined: false
    }
  ]);

  const [topUsers, setTopUsers] = useState<User[]>([
    {
      id: "1",
      name: "Alex Johnson",
      reputation: 2456,
      badges: ["Helper", "Expert", "Top Contributor"],
      joinDate: "Jan 2023",
      postsCount: 234,
      helpfulAnswers: 189
    },
    {
      id: "2", 
      name: "Maria Garcia",
      reputation: 1847,
      badges: ["Mentor", "Study Leader"],
      joinDate: "Mar 2023", 
      postsCount: 156,
      helpfulAnswers: 142
    },
    {
      id: "3",
      name: "David Kim",
      reputation: 1523,
      badges: ["Helper", "Active Member"],
      joinDate: "Feb 2023",
      postsCount: 98,
      helpfulAnswers: 87
    }
  ]);
  
  // All handlers from original functional component
  const categories = ["all", "Mathematics", "Science", "Test Prep", "Study Groups", "General"];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Fetch posts from backend
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_URL}/api/community/posts`, { headers: { Authorization: `Bearer ${token}` } });
      const userId = user?.id || "current_user";
      const normalized = res.data.map((post: any) => {
        const likesArr = Array.isArray(post.likes) ? post.likes : [];
        return {
          ...post,
          comments: Array.isArray(post.replies) ? post.replies : [],
          replies: Array.isArray(post.replies) ? post.replies.length : (post.replies || 0),
          likes: likesArr.length,
          isLiked: !!likesArr.find((like: any) => String(like.user_id) === String(userId)),
        };
      });
      setPosts(normalized);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoadingPosts(false);
    }
  }, [toast, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Create post
  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setPostActionLoading("new");
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_URL}/api/community/posts`, {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: newPost.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNewPost({ title: "", content: "", category: "", tags: "" });
      setShowNewPostDialog(false);
      toast({ title: "Post created", description: "Your post has been published successfully" });
      fetchPosts();
    } catch (err) {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    } finally {
      setPostActionLoading(null);
    }
  };

  // Edit post
  const handleEditPost = async (postId: string, newTitle: string, newContent: string) => {
    setPostActionLoading(postId);
    try {
      const post = posts.find((p) => p.id === postId);
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken');
      await axios.put(`${API_URL}/api/community/posts/${postId}`, {
        title: newTitle,
        content: newContent,
        category: post?.category,
        tags: post?.tags,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingPost(null);
      toast({ title: "Post updated", description: "Your post has been updated successfully" });
      fetchPosts();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
    } finally {
      setPostActionLoading(null);
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    setPostActionLoading(postId);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/api/community/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Post deleted", description: "Your post has been deleted successfully" });
      fetchPosts();
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    } finally {
      setPostActionLoading(null);
    }
  };

  // Like/unlike post
  const handleLikePost = async (postId: string) => {
    setLikeLoading(postId);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_URL}/api/community/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchPosts();
    } catch (err) {
      toast({ title: "Error", description: "Failed to like/unlike post", variant: "destructive" });
    } finally {
      setLikeLoading(null);
    }
  };

  // Add comment
  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;
    setCommentActionLoading(postId);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_URL}/api/community/posts/${postId}/replies`, { content: newComment }, { headers: { Authorization: `Bearer ${token}` } });
      setNewComment("");
      toast({ title: "Comment added", description: "Your comment has been posted successfully" });
      fetchPosts();
    } catch (err) {
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    } finally {
      setCommentActionLoading(null);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    setDeleteCommentLoading(commentId);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/api/community/replies/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Comment deleted", description: "Your comment has been deleted successfully" });
      fetchPosts();
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
    } finally {
      setDeleteCommentLoading(null);
    }
  };

  const handleJoinGroup = (groupId: string) => {
    const targetGroup = studyGroups.find(g => g.id === groupId);
    const wasJoined = targetGroup?.isJoined || false;
    
    setStudyGroups(studyGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.isJoined ? group.members - 1 : group.members + 1,
          isJoined: !group.isJoined
        };
      }
      return group;
    }));
    
    toast({
      title: wasJoined ? "Left study group" : "Joined study group",
      description: wasJoined ? "You have left the study group" : "You've successfully joined the study group",
    });
  };

  const handleCreateGroup = () => {
    if (!newGroup.name || !newGroup.description || !newGroup.subject || !newGroup.level) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const group: StudyGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      subject: newGroup.subject,
      members: 1,
      maxMembers: newGroup.maxMembers,
      level: newGroup.level as 'Beginner' | 'Intermediate' | 'Advanced',
      schedule: newGroup.schedule,
      isJoined: true
    };

    setStudyGroups([group, ...studyGroups]);
    setNewGroup({ name: "", description: "", subject: "", level: "", schedule: "", maxMembers: 10 });
    setShowNewGroupDialog(false);
    
    toast({
      title: "Study group created",
      description: "Your study group has been created successfully"
    });
  };

  const isUserPost = (post: Post) => {
    return post.author.id === "current_user" || String(post.author.id) === String(user?.id);
  };

  const isUserComment = (comment: Comment) => {
    return comment.author.id === "current_user" || String(comment.author.id) === String(user?.id);
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, postId: string, commentId?: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      postId,
      commentId: commentId || null
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      postId: null,
      commentId: null
    });
  };

  const handleCopyPost = (post: Post) => {
    const textToCopy = `${post.title}\n\n${post.content}`;
    navigator.clipboard.writeText(textToCopy);
    toast({ title: "Copied", description: "Post content copied to clipboard" });
    handleContextMenuClose();
  };

  const handleReportPost = (postId: string) => {
    toast({ title: "Report submitted", description: "Thank you for reporting this post" });
    handleContextMenuClose();
  };

  const handlePinPost = (postId: string) => {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, isPinned: !p.isPinned } : p
    ));
    toast({ title: "Post updated", description: "Post pin status updated" });
    handleContextMenuClose();
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        handleContextMenuClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Utility to get display name
  function getDisplayName(author: any, currentUser: any) {
    if (!author) return "User";
    if (currentUser && (author.id === currentUser.id || author.username === currentUser.username)) return "You";
    if (author.firstName || author.lastName) return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim();
    if (author.username) return author.username;
    if (author.name) return author.name;
    return "User";
  }
  // Utility to format timestamp
  function formatTimestamp(ts: string) {
    if (!ts) return '';
    const date = new Date(ts);
    if (isNaN(date.getTime())) return ts;
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return date.toLocaleString();
  }
  
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-black text-white overflow-hidden">
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg flex items-center justify-center">
            <Users2 className="w-8 h-8 mr-3 text-blue-400" />
            Learning Community
          </h1>
          <p className="text-slate-400 drop-shadow-md flex items-center justify-center">
            <Sparkles className="w-4 h-4 mr-2 text-green-400" />
            Connect, learn, and grow together with fellow students
          </p>
        </motion.div>

        {/* Stats Cards with new glassmorphism-strong style 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="glassmorphism-strong shadow-xl border-slate-500/20 hover-lift bg-slate-900/50">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-400 floating-icon" />
              <div className="text-2xl font-bold text-white">2,847</div>
              <div className="text-sm text-slate-300">Active Members</div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism-strong shadow-xl border-slate-500/20 hover-lift bg-slate-900/50">
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-400 floating-icon" />
              <div className="text-2xl font-bold text-white">1,234</div>
              <div className="text-sm text-slate-300">Discussions</div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism-strong shadow-xl border-slate-500/20 hover-lift bg-slate-900/50">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-400 floating-icon" />
              <div className="text-2xl font-bold text-white">456</div>
              <div className="text-sm text-slate-300">Study Groups</div>
            </CardContent>
          </Card>
          
          <Card className="glassmorphism-strong shadow-xl border-slate-500/20 hover-lift bg-slate-900/50">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400 floating-icon" />
              <div className="text-2xl font-bold text-white">89%</div>
              <div className="text-sm text-slate-300">Success Rate</div>
            </CardContent>
          </Card>
        </motion.div>
        */}

        {/* Main Content */}  
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="glassmorphism-strong shadow-xl border-slate-500/20 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {user.reputation} points
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#0E1629]/80 backdrop-blur-sm border border-slate-500/20">
                <TabsTrigger value="forums" className="text-white data-[state=active]:bg-slate-600/60 data-[state=active]:text-white">Forums</TabsTrigger>
                <TabsTrigger value="groups" className="text-white data-[state=active]:bg-slate-600/60 data-[state=active]:text-white">Study Groups</TabsTrigger>
                <TabsTrigger value="leaderboard" className="text-white data-[state=active]:bg-slate-600/60 data-[state=active]:text-white">Leaderboard</TabsTrigger>
              </TabsList>

              {/* Forums Tab */}
              <TabsContent value="forums" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full glassmorphism border-slate-500/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>💡 Right-click on posts for more options</span>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48 glassmorphism border-slate-500/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glassmorphism border-slate-500/20">
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="text-white">
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg border-2 border-blue-500 z-10 relative" disabled={loadingPosts || postActionLoading === "new"}>
                        <Plus className="h-4 w-4" />
                        New Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New Post</DialogTitle>
                        <DialogDescription className="text-slate-300">
                          Share your question or start a discussion
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title" className="text-white">Title</Label>
                          <Input
                            id="title"
                            value={newPost.title}
                            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                            placeholder="Enter post title..."
                            disabled={loadingPosts || postActionLoading === "new"}
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-white">Category</Label>
                          <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})} disabled={loadingPosts || postActionLoading === "new"}>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              {categories.slice(1).map(category => (
                                <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="content" className="text-white">Content</Label>
                          <Textarea
                            id="content"
                            value={newPost.content}
                            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                            placeholder="Write your post content..."
                            rows={4}
                            disabled={loadingPosts || postActionLoading === "new"}
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tags" className="text-white">Tags (comma separated)</Label>
                          <Input
                            id="tags"
                            value={newPost.tags}
                            onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                            placeholder="e.g. math, calculus, help"
                            disabled={loadingPosts || postActionLoading === "new"}
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewPostDialog(false)} disabled={loadingPosts || postActionLoading === "new"} className="border-slate-600 text-white hover:bg-slate-800">
                          Cancel
                        </Button>
                        <Button onClick={handleCreatePost} disabled={loadingPosts || postActionLoading === "new"} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Create Post
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {loadingPosts ? (
                    <p className="text-center text-white">Loading discussions...</p>
                  ) : filteredPosts.length === 0 ? (
                    <p className="text-center text-white">No discussions found. Be the first to create one!</p>
                  ) : (
                    filteredPosts.map((post) => (
                      <Card 
                        key={post.id} 
                        className="glassmorphism-strong shadow-xl border-slate-500/20 hover:border-slate-400/40 transition-colors bg-slate-900/50"
                        onContextMenu={(e) => handleContextMenu(e, post.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{getDisplayName(post.author, user).split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  {post.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                                  {editingPost === post.id ? (
                                    <Input
                                      value={post.title}
                                      onChange={(e) => setPosts(posts.map(p => p.id === post.id ? {...p, title: e.target.value} : p))}
                                      className="font-semibold bg-slate-800 border-slate-600 text-white"
                                    />
                                  ) : (
                                    <h3 className="font-semibold text-white">
                                      {post.title}
                                    </h3>
                                  )}
                                  <Badge variant="outline" className="text-slate-300 border-slate-400">{post.category}</Badge>
                                </div>
                                
                                  <div className="flex items-center gap-1">
                                  {isUserPost(post) && (
                                    <>
                                    {editingPost === post.id ? (
                                      <>
                                          <Button variant="ghost" size="sm" onClick={() => handleEditPost(post.id, post.title, post.content)} disabled={loadingPosts || postActionLoading === post.id} className="text-white hover:bg-slate-700">Save</Button>
                                          <Button variant="ghost" size="sm" onClick={() => setEditingPost(null)} disabled={loadingPosts || postActionLoading === post.id} className="text-white hover:bg-slate-700">Cancel</Button>
                                      </>
                                    ) : (
                                      <>
                                          <Button variant="ghost" size="sm" onClick={() => setEditingPost(post.id)} disabled={loadingPosts || postActionLoading === post.id} className="text-white hover:bg-slate-700"><Edit3 className="h-4 w-4" /></Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          aria-label="Delete post"
                                          onClick={() => setDeletePostDialog(post.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                                          disabled={loadingPosts || deletePostLoading === post.id}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                        </>
                                        )}
                                      </>
                                    )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleContextMenu(e, post.id)}
                                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                  </div>
                              </div>
                              
                              {editingPost === post.id ? (
                                <Textarea
                                  value={post.content}
                                  onChange={(e) => setPosts(posts.map(p => p.id === post.id ? {...p, content: e.target.value} : p))}
                                  className="mb-3 bg-slate-800 border-slate-600 text-white"
                                  rows={3}
                                />
                              ) : (
                                <p className="text-slate-300 mb-3">{post.content}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs text-slate-300 bg-slate-600/40">#{tag}</Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.timestamp}</span>
                                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{post.views}</span>
                                  <span>by {getDisplayName(post.author, user)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleLikePost(post.id)} className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : ''}`} disabled={loadingPosts || likeLoading === post.id}>
                                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />{post.likes}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setShowCommentsFor(showCommentsFor === post.id ? null : post.id)} disabled={loadingPosts}>
                                    <MessageCircle className="h-4 w-4" />{post.replies}
                                  </Button>
                                </div>
                              </div>

                              {showCommentsFor === post.id && (
                                <div className="mt-4 pt-4 border-t border-slate-600">
                                  <h4 className="font-semibold text-sm text-white mb-3">Comments ({post.replies})</h4>
                                  <div className="space-y-3 mb-4">
                                    {(post.comments ?? []).map((comment) => (
                                      <div 
                                        key={comment.id} 
                                        className="flex items-start gap-3"
                                        onContextMenu={(e) => handleContextMenu(e, post.id, comment.id)}
                                      >
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src={comment.author?.avatar} />
                                          <AvatarFallback>{getDisplayName(comment.author, user).split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-slate-800 rounded-lg p-3 border border-slate-600">
                                          <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-semibold text-sm text-white">{getDisplayName(comment.author, user)}</span>
                                              <span className="text-xs text-slate-400">{formatTimestamp(comment.timestamp ?? '')}</span>
                                            </div>
                                            {String(comment.author?.id) === String(user?.id) && (
                                              <>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  aria-label="Edit comment"
                                                  onClick={() => {
                                                    const newContent = prompt("Edit your comment:", comment.content);
                                                    if (newContent && newContent.trim()) {
                                                      setPosts(posts.map(p => {
                                                        if (p.id === post.id) {
                                                          return { ...p, comments: (Array.isArray(p.comments) ? p.comments : []).map(c => c.id === comment.id ? { ...c, content: newContent.trim() } : c) };
                                                        }
                                                        return p;
                                                      }));
                                                      toast({ title: "Comment updated", description: "Your comment has been updated successfully" });
                                                    }
                                                  }}
                                                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                                                  disabled={loadingPosts || commentActionLoading === post.id}
                                                >
                                                  <Edit3 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  aria-label="Delete comment"
                                                  onClick={() => setDeleteCommentDialog(comment.id)}
                                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                                  disabled={loadingPosts || deleteCommentLoading === comment.id}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                                {/* Confirmation Dialog */}
                                                {deleteCommentDialog === comment.id && (
                                                  <Dialog open onOpenChange={() => setDeleteCommentDialog(null)}>
                                                    <DialogContent className="bg-slate-900 border-slate-700">
                                                      <DialogHeader>
                                                        <DialogTitle className="text-white">Delete Comment</DialogTitle>
                                                        <DialogDescription className="text-slate-300">Are you sure you want to delete this comment? This action cannot be undone.</DialogDescription>
                                                      </DialogHeader>
                                                      <DialogFooter>
                                                        <Button variant="outline" onClick={() => setDeleteCommentDialog(null)} disabled={deleteCommentLoading === comment.id} className="border-slate-600 text-white hover:bg-slate-800">Cancel</Button>
                                                        <Button
                                                          variant="destructive"
                                                          onClick={async () => {
                                                            setDeleteCommentLoading(comment.id);
                                                            try {
                                                              const API_URL = import.meta.env.VITE_API_URL;
                                                              const token = localStorage.getItem('authToken');
                                                              await axios.delete(`${API_URL}/api/community/replies/${comment.id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                              toast({ title: "Comment deleted", description: "Your comment has been deleted successfully" });
                                                              setDeleteCommentDialog(null);
                                                              fetchPosts();
                                                            } catch (err) {
                                                              toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
                                                            } finally {
                                                              setDeleteCommentLoading(null);
                                                            }
                                                          }}
                                                          disabled={deleteCommentLoading === comment.id}
                                                          className="bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                          Delete
                                                        </Button>
                                                      </DialogFooter>
                                                    </DialogContent>
                                                  </Dialog>
                                                )}
                                              </>
                                            )}
                                          </div>
                                          <p className="text-sm text-slate-300">{comment.content}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback>{user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 flex gap-2">
                                      <Input
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddComment(post.id);
                                          }
                                        }}
                                        disabled={loadingPosts || commentActionLoading === post.id}
                                      />
                                      <Button size="sm" onClick={() => handleAddComment(post.id)} disabled={loadingPosts || commentActionLoading === post.id || !newComment.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Send className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Context Menu */}
                {contextMenu.visible && (
                  <div
                    ref={contextMenuRef}
                    className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl backdrop-blur-sm"
                    style={{
                      left: contextMenu.x,
                      top: contextMenu.y,
                      minWidth: '200px'
                    }}
                  >
                    <div className="py-1">
                      {contextMenu.postId && !contextMenu.commentId && (
                        <>
                          <button
                            onClick={() => {
                              const post = posts.find(p => p.id === contextMenu.postId);
                              if (post) handleCopyPost(post);
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Post
                          </button>
                          <button
                            onClick={() => handleLikePost(contextMenu.postId!)}
                            className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Heart className="h-4 w-4" />
                            {posts.find(p => p.id === contextMenu.postId)?.isLiked ? 'Unlike' : 'Like'}
                          </button>
                          {isUserPost(posts.find(p => p.id === contextMenu.postId)!) && (
                            <>
                              <button
                                onClick={() => {
                                  const post = posts.find(p => p.id === contextMenu.postId);
                                  if (post) setEditingPost(post.id);
                                  handleContextMenuClose();
                                }}
                                className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit Post
                              </button>
                              <button
                                onClick={() => {
                                  setDeletePostDialog(contextMenu.postId);
                                  handleContextMenuClose();
                                }}
                                className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Post
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handlePinPost(contextMenu.postId!)}
                            className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Pin className="h-4 w-4" />
                            {posts.find(p => p.id === contextMenu.postId)?.isPinned ? 'Unpin' : 'Pin'} Post
                          </button>
                          <button
                            onClick={() => handleReportPost(contextMenu.postId!)}
                            className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Flag className="h-4 w-4" />
                            Report Post
                          </button>
                        </>
                      )}
                      {contextMenu.commentId && (
                        <>
                          <button
                            onClick={() => {
                              const post = posts.find(p => p.id === contextMenu.postId);
                              const comment = post?.comments?.find(c => c.id === contextMenu.commentId);
                              if (comment) {
                                const textToCopy = comment.content;
                                navigator.clipboard.writeText(textToCopy);
                                toast({ title: "Copied", description: "Comment copied to clipboard" });
                              }
                              handleContextMenuClose();
                            }}
                            className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Comment
                          </button>
                          {contextMenu.postId && contextMenu.commentId && (
                            (() => {
                              const post = posts.find(p => p.id === contextMenu.postId);
                              const comment = post?.comments?.find(c => c.id === contextMenu.commentId);
                              return isUserComment(comment!) ? (
                                <button
                                  onClick={() => {
                                    setDeleteCommentDialog(contextMenu.commentId);
                                    handleContextMenuClose();
                                  }}
                                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Comment
                                </button>
                              ) : null;
                            })()
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Delete Post Confirmation Dialog */}
                {deletePostDialog && (
                  <Dialog open onOpenChange={() => setDeletePostDialog(null)}>
                    <DialogContent className="bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Delete Post</DialogTitle>
                        <DialogDescription className="text-slate-300">Are you sure you want to delete this post? All comments and likes will also be deleted. This action cannot be undone.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletePostDialog(null)} disabled={deletePostLoading === deletePostDialog} className="border-slate-600 text-white hover:bg-slate-800">Cancel</Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            setDeletePostLoading(deletePostDialog);
                            try {
                              const API_URL = import.meta.env.VITE_API_URL;
                              const token = localStorage.getItem('authToken');
                              await axios.delete(`${API_URL}/api/community/posts/${deletePostDialog}`, { headers: { Authorization: `Bearer ${token}` } });
                              toast({ title: "Post deleted", description: "Your post and all associated comments and likes have been deleted." });
                              setDeletePostDialog(null);
                              fetchPosts();
                            } catch (err) {
                              toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
                            } finally {
                              setDeletePostLoading(null);
                            }
                          }}
                          disabled={deletePostLoading === deletePostDialog}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Delete Comment Confirmation Dialog */}
                {deleteCommentDialog && (
                  <Dialog open onOpenChange={() => setDeleteCommentDialog(null)}>
                    <DialogContent className="bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Delete Comment</DialogTitle>
                        <DialogDescription className="text-slate-300">Are you sure you want to delete this comment? This action cannot be undone.</DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteCommentDialog(null)} disabled={deleteCommentLoading === deleteCommentDialog} className="border-slate-600 text-white hover:bg-slate-800">Cancel</Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            setDeleteCommentLoading(deleteCommentDialog);
                            try {
                              const API_URL = import.meta.env.VITE_API_URL;
                              const token = localStorage.getItem('authToken');
                              await axios.delete(`${API_URL}/api/community/replies/${deleteCommentDialog}`, { headers: { Authorization: `Bearer ${token}` } });
                              toast({ title: "Comment deleted", description: "Your comment has been deleted successfully" });
                              setDeleteCommentDialog(null);
                              fetchPosts();
                            } catch (err) {
                              toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
                            } finally {
                              setDeleteCommentLoading(null);
                            }
                          }}
                          disabled={deleteCommentLoading === deleteCommentDialog}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </TabsContent>

              {/* Study Groups Tab */}
              <TabsContent value="groups" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search study groups..."
                      className="w-full glassmorphism border-slate-500/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                  
                  <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg border-2 border-green-500 z-10 relative">
                        <Plus className="h-4 w-4" />
                        Create Group
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New Study Group</DialogTitle>
                        <DialogDescription className="text-slate-300">
                          Start a study group to collaborate with other students
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="groupName" className="text-white">Group Name</Label>
                          <Input
                            id="groupName"
                            value={newGroup.name}
                            onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                            placeholder="Enter group name..."
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="groupSubject" className="text-white">Subject</Label>
                          <Input
                            id="groupSubject"
                            value={newGroup.subject}
                            onChange={(e) => setNewGroup({...newGroup, subject: e.target.value})}
                            placeholder="e.g. Mathematics, Physics"
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="groupLevel" className="text-white">Level</Label>
                          <Select value={newGroup.level} onValueChange={(value) => setNewGroup({...newGroup, level: value})}>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="Beginner" className="text-white hover:bg-slate-700">Beginner</SelectItem>
                              <SelectItem value="Intermediate" className="text-white hover:bg-slate-700">Intermediate</SelectItem>
                              <SelectItem value="Advanced" className="text-white hover:bg-slate-700">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="groupSchedule" className="text-white">Schedule</Label>
                          <Input
                            id="groupSchedule"
                            value={newGroup.schedule}
                            onChange={(e) => setNewGroup({...newGroup, schedule: e.target.value})}
                            placeholder="e.g. Tuesdays 7-9 PM EST"
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="groupDescription" className="text-white">Description</Label>
                          <Textarea
                            id="groupDescription"
                            value={newGroup.description}
                            onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                            placeholder="Describe your study group..."
                            rows={3}
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewGroupDialog(false)} className="border-slate-600 text-white hover:bg-slate-800">
                          Cancel
                        </Button>
                        <Button onClick={handleCreateGroup} className="bg-green-600 hover:bg-green-700 text-white">
                          Create Group
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Study Groups List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studyGroups.map((group) => (
                    <Card key={group.id} className="glassmorphism-strong shadow-xl border-slate-500/20 hover:border-slate-400/40 transition-colors bg-slate-900/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg">{group.name}</CardTitle>
                            <CardDescription className="text-slate-300 mt-2">{group.description}</CardDescription>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              group.level === 'Beginner' ? 'border-green-500 text-green-400' :
                              group.level === 'Intermediate' ? 'border-yellow-500 text-yellow-400' :
                              'border-red-500 text-red-400'
                            }`}
                          >
                            {group.level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Subject:</span>
                          <span className="text-white font-medium">{group.subject}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Members:</span>
                          <span className="text-white font-medium">{group.members}/{group.maxMembers}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Schedule:</span>
                          <span className="text-white font-medium">{group.schedule}</span>
                        </div>
                        {group.nextSession && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Next Session:</span>
                            <span className="text-green-400 font-medium">{group.nextSession}</span>
                          </div>
                        )}
                        <Button 
                          onClick={() => handleJoinGroup(group.id)}
                          className={`w-full ${
                            group.isJoined 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {group.isJoined ? 'Leave Group' : 'Join Group'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Top Contributors */}
                  <Card className="glassmorphism-strong shadow-xl border-slate-500/20 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        Top Contributors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {topUsers.map((user, index) => (
                        <div key={user.id} className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-yellow-900' :
                            index === 1 ? 'bg-slate-400 text-slate-900' :
                            index === 2 ? 'bg-orange-500 text-orange-900' :
                            'bg-blue-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-white truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {user.reputation} points
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Most Helpful */}
                  <Card className="glassmorphism-strong shadow-xl border-slate-500/20 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-400" />
                        Most Helpful
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {topUsers.map((user, index) => (
                        <div key={user.id} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-white truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {user.helpfulAnswers} helpful answers
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Most Active */}
                  <Card className="glassmorphism-strong shadow-xl border-slate-500/20 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-400" />
                        Most Active
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {topUsers.map((user, index) => (
                        <div key={user.id} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-white truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {user.postsCount} posts
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}