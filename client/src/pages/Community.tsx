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

  // Sample data - in a real app, this would come from an API
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      title: "Need help with calculus derivatives",
      content: "I'm struggling with understanding the chain rule. Can someone explain it in simple terms?",
      author: { name: "Sarah Chen", reputation: 125 },
      category: "Mathematics",
      tags: ["calculus", "derivatives", "help"],
      timestamp: "2 hours ago",
      likes: 8,
      replies: 12,
      views: 156,
      isLiked: false
    },
    {
      id: "2", 
      title: "Study group for AP Physics - Starting Monday!",
      content: "Looking for serious students to join our AP Physics study group. We meet twice a week.",
      author: { name: "Mike Rodriguez", reputation: 89 },
      category: "Study Groups",
      tags: ["physics", "AP", "study-group"],
      timestamp: "4 hours ago",
      likes: 15,
      replies: 8,
      views: 234,
      isPinned: true,
      isLiked: true
    },
    {
      id: "3",
      title: "Best strategies for SAT reading comprehension?",
      content: "I'm consistently scoring low on reading comp. What techniques have worked for you?",
      author: { name: "Emma Thompson", reputation: 67 },
      category: "Test Prep", 
      tags: ["SAT", "reading", "strategy"],
      timestamp: "6 hours ago",
      likes: 23,
      replies: 18,
      views: 445,
      isLiked: false
    }
  ]);

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
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLikePost = (postId: string) => {
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

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: { 
        name: user?.firstName + " " + user?.lastName || "Anonymous",
        reputation: 0 
      },
      category: newPost.category,
      tags: newPost.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      timestamp: "Just now",
      likes: 0,
      replies: 0,
      views: 1,
      isLiked: false
    };

    setPosts([post, ...posts]);
    setNewPost({ title: "", content: "", category: "", tags: "" });
    setShowNewPostDialog(false);
    
    toast({
      title: "Post created",
      description: "Your post has been published successfully"
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
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                              {post.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            
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
                                <span>by {post.author.name}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikePost(post.id)}
                                  className={`flex items-center gap-1 ${post.isLiked ? 'text-red-500' : ''}`}
                                >
                                  <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
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
              </TabsContent>

              {/* Study Groups Tab */}
              <TabsContent value="groups" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Study Groups
                  </h2>
                  <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Group
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
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
                          <Label htmlFor="groupSubject">Subject</Label>
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
                          <Label htmlFor="groupLevel">Level</Label>
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
                          <Label htmlFor="groupDescription">Description</Label>
                          <Textarea
                            id="groupDescription"
                            value={newGroup.description}
                            onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                            placeholder="Describe your study group..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="groupSchedule">Schedule</Label>
                          <Input
                            id="groupSchedule"
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
                        <Button onClick={handleCreateGroup}>
                          Create Group
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-6">
                  {studyGroups.map((group) => (
                    <Card key={group.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {group.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">
                              {group.description}
                            </p>
                          </div>
                          <Badge 
                            className={
                              group.level === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              group.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }
                          >
                            {group.level}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{group.subject}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {group.members}/{group.maxMembers} members
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{group.schedule}</span>
                          </div>
                        </div>
                        
                        {group.nextSession && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Next session: {group.nextSession}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-4">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(group.members / group.maxMembers) * 100}%` }}
                            />
                          </div>
                          <Button
                            onClick={() => handleJoinGroup(group.id)}
                            variant={group.isJoined ? "outline" : "default"}
                            className={group.isJoined ? "text-red-600 border-red-600" : ""}
                          >
                            {group.isJoined ? "Leave Group" : "Join Group"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard" className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Community Leaderboard
                </h2>
                
                <div className="space-y-4">
                  {topUsers.map((user, index) => (
                    <Card key={user.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-400' :
                            'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Member since {user.joinDate}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.badges.map(badge => (
                                <Badge key={badge} variant="secondary" className="text-xs">
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {user.reputation}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              reputation points
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}