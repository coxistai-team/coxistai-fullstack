import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  Sparkles, 
  Image as ImageIcon, 
  BarChart, 
  Lightbulb,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  Palette,
  FileText,
  Presentation,
  Wand2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Minimize2
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  backgroundStyle: string;
  backgroundGradient: string;
  images: string[];
  bulletPoints: string[];
}

interface ChartData {
  type: string;
  title: string;
  data: any[];
}

const AIPresentations = () => {
  const { toast } = useToast();
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "1",
      title: "The Solar System",
      subtitle: "An Introduction to Our Cosmic Neighborhood",
      content: "Explore the wonders of our solar system, from the blazing Sun to the distant planets and their fascinating characteristics.",
      backgroundStyle: "solid",
      backgroundGradient: "bg-white text-gray-900",
      images: [],
      bulletPoints: [
        "Eight planets orbit our Sun",
        "Diverse environments across the system",
        "Ongoing exploration and discovery"
      ]
    }
  ]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateTopic, setGenerateTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedChart, setSelectedChart] = useState("");
  const [newBulletPoint, setNewBulletPoint] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSlide = slides[currentSlideIndex];

  const backgroundStyles = [
    { name: "Purple Gradient", value: "from-purple-600 via-blue-600 to-indigo-700", type: "gradient" },
    { name: "Ocean Gradient", value: "from-blue-500 via-teal-500 to-cyan-600", type: "gradient" },
    { name: "Sunset Gradient", value: "from-orange-500 via-red-500 to-pink-600", type: "gradient" },
    { name: "Forest Gradient", value: "from-green-500 via-emerald-500 to-teal-600", type: "gradient" },
    { name: "Fire Gradient", value: "from-red-600 via-orange-500 to-yellow-500", type: "gradient" },
    { name: "Night Gradient", value: "from-gray-900 via-purple-900 to-violet-800", type: "gradient" },
    { name: "Aurora Gradient", value: "from-green-400 via-blue-500 to-purple-600", type: "gradient" },
    { name: "Space Gradient", value: "from-black via-purple-900 to-blue-900", type: "gradient" },
    { name: "Minimal White", value: "bg-white text-gray-900", type: "solid" },
    { name: "Professional Blue", value: "bg-blue-900 text-white", type: "solid" },
    { name: "Dark Mode", value: "bg-gray-900 text-white", type: "solid" },
    { name: "Clean Gray", value: "bg-gray-100 text-gray-900", type: "solid" }
  ];

  const chartTypes = [
    { id: "bar", name: "Bar Chart", icon: BarChart, description: "Compare data across categories" },
    { id: "line", name: "Line Chart", icon: BarChart, description: "Show trends over time" },
    { id: "pie", name: "Pie Chart", icon: BarChart, description: "Display proportional data" },
    { id: "timeline", name: "Timeline", icon: BarChart, description: "Show events chronologically" }
  ];

  const aiSuggestions = [
    "Add a comparison chart showing key metrics",
    "Include relevant statistics and data points",
    "Generate bullet points for main concepts",
    "Create a timeline of important events",
    "Add visual elements to enhance understanding"
  ];

  // Update slide content
  const updateSlide = (field: keyof Slide, value: string | string[]) => {
    setSlides(prev => prev.map((slide, index) => 
      index === currentSlideIndex ? { ...slide, [field]: value } : slide
    ));
  };

  // Add new slide
  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: "New Slide",
      subtitle: "Subtitle",
      content: "Add your content here...",
      backgroundStyle: "gradient",
      backgroundGradient: "from-purple-600 via-blue-600 to-indigo-700",
      images: [],
      bulletPoints: []
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
    toast({
      title: "Slide Added",
      description: "New slide has been created successfully."
    });
  };

  // Delete slide
  const deleteSlide = (index: number) => {
    if (slides.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You need at least one slide in your presentation.",
        variant: "destructive"
      });
      return;
    }
    setSlides(prev => prev.filter((_, i) => i !== index));
    if (currentSlideIndex >= slides.length - 1) {
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
    toast({
      title: "Slide Deleted",
      description: "Slide has been removed from your presentation."
    });
  };

  // Duplicate slide
  const duplicateSlide = (index: number) => {
    const slideToClone = slides[index];
    const newSlide = { 
      ...slideToClone, 
      id: Date.now().toString(),
      title: slideToClone.title + " (Copy)"
    };
    setSlides(prev => [...prev.slice(0, index + 1), newSlide, ...prev.slice(index + 1)]);
    toast({
      title: "Slide Duplicated",
      description: "Slide has been copied successfully."
    });
  };

  // Generate presentation with AI
  const generatePresentation = async () => {
    if (!generateTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your presentation.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedSlides: Slide[] = Array.from({ length: slideCount }, (_, i) => ({
        id: Date.now().toString() + i,
        title: i === 0 ? generateTopic : `${generateTopic} - Section ${i}`,
        subtitle: i === 0 ? "AI Generated Presentation" : `Key Points and Analysis`,
        content: `This is AI-generated content about ${generateTopic}. The content explores various aspects and provides comprehensive insights.`,
        backgroundStyle: "gradient",
        backgroundGradient: backgroundStyles[i % backgroundStyles.length].value,
        images: [],
        bulletPoints: [
          `Important point about ${generateTopic}`,
          "Supporting evidence and examples",
          "Practical applications and implications"
        ]
      }));

      setSlides(generatedSlides);
      setCurrentSlideIndex(0);
      setIsGenerating(false);
      setShowGenerateDialog(false);
      setGenerateTopic("");
      
      toast({
        title: "Presentation Generated",
        description: `Successfully created ${slideCount} slides about ${generateTopic}.`
      });
    }, 2000);
  };

  // Export presentation
  const exportPresentation = async (format: string) => {
    setShowExportDialog(false);
    setIsDownloading(true);
    
    try {
      if (format === "pdf") {
        // Create PDF content
        const pdfContent = generatePDFContent();
        downloadFile(pdfContent, "presentation.pdf", "application/pdf");
        
        toast({
          title: "PDF Download Complete",
          description: "Your presentation has been downloaded as PDF."
        });
      } else if (format === "pptx") {
        // Create PowerPoint content
        const pptContent = generatePPTContent();
        downloadFile(pptContent, "presentation.pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        
        toast({
          title: "PowerPoint Download Complete", 
          description: "Your presentation has been downloaded as PPTX."
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading your presentation.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate PDF content
  const generatePDFContent = () => {
    const pdfData = slides.map((slide, index) => ({
      page: index + 1,
      title: slide.title,
      subtitle: slide.subtitle,
      content: slide.content,
      bulletPoints: slide.bulletPoints,
      background: slide.backgroundGradient
    }));
    
    return JSON.stringify({
      title: "AI Generated Presentation",
      slides: pdfData,
      createdAt: new Date().toISOString(),
      format: "pdf"
    });
  };

  // Generate PowerPoint content
  const generatePPTContent = () => {
    const pptData = slides.map((slide, index) => ({
      slideNumber: index + 1,
      layout: "title-content",
      title: slide.title,
      subtitle: slide.subtitle,
      content: slide.content,
      bulletPoints: slide.bulletPoints,
      theme: slide.backgroundGradient,
      animations: "fadeIn"
    }));
    
    return JSON.stringify({
      presentation: {
        title: "AI Generated Presentation",
        author: "Coexist AI",
        slides: pptData,
        template: "modern",
        createdAt: new Date().toISOString()
      }
    });
  };

  // Download file helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add image to slide
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSlides(prev => prev.map((slide, index) => 
          index === currentSlideIndex ? { ...slide, images: [...slide.images, imageUrl] } : slide
        ));
        toast({
          title: "Image Added",
          description: "Image has been added to your slide."
        });
      };
      reader.readAsDataURL(file);
    }
    setShowImageDialog(false);
  };

  // Add chart to slide
  const addChart = (chartType: string) => {
    // Simulate adding a chart
    toast({
      title: "Chart Added",
      description: `${chartType} has been added to your slide.`
    });
    setShowChartDialog(false);
  };

  // Add bullet point
  const addBulletPoint = () => {
    if (newBulletPoint.trim()) {
      setSlides(prev => prev.map((slide, index) => 
        index === currentSlideIndex ? { ...slide, bulletPoints: [...slide.bulletPoints, newBulletPoint.trim()] } : slide
      ));
      setNewBulletPoint("");
      toast({
        title: "Bullet Point Added",
        description: "New point has been added to your slide."
      });
    }
  };

  // Remove bullet point
  const removeBulletPoint = (index: number) => {
    setSlides(prev => prev.map((slide, slideIndex) => 
      slideIndex === currentSlideIndex ? { ...slide, bulletPoints: slide.bulletPoints.filter((_, i) => i !== index) } : slide
    ));
  };

  // Change background
  const changeBackground = (backgroundStyle: any) => {
    updateSlide('backgroundGradient', backgroundStyle.value);
    updateSlide('backgroundStyle', backgroundStyle.type);
    setShowBackgroundDialog(false);
    toast({
      title: "Background Updated",
      description: `Applied ${backgroundStyle.name} to your slide.`
    });
  };

  // Enhance with AI
  const enhanceWithAI = () => {
    const enhancedContent = currentSlide.content + " AI has enhanced this content with additional insights, improved structure, and more engaging language to captivate your audience.";
    setSlides(prev => prev.map((slide, index) => 
      index === currentSlideIndex ? { 
        ...slide, 
        content: enhancedContent,
        bulletPoints: [
          ...slide.bulletPoints,
          "AI-generated insight for better understanding",
          "Enhanced visual appeal and engagement"
        ]
      } : slide
    ));
    
    toast({
      title: "Content Enhanced",
      description: "AI has improved your slide content and added new insights."
    });
  };

  // Navigation
  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // Generate AI text for minimize button
  const generateMinimizeText = () => {
    const aiTexts = [
      "AI: Return to Editor",
      "AI: Back to Design",
      "AI: Resume Editing",
      "AI: Exit Fullscreen",
      "AI: Continue Creating"
    ];
    return aiTexts[Math.floor(Math.random() * aiTexts.length)];
  };

  return (
    <main className="relative z-10 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold mb-4 text-slate-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            AI Presentations Studio
          </motion.h1>
          <motion.p 
            className="text-slate-600 dark:text-slate-400 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Create stunning presentations with AI assistance and professional templates
          </motion.p>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <GlassmorphismButton
              onClick={() => setShowExportDialog(true)}
              variant="outline"
              className="px-6 py-3"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </GlassmorphismButton>
            <GlassmorphismButton
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant="outline"
              className="px-6 py-3"
            >
              {isPreviewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPreviewMode ? "Exit Fullscreen" : "Fullscreen Preview"}
            </GlassmorphismButton>
          </div>
        </div>

        {/* Fullscreen Preview Mode */}
        {isPreviewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <div className="absolute top-4 right-4 z-60 flex space-x-3">
              <GlassmorphismButton
                onClick={() => setShowExportDialog(true)}
                variant="outline"
                className="text-white border-white/30 hover:bg-white/20 px-4 py-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </GlassmorphismButton>
              <GlassmorphismButton
                onClick={() => setIsPreviewMode(false)}
                variant="outline" 
                className="text-white border-white/30 hover:bg-white/20 px-4 py-2"
              >
                <Minimize2 className="w-5 h-5 mr-2" />
                <span className="font-medium">{generateMinimizeText()}</span>
              </GlassmorphismButton>
            </div>
            
            <div className="w-full h-full max-w-7xl max-h-4xl flex items-center justify-center p-8">
              <div 
                className={`w-full h-full ${
                  currentSlide.backgroundStyle === 'gradient' 
                    ? `bg-gradient-to-br ${currentSlide.backgroundGradient}` 
                    : currentSlide.backgroundGradient
                } rounded-2xl p-12 text-white flex flex-col justify-center overflow-hidden shadow-2xl`}
              >
                <div className="text-center space-y-8">
                  <h1 className="text-6xl font-bold leading-tight">{currentSlide.title}</h1>
                  <h2 className="text-3xl opacity-90">{currentSlide.subtitle}</h2>
                  
                  {currentSlide.content && (
                    <p className="text-2xl opacity-80 max-w-5xl mx-auto leading-relaxed">
                      {currentSlide.content}
                    </p>
                  )}
                  
                  {currentSlide.bulletPoints.length > 0 && (
                    <div className="space-y-4 text-left max-w-4xl mx-auto">
                      {currentSlide.bulletPoints.map((point, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start space-x-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                        >
                          <div className="w-3 h-3 bg-white rounded-full mt-4 flex-shrink-0"></div>
                          <span className="text-2xl">{point}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {currentSlide.images.length > 0 && (
                    <div className="flex justify-center space-x-6 mt-8">
                      {currentSlide.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Slide image ${index + 1}`}
                          className="max-w-lg max-h-80 object-cover rounded-xl shadow-2xl"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Navigation in fullscreen */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="glassmorphism text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <span className="text-white bg-black/50 px-4 py-2 rounded-lg">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button
                variant="ghost"
                size="lg"
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="glassmorphism text-white hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        )}

        <div className={`grid lg:grid-cols-3 gap-8 ${isPreviewMode ? 'hidden' : ''}`}>
          {/* Slide Preview */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevSlide}
                    disabled={currentSlideIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {currentSlideIndex + 1} / {slides.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <GlassmorphismButton
                    onClick={() => setShowExportDialog(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </GlassmorphismButton>
                </div>
              </div>

              {/* Slide Canvas */}
              <motion.div 
                className={`aspect-video rounded-lg p-8 mb-4 border border-slate-200 dark:border-slate-700 ${
                  currentSlide.backgroundStyle === 'gradient' 
                    ? `bg-gradient-to-br ${currentSlide.backgroundGradient}` 
                    : currentSlide.backgroundGradient
                } flex flex-col justify-center overflow-hidden`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center space-y-6">
                  <h1 className="text-4xl font-bold leading-tight">{currentSlide.title}</h1>
                  <h2 className="text-xl opacity-90">{currentSlide.subtitle}</h2>
                  
                  {currentSlide.content && (
                    <p className="text-lg opacity-80 max-w-3xl mx-auto leading-relaxed">
                      {currentSlide.content}
                    </p>
                  )}
                  
                  {currentSlide.bulletPoints.length > 0 && (
                    <div className="space-y-3 text-left max-w-2xl mx-auto">
                      {currentSlide.bulletPoints.map((point, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                          <span className="text-lg">{point}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {currentSlide.images.length > 0 && (
                    <div className="flex justify-center space-x-4 mt-6">
                      {currentSlide.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Slide image ${index + 1}`}
                          className="max-w-xs max-h-40 object-cover rounded-lg shadow-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Slide Thumbnails */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {slides.map((slide, index) => (
                  <motion.div
                    key={slide.id}
                    className={`relative flex-shrink-0 w-24 h-16 glassmorphism rounded cursor-pointer transition-all group ${
                      currentSlideIndex === index ? 'border-2 border-blue-500' : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setCurrentSlideIndex(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-full h-full rounded ${
                      slide.backgroundStyle === 'gradient' 
                        ? `bg-gradient-to-br ${slide.backgroundGradient}` 
                        : slide.backgroundGradient
                    } flex items-center justify-center relative`}>
                      <span className="text-xs text-white font-bold">{index + 1}</span>
                      
                      {/* Slide actions */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSlide(index);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {slides.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(index);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Add slide button */}
                <motion.div
                  className="flex-shrink-0 w-24 h-16 glassmorphism rounded cursor-pointer flex items-center justify-center hover:bg-white/10 transition-colors"
                  onClick={addSlide}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-6 h-6 text-slate-600 dark:text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl p-6 space-y-6 border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Slide</h2>
                <div className="flex space-x-2">
                  <GlassmorphismButton 
                    size="sm" 
                    onClick={() => setShowGenerateDialog(true)}
                    className="bg-gradient-to-r from-blue-500 to-green-500"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate
                  </GlassmorphismButton>
                  <GlassmorphismButton size="sm" onClick={enhanceWithAI} variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance
                  </GlassmorphismButton>
                </div>
              </div>

              {/* Content Form */}
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-900 dark:text-white">Title</Label>
                  <Input
                    value={currentSlide.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-900 dark:text-white">Subtitle</Label>
                  <Input
                    value={currentSlide.subtitle}
                    onChange={(e) => updateSlide('subtitle', e.target.value)}
                    className="bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-900 dark:text-white">Content</Label>
                  <Textarea
                    value={currentSlide.content}
                    onChange={(e) => updateSlide('content', e.target.value)}
                    className="bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white min-h-[100px]"
                    placeholder="Add your slide content..."
                  />
                </div>

                {/* Bullet Points */}
                <div>
                  <Label className="text-slate-900 dark:text-white">Bullet Points</Label>
                  <div className="space-y-2">
                    {currentSlide.bulletPoints.map((point, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-slate-900 dark:text-white text-sm flex-1">{point}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBulletPoint(index)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        value={newBulletPoint}
                        onChange={(e) => setNewBulletPoint(e.target.value)}
                        placeholder="Add new point..."
                        className="bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && addBulletPoint()}
                      />
                      <Button onClick={addBulletPoint} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <GlassmorphismButton
                      variant="outline"
                      onClick={() => setShowImageDialog(true)}
                      className="w-full h-12 flex items-center justify-center"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Add Image
                    </GlassmorphismButton>
                    <GlassmorphismButton
                      variant="outline"
                      onClick={() => setShowChartDialog(true)}
                      className="w-full h-12 flex items-center justify-center"
                    >
                      <BarChart className="w-4 h-4 mr-2" />
                      Add Chart
                    </GlassmorphismButton>
                  </div>
                  <GlassmorphismButton
                    variant="outline"
                    onClick={() => setShowBackgroundDialog(true)}
                    className="w-full h-12 flex items-center justify-center"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Change Background
                  </GlassmorphismButton>
                  <GlassmorphismButton
                    onClick={() => setShowGenerateDialog(true)}
                    className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI
                  </GlassmorphismButton>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="pt-6 border-t border-slate-300 dark:border-white/10">
                <h3 className="font-semibold mb-3 flex items-center text-slate-900 dark:text-white">
                  <Lightbulb className="w-4 h-4 mr-2 text-green-500" />
                  AI Suggestions
                </h3>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        updateSlide('content', currentSlide.content + " " + suggestion);
                        toast({
                          title: "Suggestion Applied",
                          description: "AI suggestion has been added to your slide."
                        });
                      }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-white/20">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Export Presentation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">Choose your export format:</p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => exportPresentation("pdf")}
                  disabled={isDownloading}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  <FileText className="w-6 h-6" />
                  <span>{isDownloading ? "Generating..." : "PDF"}</span>
                </Button>
                <Button
                  onClick={() => exportPresentation("pptx")}
                  disabled={isDownloading}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                >
                  <Presentation className="w-6 h-6" />
                  <span>{isDownloading ? "Generating..." : "PowerPoint"}</span>
                </Button>
              </div>
              {isDownloading && (
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Preparing your presentation for download...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate Dialog */}
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-white/20">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Generate AI Presentation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-900 dark:text-white">Topic</Label>
                <Input
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                  placeholder="e.g., Climate Change, Machine Learning, History of Art..."
                  className="bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <Label className="text-slate-900 dark:text-white">Number of Slides</Label>
                <Input
                  type="number"
                  value={slideCount}
                  onChange={(e) => setSlideCount(parseInt(e.target.value) || 5)}
                  min="3"
                  max="20"
                  className="bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white"
                />
              </div>
              <Button
                onClick={generatePresentation}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Presentation
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Add Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-20 border-2 border-dashed border-white/20 hover:border-white/40 bg-transparent"
              >
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <span>Click to upload image</span>
                </div>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Chart Dialog */}
        <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Add Chart</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {chartTypes.map((chart) => (
                <Button
                  key={chart.id}
                  onClick={() => addChart(chart.name)}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-800 hover:bg-slate-700"
                >
                  <chart.icon className="w-6 h-6" />
                  <span className="text-sm">{chart.name}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Background Dialog */}
        <Dialog open={showBackgroundDialog} onOpenChange={setShowBackgroundDialog}>
          <DialogContent className="bg-slate-900 border-white/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Choose Background Style</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {backgroundStyles.map((style, index) => (
                <Button
                  key={index}
                  onClick={() => changeBackground(style)}
                  className={`h-20 relative overflow-hidden ${
                    style.type === 'gradient' 
                      ? `bg-gradient-to-br ${style.value}` 
                      : style.value
                  } hover:scale-105 transition-transform`}
                >
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                  <span className="relative z-10 text-xs font-medium">{style.name}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
};

export default AIPresentations;