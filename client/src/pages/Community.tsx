import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, Trophy, TrendingUp, Plus, Search, Filter, Clock, Heart, Share2, BookOpen, Star, Calendar, ThumbsUp, MessageCircle, Eye, Pin } from "lucide-react";
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
import React, { useEffect, Suspense } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
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
  attachments?: string[];
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
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error('Community error:', error, info); }
  render() { if (this.state.hasError) return <div className="text-red-500 text-center py-8">Something went wrong in Community.</div>; return this.props.children; }
}

export default function Community() {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("forums");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  
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

  // State for managing posts, groups, and top users fetched from backend
  const [posts, setPosts] = useState<Post[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCommunityLoading, setIsCommunityLoading] = useState(true);
  const [communityError, setCommunityError] = useState<string | null>(null);

  // Add state for post attachments
  const [postAttachments, setPostAttachments] = useState<string[]>([]);

  const categories = ["all", "Mathematics", "Science", "Test Prep", "Study Groups", "General"];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Fetch posts, groups, and top users from backend on mount
  const fetchData = async () => {
    setIsCommunityLoading(true);
    setCommunityError(null);
    try {
      const [postsRes, groupsRes, usersRes] = await Promise.all([
        fetch("/api/community-posts").then(res => res.json()),
        fetch("/api/community-groups").then(res => res.json()),
        fetch("/api/users?sort=reputation&limit=5").then(res => res.json())
      ]);
      // When setting posts from backend, always use safePost
      setPosts(postsRes.map(safePost));
      setStudyGroups(groupsRes);
      setTopUsers(usersRes);
    } catch (err) {
      setCommunityError("Failed to fetch community data. Please try again later.");
      setPosts([]);
      setStudyGroups([]);
      setTopUsers([]);
    } finally {
      setIsCommunityLoading(false);
    }
  };

  // Fetch data on component mount and when search/category changes
  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedCategory]);

  // Handle like post (optimistic update)
  const handleLikePost = async (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));

    try {
      await fetch(`/api/community-posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
      });
      toast({
        title: "Post liked",
        description: "Your like has been saved."
      });
    } catch (err) {
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes + 1 : post.likes - 1,
            isLiked: !post.isLiked
          };
        }
        return post;
      }));
      toast({
        title: "Error liking post",
        description: "Failed to save like.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  // Handle join group (optimistic update)
  const handleJoinGroup = async (groupId: string) => {
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
    
    try {
      await fetch(`/api/study-groups/${groupId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
      });
      toast({
        title: wasJoined ? "Left study group" : "Joined study group",
        description: wasJoined ? "You have left the study group" : "You've successfully joined the study group",
      });
    } catch (err) {
      setStudyGroups(studyGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.isJoined ? group.members + 1 : group.members - 1,
            isJoined: !group.isJoined
          };
        }
        return group;
      }));
      toast({
        title: wasJoined ? "Error leaving group" : "Error joining group",
        description: "Failed to update group membership.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  // Handle create post (optimistic update)
  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // When creating a new post, always use safePost
    const post: Post = safePost({
      ...newPost,
      author: safeAuthor({
        name: (user?.firstName || "") + " " + (user?.lastName || "") || "Anonymous",
        avatar: user?.avatar || '',
        reputation: 0,
      }),
      tags: newPost.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      attachments: postAttachments,
    });

    setPosts([post, ...posts]); // Optimistic update
    setNewPost({ title: "", content: "", category: "", tags: "" });
    setPostAttachments([]); // Clear attachments after creation
    setShowNewPostDialog(false);
    
    try {
      const response = await fetch(`/api/community-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          tags: newPost.tags.split(",").map(tag => tag.trim()).filter(Boolean),
          attachments: postAttachments // Include attachments in backend request
        })
      });
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      // When updating posts after creating a post, always use safePost
      const createdPost = await response.json();
      setPosts(prev => [safePost(createdPost), ...prev]); // Update with actual data from backend
      toast({
        title: "Post created",
        description: "Your post has been published successfully"
      });
    } catch (err) {
      setPosts(posts.map(p => p.id === post.id ? post : p)); // Revert optimistic update on error
      toast({
        title: "Error creating post",
        description: "Failed to save post to backend.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  // Handle create group (optimistic update)
  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.description || !newGroup.subject || !newGroup.level) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const group: StudyGroup = {
      id: Date.now().toString(), // This will be replaced by backend
      name: newGroup.name,
      description: newGroup.description,
      subject: newGroup.subject,
      members: 1, // This will be replaced by backend
      maxMembers: newGroup.maxMembers,
      level: newGroup.level as 'Beginner' | 'Intermediate' | 'Advanced',
      schedule: newGroup.schedule,
      isJoined: true
    };

    setStudyGroups([group, ...studyGroups]); // Optimistic update
    setNewGroup({ name: "", description: "", subject: "", level: "", schedule: "", maxMembers: 10 });
    setShowNewGroupDialog(false);
    
    try {
      const response = await fetch(`/api/community-groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newGroup.name,
          description: newGroup.description,
          subject: newGroup.subject,
          level: newGroup.level,
          schedule: newGroup.schedule,
          maxMembers: newGroup.maxMembers
        })
      });
      if (!response.ok) {
        throw new Error("Failed to create group");
      }
      const createdGroup = await response.json();
      setStudyGroups(prev => [createdGroup, ...prev]); // Update with actual data from backend
      toast({
        title: "Study group created",
        description: "Your study group has been created successfully"
      });
    } catch (err) {
      setStudyGroups(studyGroups.map(g => g.id === group.id ? group : g)); // Revert optimistic update on error
      toast({
        title: "Error creating group",
        description: "Failed to save group to backend.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  // Defensive helpers
  const safeSplit = (val: string | undefined, sep = ' ') => (typeof val === 'string' ? val.split(sep) : []);
  const safeArray = <T,>(val: T[] | undefined): T[] => Array.isArray(val) ? val : [];
  const safeAuthor = (author: any = {}) => ({
    name: author.name || 'Anonymous',
    avatar: author.avatar || '',
    reputation: typeof author.reputation === 'number' ? author.reputation : 0,
  });
  const safePost = (post: any = {}): Post => ({
    id: post.id?.toString() || Date.now().toString(),
    title: post.title || 'Untitled',
    content: post.content || '',
    author: safeAuthor(post.author),
    category: post.category || 'General',
    tags: safeArray(post.tags),
    timestamp: post.timestamp || 'Just now',
    likes: typeof post.likes === 'number' ? post.likes : 0,
    replies: typeof post.replies === 'number' ? post.replies : 0,
    views: typeof post.views === 'number' ? post.views : 0,
    isPinned: !!post.isPinned,
    isLiked: !!post.isLiked,
    attachments: safeArray(post.attachments),
  });

  if (isCommunityLoading) {
    return (
      <main className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <SkeletonLoader className="mx-auto mb-4 w-1/2 h-10" lines={1} />
            <SkeletonLoader className="mx-auto mb-2 w-1/3 h-6" lines={1} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <SkeletonLoader key={i} className="h-24 rounded-lg" lines={1} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar skeleton */}
            <div className="lg:col-span-1 space-y-4">
              <SkeletonLoader className="h-10 w-2/3 mb-2" lines={1} />
              {[...Array(5)].map((_, i) => (
                <SkeletonLoader key={i} className="h-12 rounded-lg" lines={1} />
              ))}
            </div>
            {/* Main content skeleton */}
            <div className="lg:col-span-3 space-y-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonLoader key={i} className="h-32 rounded-xl" lines={3} />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Learning Community
          </h1>
          <p className="text-muted-foreground">
            Connect, learn, and grow together with fellow students
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-foreground">2,847</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-foreground">1,234</div>
              <div className="text-sm text-muted-foreground">Discussions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-foreground">456</div>
              <div className="text-sm text-muted-foreground">Study Groups</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-foreground">89%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Top Contributors */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{safeSplit(user.name || 'A').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
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
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="forums">Forums</TabsTrigger>
                <TabsTrigger value="groups">Study Groups</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>

              {/* Forums Tab */}
              <TabsContent value="forums" className="space-y-6">
                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48">
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
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
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
                        <div>
                          <Label htmlFor="attachments">Attachments (optional)</Label>
                          <UploadButton
                            endpoint="communityPostAttachment"
                            onClientUploadComplete={(res: Array<{ url: string }>) => {
                              if (res && res[0]) {
                                setPostAttachments((prev) => [...prev, res[0].url]);
                              }
                            }}
                            onUploadError={(err: { message: string }) => {
                              toast({
                                title: "Upload Failed",
                                description: err.message,
                                variant: "destructive",
                              });
                            }}
                            onUploadBegin={() => {
                              toast({
                                title: "Uploading...",
                                description: "Your file is being uploaded.",
                              });
                            }}
                            className="w-full"
                            appearance={{
                              button: 'w-full bg-muted hover:bg-muted/80 text-foreground',
                              allowedContent: 'hidden',
                            }}
                          />
                          {postAttachments.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Uploaded Attachments:
                              </h4>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                {postAttachments.map((url, index) => (
                                  <li key={index}>
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                                      {url}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreatePost}>
                          Create Post
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Posts List */}
                {isCommunityLoading ? (
                  <SkeletonLoader lines={6} />
                ) : communityError ? (
                  <div className="text-red-500 text-center py-8">{communityError}</div>
                ) : (
                <div className="space-y-4">
                    {filteredPosts.map((post) => (
                    <Card key={post.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                              <AvatarImage src={safeAuthor(post.author).avatar} />
                              <AvatarFallback>{safeSplit(safeAuthor(post.author).name).map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {post.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {post.title}
                              </h3>
                              <Badge variant="outline">{post.category}</Badge>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                              {post.content}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                                {safeArray(post.tags).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                              
                              {post.attachments && post.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge variant="secondary" className="text-xs">
                                    Attachments:
                                  </Badge>
                                  {safeArray(post.attachments).map((url, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                                        {url}
                                      </a>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {post.timestamp}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.views}
                                </span>
                                  <span>by {safeAuthor(post.author).name}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikePost(post.id)}
                                  className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : ''}`}
                                >
                                    <Heart className={post.isLiked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                                    {post.likes}
                                </Button>
                                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {post.replies}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )}
              </TabsContent>

              {/* Study Groups Tab */}
              <TabsContent value="groups" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search study groups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48">
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
                </div>

                {isCommunityLoading ? (
                  <SkeletonLoader lines={6} />
                ) : communityError ? (
                  <div className="text-red-500 text-center py-8">{communityError}</div>
                ) : (
                <div className="space-y-4">
                    {filteredPosts.map((post) => (
                    <Card key={post.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                              <AvatarImage src={safeAuthor(post.author).avatar} />
                              <AvatarFallback>{safeSplit(safeAuthor(post.author).name).map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {post.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {post.title}
                              </h3>
                              <Badge variant="outline">{post.category}</Badge>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                              {post.content}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                                {safeArray(post.tags).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                              
                              {post.attachments && post.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge variant="secondary" className="text-xs">
                                    Attachments:
                                  </Badge>
                                  {safeArray(post.attachments).map((url, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                                        {url}
                                      </a>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {post.timestamp}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.views}
                                </span>
                                  <span>by {safeAuthor(post.author).name}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikePost(post.id)}
                                  className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : ''}`}
                                >
                                    <Heart className={post.isLiked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                                    {post.likes}
                                </Button>
                                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {post.replies}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )}
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Top Contributors
                </h2>
                {isCommunityLoading ? (
                  <SkeletonLoader lines={5} />
                ) : communityError ? (
                  <div className="text-red-500 text-center py-8">{communityError}</div>
                ) : (
                <div className="space-y-4">
                    {topUsers.map((user, index) => (
                    <Card key={user.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{safeSplit(user.name || 'A').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-lg text-gray-900 dark:text-white truncate">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.reputation} points
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}