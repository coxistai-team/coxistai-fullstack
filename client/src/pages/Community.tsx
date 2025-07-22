"use client"
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, Users, Trophy, TrendingUp, Plus, Search, Filter, Clock, 
  Heart, Share2, BookOpen, Star, Calendar, ThumbsUp, MessageCircle, Eye, 
  Pin, Edit3, Trash2, Send 
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
import { UploadButton } from "@/lib/uploadthing";
import { SkeletonLoader } from "@/components/ui/page-loader";
import React from "react";

interface Author {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
    avatar?: string;
}

interface Reply {
  id: number;
  content: string;
  author: Author;
  createdAt: string;
}

interface Like {
  id: number;
  user_id: number;
  post_id: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: Author;
  category: string;
  tags: string[];
  createdAt: string;
  replies: Reply[];
  likes: Like[];
  likesCount: number;
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

// ErrorBoundary for Community
class CommunityErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: any, info: any) {
    console.error('Community error:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-center py-8">
          Something went wrong in Community.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Community() {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("forums");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showCommentsFor, setShowCommentsFor] = useState<number | null>(null);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [isDeletingPostId, setIsDeletingPostId] = useState<number | null>(null);
  const [isLikingPostId, setIsLikingPostId] = useState<number | null>(null);
  const [isAddingCommentId, setIsAddingCommentId] = useState<number | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/community/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch community posts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);


  // Sample data - in a real app, this would come from an API
  // const [posts, setPosts] = useState<Post[]>([]);

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

  const categories = ["all", "Mathematics", "Science", "Test Prep", "Study Groups", "General"];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.tags.includes(selectedCategory); // Assuming tags are categories for now
    return matchesSearch && matchesCategory;
  });

  const handleLikePost = async (postId: number) => {
    if (!user) {
      toast({ title: "Please log in to like posts.", variant: "destructive" });
      return;
    }
    setIsLikingPostId(postId);
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const { liked, likesCount } = await response.json();
      setPosts(posts.map(p => p.id === postId ? { ...p, likesCount, likes: liked ? [...p.likes, { id: Date.now(), user_id: user.id, post_id: postId }] : p.likes.filter(l => l.user_id !== user.id) } : p));

    } catch (error) {
      toast({ title: "Error", description: "Failed to update like status.", variant: "destructive" });
    } finally {
      setIsLikingPostId(null);
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

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setIsCreatingPost(true);
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          tags: newPost.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      fetchPosts();
      setShowNewPostDialog(false);
      setNewPost({ title: "", content: "", category: "", tags: "" });
      toast({
        title: "Post created",
        description: "Your post has been published successfully"
      });
    } catch (error) {
      toast({
        title: "Error creating post",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPost(false);
    }
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

  const handleDeletePost = async (postId: number) => {
    setIsDeletingPostId(postId);
    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Failed to delete post.");
      }
      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "You are not authorized to delete this post.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingPostId(null);
    }
  };

  const handleEditPost = async () => {
    if (!editingPost) return;
    setIsEditingPost(true);
    try {
      const response = await fetch(`/api/community/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editingPost.title,
          content: editingPost.content,
          category: editingPost.category,
          tags: editingPost.tags,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update post");
      }
      await fetchPosts();
    setEditingPost(null);
    toast({
      title: "Post updated",
        description: "Your post has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update the post.",
        variant: "destructive"
      });
    } finally {
      setIsEditingPost(false);
    }
  };


  const handleAddComment = async (postId: number) => {
    if (!newComment.trim() || !user) return;
    setIsAddingCommentId(postId);
    try {
      const response = await fetch(`/api/community/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment })
      });
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      const newReply = await response.json();
      setPosts(posts.map(p => p.id === postId ? { ...p, replies: [...p.replies, newReply] } : p));
    setNewComment("");
    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully"
    });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingCommentId(null);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    try {
      const response = await fetch(`/api/community/replies/${replyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Failed to delete reply.");
      }
      fetchPosts();
      toast({
        title: "Reply deleted",
        description: "The reply has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "You are not authorized to delete this reply.",
        variant: "destructive"
      });
    }
  }

  const isUserPost = (post: Post) => {
    return post.author.id === user?.id;
  };

  const isUserReply = (reply: Reply) => {
    return reply.author.id === user?.id;
  }

  // Helper to get display name
  const getDisplayName = (author: Author) => {
    const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim();
    return fullName || author.username;
  };

  return (
    <CommunityErrorBoundary>
      <Suspense fallback={<SkeletonLoader lines={10} />}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
              className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Learning Community</h1>
              <p className="text-slate-600 dark:text-slate-400">Connect, learn, and grow together with fellow students</p>
        </motion.div>

        {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
            <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">2,847</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Active Members</div>
            </CardContent>
          </Card>
              <Card>
            <CardContent className="p-4 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">1,234</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Discussions</div>
            </CardContent>
          </Card>
              <Card>
            <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">456</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Study Groups</div>
            </CardContent>
          </Card>
              <Card>
            <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">89%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
            </CardContent>
          </Card>
            </div>

        {/* Main Content */}
            <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Top Contributors */}
              <div className="lg:col-span-1">
                <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-semibold">
                      {index + 1}
                    </div>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">{user.reputation} points</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
              </div>

          {/* Main Content Area */}
              <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="forums">Forums</TabsTrigger>
                <TabsTrigger value="groups">Study Groups</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>

              {/* Forums Tab */}
              <TabsContent value="forums" className="space-y-6">
                {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
                    <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                        New Post
                      </Button>
                    </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Post</DialogTitle>
                        <DialogDescription>
                          Share your question or start a discussion
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newPost.title}
                            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                            placeholder="Enter post title..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.slice(1).map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            value={newPost.content}
                            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                            placeholder="Write your post content..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tags">Tags (comma separated)</Label>
                          <Input
                            id="tags"
                            value={newPost.tags}
                            onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                            placeholder="e.g. math, calculus, help"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreatePost} disabled={isCreatingPost}>
                              {isCreatingPost ? 'Creating...' : 'Create Post'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                      {isLoading ? <SkeletonLoader lines={5} /> : filteredPosts.map((post) => (
                        <Card key={post.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                              <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{post.title}</h3>
                              
                              {/* Edit and Delete buttons for user's own posts */}
                              {isUserPost(post) && (
                                    <div className="flex items-center gap-2 ml-auto">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingPost(post)}
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeletePost(post.id)}
                                        className="text-red-500 hover:text-red-700"
                                        disabled={isDeletingPostId === post.id}
                                      >
                                        {isDeletingPostId === post.id ? 'Deleting...' : <Trash2 className="w-4 h-4" />}
                                      </Button>
                                </div>
                              )}
                            </div>
                            
                                <p className="text-slate-700 dark:text-slate-300">{post.content}</p>
                                
                                <div className="flex flex-wrap gap-2">
                                  {post.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                              
                                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                  <div className="flex items-center gap-4">
                                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                                <span className="flex items-center gap-1">
                                      <MessageSquare className="w-4 h-4" />
                                      {post.replies.length}
                                </span>
                                    <span>by {getDisplayName(post.author)}</span>
                              </div>
                              
                                  <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikePost(post.id)}
                                      className={`flex items-center gap-1 ${post.likes.some(l => l.user_id === user?.id) ? 'text-red-500' : ''}`}
                                      disabled={isLikingPostId === post.id}
                                >
                                      {isLikingPostId === post.id ? '...' : <Heart className="w-4 h-4" />}
                                      {post.likesCount}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setShowCommentsFor(showCommentsFor === post.id ? null : post.id)}
                                >
                                      <MessageCircle className="w-4 h-4" />
                                      {post.replies.length}
                                </Button>
                              </div>
                            </div>

                            {/* Comments Section */}
                            {showCommentsFor === post.id && (
                                  <div className="mt-4 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <h4 className="font-medium text-slate-900 dark:text-white">
                                      Comments ({post.replies?.length || 0})
                                </h4>
                                
                                {/* Existing Comments */}
                                    {post.replies?.map((reply) => (
                                      <div key={reply.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                      <Avatar className="w-8 h-8">
                                          <AvatarFallback className="text-xs">
                                            {reply.author.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                              {getDisplayName(reply.author)}
                                            </span>
                                            <span className="text-xs text-slate-500">{new Date(reply.createdAt).toLocaleString()}</span>
                                            {(isUserReply(reply) || isUserPost(post)) && (
                                            <Button
                                              size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteReply(reply.id)}
                                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                          )}
                                        </div>
                                          <p className="text-sm text-slate-700 dark:text-slate-300">{reply.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                
                                {/* Add Comment */}
                                <div className="flex items-start gap-3">
                                  <Avatar className="w-8 h-8">
                                        <AvatarFallback className="text-xs">
                                      {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 flex gap-2">
                                        <Textarea
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                          placeholder="Add a comment..."
                                      className="flex-1"
                                          rows={2}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleAddComment(post.id);
                                        }
                                      }}
                                    />
                                    <Button
                                      onClick={() => handleAddComment(post.id)}
                                          disabled={isAddingCommentId === post.id || !newComment.trim()}
                                          size="sm"
                                    >
                                          {isAddingCommentId === post.id ? '...' : <Send className="w-4 h-4" />}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Study Groups Tab */}
              <TabsContent value="groups" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Study Groups</h2>
                      <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Group
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Create Study Group</DialogTitle>
                            <DialogDescription>
                              Start a new study group for collaborative learning
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="groupName">Group Name</Label>
                    <Input
                                id="groupName"
                                value={newGroup.name}
                                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                                placeholder="Enter group name..."
                    />
                  </div>
                            <div>
                              <Label htmlFor="subject">Subject</Label>
                              <Select value={newGroup.subject} onValueChange={(value) => setNewGroup({...newGroup, subject: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                                  <SelectItem value="Science">Science</SelectItem>
                                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                                  <SelectItem value="Physics">Physics</SelectItem>
                                  <SelectItem value="Biology">Biology</SelectItem>
                                  <SelectItem value="Test Prep">Test Prep</SelectItem>
                                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                            <div>
                              <Label htmlFor="level">Level</Label>
                              <Select value={newGroup.level} onValueChange={(value) => setNewGroup({...newGroup, level: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Beginner">Beginner</SelectItem>
                                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                                  <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={newGroup.description}
                                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                                placeholder="Describe your study group..."
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label htmlFor="schedule">Schedule</Label>
                              <Input
                                id="schedule"
                                value={newGroup.schedule}
                                onChange={(e) => setNewGroup({...newGroup, schedule: e.target.value})}
                                placeholder="e.g. Mondays & Wednesdays 7-9 PM EST"
                              />
                            </div>
                            <div>
                              <Label htmlFor="maxMembers">Max Members</Label>
                              <Input
                                id="maxMembers"
                                type="number"
                                value={newGroup.maxMembers}
                                onChange={(e) => setNewGroup({...newGroup, maxMembers: parseInt(e.target.value) || 10})}
                                min="2"
                                max="50"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowNewGroupDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateGroup}>Create Group</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                            </div>
                              
                    <div className="grid md:grid-cols-2 gap-6">
                      {studyGroups.map((group) => (
                        <Card key={group.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <CardDescription>{group.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <Badge>{group.level}</Badge>
                              <Badge variant="outline">{group.subject}</Badge>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              <div>{group.members}/{group.maxMembers} members</div>
                              <div>{group.schedule}</div>
                              {group.nextSession && (
                                <div className="text-green-600 dark:text-green-400 font-medium">
                                  Next session: {group.nextSession}
                                </div>
                              )}
                              </div>
                                <Button
                              onClick={() => handleJoinGroup(group.id)}
                              variant={group.isJoined ? "outline" : "default"}
                              className={group.isJoined ? "text-red-600 border-red-600" : ""}
                                  size="sm"
                                >
                              {group.isJoined ? "Leave Group" : "Join Group"}
                                </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Community Leaderboard</h2>
                <div className="space-y-4">
                    {topUsers.map((user, index) => (
                        <Card key={user.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full text-xl font-bold">
                            {index + 1}
                          </div>
                              <Avatar className="w-16 h-16">
                                <AvatarFallback className="text-lg">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                          </Avatar>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                                <p className="text-slate-600 dark:text-slate-400">Member since {user.joinDate}</p>
                                <div className="flex gap-2 mt-2">
                                  {user.badges.map(badge => (
                                    <Badge key={badge} variant="secondary" className="text-xs">
                                      {badge}
                                    </Badge>
                                  ))}
                            </div>
                            </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                  {user.reputation}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">reputation points</div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {user.postsCount} posts • {user.helpfulAnswers} helpful answers
                                </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
        </div>
      </Suspense>
      <Dialog open={!!editingPost} onOpenChange={(isOpen) => !isOpen && setEditingPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editingPost?.title || ""}
                onChange={(e) => editingPost && setEditingPost({ ...editingPost, title: e.target.value })}
                placeholder="Enter post title..."
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editingPost?.category || ""}
                onValueChange={(value) => editingPost && setEditingPost({ ...editingPost, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editingPost?.content || ""}
                onChange={(e) => editingPost && setEditingPost({ ...editingPost, content: e.target.value })}
                placeholder="Write your post content..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma separated)</Label>
              <Input
                id="edit-tags"
                value={editingPost?.tags.join(", ") || ""}
                onChange={(e) => editingPost && setEditingPost({ ...editingPost, tags: e.target.value.split(",").map(t => t.trim()) })}
                placeholder="e.g. math, calculus, help"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditPost} disabled={isEditingPost}>
              {isEditingPost ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CommunityErrorBoundary>
  );
}
