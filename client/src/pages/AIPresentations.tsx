"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Sparkles,
  ImageIcon,
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
  Minimize2,
  Save,
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UploadButton } from "@/lib/uploadthing";
import { SkeletonLoader } from "@/components/ui/page-loader";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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

interface PresentationElement {
  type: string;
  content?: string;
  items?: string[];
  position: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  style?: {
    font_size?: number;
    color?: string;
    alignment?: string;
    font_weight?: string;
  };
  src?: string;
  alt?: string;
}

interface PresentationSlide {
  id: string;
  slide_number: number;
  layout_type: string;
  background: {
    type: string;
    color: string;
  };
  elements: PresentationElement[];
}

interface PresentationJSON {
  metadata: {
    title: string;
    slide_count: number;
    created_at: string;
    theme: string;
  };
  slides: PresentationSlide[];
}

interface PresentationRecord {
  id: number;
  title: string;
  slides: string; // JSON string
  created_at: string;
  updated_at: string;
}

// ErrorBoundary for Presentations
class PresentationsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("AIPresentations error:", error, info);
  }
  render() {
    if (this.state.hasError)
      return (
        <div className="text-red-500 text-center py-8">
          Something went wrong in Presentations.
        </div>
      );
    return this.props.children;
  }
}

const AIPresentations = () => {
  const { toast } = useToast();
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "1",
      title: "The Solar System",
      subtitle: "An Introduction to Our Cosmic Neighborhood",
      content:
        "Explore the wonders of our solar system, from the blazing Sun to the distant planets and their fascinating characteristics.",
      backgroundStyle: "gradient",
      backgroundGradient: "from-purple-600 via-blue-600 to-indigo-700",
      images: [],
      bulletPoints: [
        "Eight planets orbit our Sun",
        "Diverse environments across the system",
        "Ongoing exploration and discovery",
      ],
    },
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
  const [currentPresentationId, setCurrentPresentationId] = useState<
    string | null
  >(null);
  const [presentationJSON, setPresentationJSON] =
    useState<PresentationJSON | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [presentations, setPresentations] = useState<PresentationRecord[]>([]);
  const [isPresentationsLoading, setIsPresentationsLoading] = useState(true);
  const [pendingAutoSave, setPendingAutoSave] = useState(false);
  const [presentationToDelete, setPresentationToDelete] =
    useState<PresentationRecord | null>(null);

  // Fetch all presentations for the user on mount
  useEffect(() => {
    setIsPresentationsLoading(true);
    fetch("/api/presentations", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setPresentations(data);
        if (data.length > 0) {
          setCurrentPresentationId(data[0].id.toString());
          setSlides(safeSlides(JSON.parse(data[0].slides)));
        }
      })
      .catch(() => setPresentations([]))
      .finally(() => setIsPresentationsLoading(false));
  }, []);

  // Auto-save after slides are updated from generation
  useEffect(() => {
    if (pendingAutoSave) {
      savePresentation(true);
      setPendingAutoSave(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, pendingAutoSave]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSlide = slides[currentSlideIndex];

  const backgroundStyles = [
    {
      name: "Purple Gradient",
      value: "from-purple-600 via-blue-600 to-indigo-700",
      type: "gradient",
    },
    {
      name: "Ocean Gradient",
      value: "from-blue-500 via-teal-500 to-cyan-600",
      type: "gradient",
    },
    {
      name: "Sunset Gradient",
      value: "from-orange-500 via-red-500 to-pink-600",
      type: "gradient",
    },
    {
      name: "Forest Gradient",
      value: "from-green-500 via-emerald-500 to-teal-600",
      type: "gradient",
    },
    {
      name: "Fire Gradient",
      value: "from-red-600 via-orange-500 to-yellow-500",
      type: "gradient",
    },
    {
      name: "Night Gradient",
      value: "from-gray-900 via-purple-900 to-violet-800",
      type: "gradient",
    },
    {
      name: "Aurora Gradient",
      value: "from-green-400 via-blue-500 to-purple-600",
      type: "gradient",
    },
    {
      name: "Space Gradient",
      value: "from-black via-purple-900 to-blue-900",
      type: "gradient",
    },
    { name: "Minimal White", value: "bg-white text-gray-900", type: "solid" },
    {
      name: "Professional Blue",
      value: "bg-blue-900 text-white",
      type: "solid",
    },
    { name: "Dark Mode", value: "bg-gray-900 text-white", type: "solid" },
    { name: "Clean Gray", value: "bg-gray-100 text-gray-900", type: "solid" },
  ];

  const chartTypes = [
    {
      id: "bar",
      name: "Bar Chart",
      icon: BarChart,
      description: "Compare data across categories",
    },
    {
      id: "line",
      name: "Line Chart",
      icon: BarChart,
      description: "Show trends over time",
    },
    {
      id: "pie",
      name: "Pie Chart",
      icon: BarChart,
      description: "Display proportional data",
    },
    {
      id: "timeline",
      name: "Timeline",
      icon: BarChart,
      description: "Show events chronologically",
    },
  ];

  const aiSuggestions = [
    "Add a comparison chart showing key metrics",
    "Include relevant statistics and data points",
    "Generate bullet points for main concepts",
    "Create a timeline of important events",
    "Add visual elements to enhance understanding",
  ];

  // Convert Flask JSON to React slides format
  const convertJSONToSlides = (jsonData: PresentationJSON): Slide[] => {
    return jsonData.slides.map((slide, index) => {
      let title = `Slide ${slide.slide_number}`;
      let subtitle = "";
      let content = "";
      let bulletPoints: string[] = [];
      const images: string[] = [];

      // Extract elements
      slide.elements.forEach(element => {
        switch (element.type) {
          case "title":
            title = element.content || title;
            break;
          case "text":
            if (slide.slide_number === 1 && !subtitle) {
              subtitle = element.content || "";
            } else {
              content += (content ? " " : "") + (element.content || "");
            }
            break;
          case "bullet_list":
            bulletPoints = element.items || [];
            break;
          case "image":
            if (element.src) {
              images.push(element.src);
            }
            break;
        }
      });

      return {
        id: slide.id,
        title,
        subtitle,
        content,
        backgroundStyle: "gradient",
        backgroundGradient:
          backgroundStyles[index % backgroundStyles.length].value,
        images,
        bulletPoints,
      };
    });
  };

  // Convert React slides back to Flask JSON format
  const convertSlidesToJSON = (slides: Slide[]): PresentationJSON => {
    return {
      metadata: {
        title: generateTopic || "AI Generated Presentation",
        slide_count: slides.length,
        created_at: new Date().toISOString(),
        theme: "gamma_style",
      },
      slides: slides.map((slide, index) => ({
        id: slide.id,
        slide_number: index + 1,
        layout_type: index === 0 ? "title" : "content",
        background: {
          type: "color",
          color: "#ffffff",
        },
        elements: [
          {
            type: "title",
            content: slide.title,
            position: { left: 1, top: 1, width: 10, height: 1.5 },
            style: {
              font_size: index === 0 ? 32 : 24,
              color: "#333333",
              alignment: "center",
              font_weight: "bold",
            },
          },
          ...(slide.subtitle
            ? [
                {
                  type: "text",
                  content: slide.subtitle,
                  position: { left: 1, top: 2.5, width: 10, height: 1 },
                  style: {
                    font_size: 18,
                    color: "#666666",
                    alignment: "center",
                  },
                },
              ]
            : []),
          ...(slide.content
            ? [
                {
                  type: "text",
                  content: slide.content,
                  position: { left: 1, top: 3.5, width: 10, height: 2 },
                  style: {
                    font_size: 16,
                    color: "#333333",
                    alignment: "left",
                  },
                },
              ]
            : []),
          ...(slide.bulletPoints.length > 0
            ? [
                {
                  type: "bullet_list",
                  items: slide.bulletPoints,
                  position: { left: 1, top: 4, width: 10, height: 3 },
                  style: {
                    font_size: 16,
                    color: "#333333",
                    alignment: "left",
                  },
                },
              ]
            : []),
        ],
      })),
    };
  };

  // Update slide content and mark as changed
  const updateSlide = (field: keyof Slide, value: string | string[]) => {
    setSlides(prev =>
      prev.map((slide, index) =>
        index === currentSlideIndex ? { ...slide, [field]: value } : slide
      )
    );
    setHasUnsavedChanges(true);
  };

  // Save (create or update) presentation
  const savePresentation = async (isNew = false) => {
    setIsSaving(true);
    try {
      const payload = {
        title: slides[0]?.title || "Untitled Presentation",
        slides: JSON.stringify(slides),
      };
      let res;
      if (isNew || !currentPresentationId) {
        res = await fetch("/api/presentations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/presentations/${currentPresentationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error("Failed to save presentation");
      const saved = await res.json();
      setCurrentPresentationId(saved.id.toString());
      setHasUnsavedChanges(false);
      toast({
        title: "Presentation Saved",
        description: "Your presentation is saved in your account.",
      });
      // Refresh list
      fetch("/api/presentations", { credentials: "include" })
        .then(res => res.json())
        .then(setPresentations);
    } catch (e: any) {
      toast({
        title: "Save Failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Create new presentation
  const createNewPresentation = () => {
    setSlides(
      safeSlides([
        {
          id: `slide_${Date.now()}`,
          title: "New Presentation",
          subtitle: "",
          content: "",
          backgroundStyle: "gradient",
          backgroundGradient: "from-purple-600 via-blue-600 to-indigo-700",
          images: [],
          bulletPoints: [],
        },
      ])
    );
    setCurrentPresentationId(null);
    setCurrentSlideIndex(0);
    setHasUnsavedChanges(false); // No unsaved changes yet
    setPendingAutoSave(true); // Trigger auto-save so it appears in the list
  };

  // Delete presentation
  const deletePresentation = async (id: string | number) => {
    try {
      const res = await fetch(`/api/presentations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete presentation");
      toast({
        title: "Presentation Deleted",
        description: "Presentation has been removed.",
      });
      // Refresh list
      fetch("/api/presentations", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          setPresentations(data);
          if (data.length > 0) {
            setCurrentPresentationId(data[0].id.toString());
            setSlides(safeSlides(JSON.parse(data[0].slides)));
          } else {
            createNewPresentation();
          }
        });
    } catch (e: any) {
      toast({
        title: "Delete Failed",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  // Switch presentation
  const loadPresentation = (id: string | number) => {
    const pres = presentations.find(p => p.id.toString() === id.toString());
    if (pres) {
      setCurrentPresentationId(pres.id.toString());
      setSlides(safeSlides(JSON.parse(pres.slides)));
      setCurrentSlideIndex(0);
      setHasUnsavedChanges(false);
    }
  };

  // Add new slide
  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      title: "New Slide",
      subtitle: "Subtitle",
      content: "Add your content here...",
      backgroundStyle: "gradient",
      backgroundGradient: "from-purple-600 via-blue-600 to-indigo-700",
      images: [],
      bulletPoints: [],
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
    setHasUnsavedChanges(true);
    toast({
      title: "Slide Added",
      description: "New slide has been created successfully.",
    });
  };

  // Delete slide
  const deleteSlide = (index: number) => {
    if (slides.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You need at least one slide in your presentation.",
        variant: "destructive",
      });
      return;
    }
    setSlides(prev => prev.filter((_, i) => i !== index));
    if (currentSlideIndex >= slides.length - 1) {
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
    setHasUnsavedChanges(true);
    toast({
      title: "Slide Deleted",
      description: "Slide has been removed from your presentation.",
    });
  };

  // Duplicate slide
  const duplicateSlide = (index: number) => {
    const slideToClone = slides[index];
    const newSlide = {
      ...slideToClone,
      id: `slide_${Date.now()}`,
      title: slideToClone.title + " (Copy)",
    };
    setSlides(prev => [
      ...prev.slice(0, index + 1),
      newSlide,
      ...prev.slice(index + 1),
    ]);
    setHasUnsavedChanges(true);
    toast({
      title: "Slide Duplicated",
      description: "Slide has been copied successfully.",
    });
  };

  // Generate presentation with AI using Flask backend
  const generatePresentation = async () => {
    if (!generateTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your presentation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log("Creating presentation with Flask backend...");

      // Step 1: Create presentation
      const createResponse = await fetch(
        "http://localhost:5002/create_presentation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: generateTopic,
            slides: slideCount,
          }),
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Failed to create presentation");
      }

      const createResult = await createResponse.json();
      console.log("Presentation created:", createResult);

      if (!createResult.success) {
        throw new Error(createResult.error || "Failed to create presentation");
      }

      const presentationId = createResult.presentation_id;
      setCurrentPresentationId(presentationId);

      // Step 2: Get JSON data for web rendering
      const jsonResponse = await fetch(
        `http://localhost:5002/get_presentation_json/${presentationId}`
      );

      if (jsonResponse.ok) {
        const jsonResult = await jsonResponse.json();
        console.log("JSON data received:", jsonResult);

        if (jsonResult.success && jsonResult.json_data) {
          setPresentationJSON(jsonResult.json_data);
          const convertedSlides = convertJSONToSlides(jsonResult.json_data);
          setSlides(convertedSlides);
          setCurrentSlideIndex(0);
          setHasUnsavedChanges(false);
          setPendingAutoSave(true); // <-- Set flag to trigger save after slides update
        }
      }

      toast({
        title: "Presentation Generated Successfully!",
        description: `Created ${createResult.slide_count} slides about "${generateTopic}". You can now edit and download your presentation.`,
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description:
          error.message ||
          "There was an error generating your presentation. Please check if the Flask server is running on port 5002.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setShowGenerateDialog(false);
      setGenerateTopic("");
    }
  };

  // Export presentation using Flask backend
  const exportPresentation = async (format: string) => {
    setShowExportDialog(false);
    setIsDownloading(true);

    try {
      if (!currentPresentationId) {
        toast({
          title: "No Presentation Available",
          description:
            "Please generate a presentation first using the 'Generate AI' button.",
          variant: "destructive",
        });
        return;
      }

      // Save changes before exporting if there are any
      if (hasUnsavedChanges) {
        await savePresentation(false); // Pass false for update
      }

      console.log(`Exporting presentation as ${format}...`);

      const response = await fetch("http://localhost:5002/export_ppt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presentationId: currentPresentationId,
          format: format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to export as ${format}`);
      }
      // Handle file download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const getFileName = () => {
        if (presentationJSON?.metadata?.title) {
          return presentationJSON.metadata.title;
        }

        if (slides.length > 0 && slides[0].title) {
          return slides[0].title;
        }

        if (generateTopic) {
          return generateTopic;
        }

        return "AI_Presentation";
      };

      // Sanitize filename by removing invalid characters
      const sanitizeFilename = (filename: string) => {
        return filename
          .replace(/[<>:"/\\|?*]/g, "")
          .replace(/\s+/g, "_")
          .substring(0, 100);
      };

      const fileName = sanitizeFilename(getFileName());
      link.download = `${fileName}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: `${format.toUpperCase()} Download Complete`,
        description: `Your presentation has been downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error: any) {
      console.error(" Export error:", error);
      toast({
        title: "Export Failed",
        description:
          error.message || "There was an error exporting your presentation.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Replace handleImageUpload and add UploadThing UI
  const handleImageUpload = (url: string) => {
    setSlides(prev =>
      prev.map((slide, index) =>
        index === currentSlideIndex
          ? { ...slide, images: [...slide.images, url] }
          : slide
      )
    );
    setHasUnsavedChanges(true);
    toast({
      title: "Image Added",
      description: "Image has been added to your slide.",
    });
    setShowImageDialog(false);
  };

  // Add chart to slide
  const addChart = (chartType: string) => {
    setHasUnsavedChanges(true);
    toast({
      title: "Chart Added",
      description: `${chartType} has been added to your slide.`,
    });
    setShowChartDialog(false);
  };

  // Add bullet point
  const addBulletPoint = () => {
    if (newBulletPoint.trim()) {
      setSlides(prev =>
        prev.map((slide, index) =>
          index === currentSlideIndex
            ? {
                ...slide,
                bulletPoints: [...slide.bulletPoints, newBulletPoint.trim()],
              }
            : slide
        )
      );
      setNewBulletPoint("");
      setHasUnsavedChanges(true);
      toast({
        title: "Bullet Point Added",
        description: "New point has been added to your slide.",
      });
    }
  };

  // Remove bullet point
  const removeBulletPoint = (index: number) => {
    setSlides(prev =>
      prev.map((slide, slideIndex) =>
        slideIndex === currentSlideIndex
          ? {
              ...slide,
              bulletPoints: slide.bulletPoints.filter((_, i) => i !== index),
            }
          : slide
      )
    );
    setHasUnsavedChanges(true);
  };

  // Change background
  const changeBackground = (backgroundStyle: any) => {
    updateSlide("backgroundGradient", backgroundStyle.value);
    updateSlide("backgroundStyle", backgroundStyle.type);
    setShowBackgroundDialog(false);
    toast({
      title: "Background Updated",
      description: `Applied ${backgroundStyle.name} to your slide.`,
    });
  };

  // Enhance with AI
  const enhanceWithAI = () => {
    const enhancedContent =
      currentSlide.content +
      " AI has enhanced this content with additional insights, improved structure, and more engaging language to captivate your audience.";
    setSlides(prev =>
      prev.map((slide, index) =>
        index === currentSlideIndex
          ? {
              ...slide,
              content: enhancedContent,
              bulletPoints: [
                ...slide.bulletPoints,
                "AI-generated insight for better understanding",
                "Enhanced visual appeal and engagement",
              ],
            }
          : slide
      )
    );

    setHasUnsavedChanges(true);
    toast({
      title: "Content Enhanced",
      description: "AI has improved your slide content and added new insights.",
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
      "AI: Continue Creating",
    ];
    return aiTexts[Math.floor(Math.random() * aiTexts.length)];
  };

  if (isPresentationsLoading) {
    return (
      <main className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <SkeletonLoader className="mx-auto mb-4 w-1/2 h-10" lines={1} />
            <SkeletonLoader className="mx-auto mb-6 w-1/3 h-6" lines={1} />
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[...Array(3)].map((_, i) => (
                <SkeletonLoader
                  key={i}
                  className="w-32 h-10 rounded-xl"
                  lines={1}
                />
              ))}
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Slide Preview Skeleton */}
            <div className="lg:col-span-2">
              <div className="glassmorphism rounded-xl p-6">
                <SkeletonLoader className="mb-4 w-2/3 h-8" lines={1} />
                <SkeletonLoader className="rounded-lg mb-4 h-64" lines={8} />
                <div className="flex space-x-2 overflow-x-auto pb-2 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonLoader
                      key={i}
                      className="w-24 h-16 rounded"
                      lines={1}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Editor Skeleton */}
            <div className="lg:col-span-1">
              <div className="glassmorphism rounded-xl p-6 space-y-6">
                <SkeletonLoader className="mb-4 w-1/2 h-8" lines={1} />
                <SkeletonLoader className="mb-4 h-32" lines={4} />
                <SkeletonLoader className="mb-4 h-16" lines={2} />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <PresentationsErrorBoundary>
      <main className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              AI Presentations Studio
            </motion.h1>
            <motion.p
              className="text-slate-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Create stunning presentations with AI assistance and professional
              templates
            </motion.p>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {hasUnsavedChanges && (
                <GlassmorphismButton
                  onClick={savePresentation}
                  disabled={isSaving}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </GlassmorphismButton>
              )}
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
                {isPreviewMode ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
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

              <div className="w-full h-full max-w-6xl max-h-[80vh] flex items-center justify-center p-8">
                <div
                  className={`w-full h-full ${
                    currentSlide.backgroundStyle === "gradient"
                      ? `bg-gradient-to-br ${currentSlide.backgroundGradient}`
                      : currentSlide.backgroundGradient
                  } rounded-2xl p-8 text-white flex flex-col justify-center overflow-hidden shadow-2xl`}
                  style={{ aspectRatio: "16/9" }}
                >
                  <div className="text-center space-y-6">
                    <h1 className="text-5xl font-bold leading-tight">
                      {currentSlide.title}
                    </h1>
                    <h2 className="text-2xl opacity-90">
                      {currentSlide.subtitle}
                    </h2>

                    {currentSlide.content && (
                      <p className="text-xl opacity-80 max-w-4xl mx-auto leading-relaxed">
                        {currentSlide.content}
                      </p>
                    )}

                    {currentSlide.bulletPoints.length > 0 && (
                      <div className="space-y-3 text-left max-w-3xl mx-auto">
                        {currentSlide.bulletPoints.map((point, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start space-x-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                          >
                            <div className="w-3 h-3 bg-white rounded-full mt-3 flex-shrink-0"></div>
                            <span className="text-xl">{point}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {currentSlide.images.length > 0 && (
                      <div className="flex justify-center space-x-4 mt-6">
                        {currentSlide.images.map((image, index) => (
                          <img
                            key={index}
                            src={image || "/placeholder.svg"}
                            alt={`Slide image ${index + 1}`}
                            className="max-w-md max-h-60 object-cover rounded-xl shadow-2xl"
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

          <div
            className={`grid lg:grid-cols-3 gap-8 ${isPreviewMode ? "hidden" : ""}`}
          >
            {/* Slide Preview */}
            <div className="lg:col-span-2">
              <motion.div
                className="glassmorphism rounded-xl p-6"
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
                    <span className="text-sm text-slate-300">
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
                    {hasUnsavedChanges && (
                      <GlassmorphismButton
                        onClick={savePresentation}
                        disabled={isSaving}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {isSaving ? "Saving..." : "Save"}
                      </GlassmorphismButton>
                    )}
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

                {/* Slide Canvas - Fixed aspect ratio */}
                <motion.div
                  className={`glassmorphism rounded-lg p-6 mb-4 ${
                    currentSlide.backgroundStyle === "gradient"
                      ? `bg-gradient-to-br ${currentSlide.backgroundGradient}`
                      : currentSlide.backgroundGradient
                  } text-white flex flex-col justify-center overflow-hidden`}
                  style={{ aspectRatio: "16/9", minHeight: "400px" }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold leading-tight">
                      {currentSlide.title}
                    </h1>
                    <h2 className="text-lg opacity-90">
                      {currentSlide.subtitle}
                    </h2>

                    {currentSlide.content && (
                      <p className="text-base opacity-80 max-w-2xl mx-auto leading-relaxed">
                        {currentSlide.content}
                      </p>
                    )}

                    {currentSlide.bulletPoints.length > 0 && (
                      <div className="space-y-2 text-left max-w-xl mx-auto">
                        {currentSlide.bulletPoints.map((point, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{point}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {currentSlide.images.length > 0 && (
                      <div className="flex justify-center space-x-3 mt-4">
                        {currentSlide.images.map((image, index) => (
                          <img
                            key={index}
                            src={image || "/placeholder.svg"}
                            alt={`Slide image ${index + 1}`}
                            className="max-w-xs max-h-32 object-cover rounded-lg shadow-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Slide Thumbnails */}
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {presentations.map((pres, index) => (
                    <motion.div
                      key={pres.id}
                      className={`relative flex-shrink-0 w-24 h-16 glassmorphism rounded cursor-pointer transition-all group ${
                        currentPresentationId === pres.id.toString()
                          ? "border-2 border-blue-500"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => loadPresentation(pres.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`w-full h-full rounded ${
                          pres.slides.includes("gradient")
                            ? `bg-gradient-to-br ${pres.slides.split("gradient")[1].split("to")[0].replace("via-", "").replace("to-", "")}`
                            : pres.slides.split("bg-")[1].split("text-")[0]
                        } flex items-center justify-center relative`}
                      >
                        <span className="text-xs text-white font-bold">
                          {index + 1}
                        </span>

                        {/* Slide actions */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={e => {
                              e.stopPropagation();
                              // Duplicate presentation logic would go here if implemented
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {presentations.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                              onClick={e => {
                                e.stopPropagation();
                                setPresentationToDelete(pres);
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
                    onClick={isSaving ? undefined : createNewPresentation}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={
                      isSaving ? { opacity: 0.5, pointerEvents: "none" } : {}
                    }
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Content Editor */}
            <div className="lg:col-span-1">
              <motion.div
                className="glassmorphism rounded-xl p-6 space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Edit Slide</h2>
                  <div className="flex space-x-2">
                    <GlassmorphismButton
                      size="sm"
                      onClick={() => setShowGenerateDialog(true)}
                      className="bg-gradient-to-r from-blue-500 to-green-500"
                      disabled={isGenerating}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate
                    </GlassmorphismButton>
                    <GlassmorphismButton
                      size="sm"
                      onClick={enhanceWithAI}
                      variant="outline"
                      disabled={isGenerating}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Enhance
                    </GlassmorphismButton>
                  </div>
                </div>

                {/* Unsaved changes indicator */}
                {hasUnsavedChanges && (
                  <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3 text-yellow-200 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>You have unsaved changes</span>
                    </div>
                  </div>
                )}

                {/* Content Form */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Title</Label>
                    <Input
                      value={currentSlide.title}
                      onChange={e => updateSlide("title", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Subtitle</Label>
                    <Input
                      value={currentSlide.subtitle}
                      onChange={e => updateSlide("subtitle", e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Content</Label>
                    <Textarea
                      value={currentSlide.content}
                      onChange={e => updateSlide("content", e.target.value)}
                      className="bg-white/5 border-white/20 text-white min-h-[100px]"
                      placeholder="Add your slide content..."
                    />
                  </div>

                  {/* Bullet Points */}
                  <div>
                    <Label className="text-white">Bullet Points</Label>
                    <div className="space-y-2">
                      {currentSlide.bulletPoints.map((point, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <span className="text-white text-sm flex-1">
                            {point}
                          </span>
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
                          onChange={e => setNewBulletPoint(e.target.value)}
                          placeholder="Add new point..."
                          className="bg-white/5 border-white/20 text-white"
                          onKeyPress={e =>
                            e.key === "Enter" && addBulletPoint()
                          }
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
                        disabled={isGenerating}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Add Image
                      </GlassmorphismButton>
                      <GlassmorphismButton
                        variant="outline"
                        onClick={() => setShowChartDialog(true)}
                        className="w-full h-12 flex items-center justify-center"
                        disabled={isGenerating}
                      >
                        <BarChart className="w-4 h-4 mr-2" />
                        Add Chart
                      </GlassmorphismButton>
                    </div>
                    <GlassmorphismButton
                      variant="outline"
                      onClick={() => setShowBackgroundDialog(true)}
                      className="w-full h-12 flex items-center justify-center"
                      disabled={isGenerating}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Change Background
                    </GlassmorphismButton>
                    <GlassmorphismButton
                      onClick={generatePresentation}
                      className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500"
                      disabled={isGenerating}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate AI
                    </GlassmorphismButton>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="font-semibold mb-3 flex items-center text-white">
                    <Lightbulb className="w-4 h-4 mr-2 text-green-500" />
                    AI Suggestions
                  </h3>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        className="w-full text-left p-3 glassmorphism rounded-lg text-sm hover:bg-white/10 transition-colors text-white"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          updateSlide(
                            "content",
                            currentSlide.content + " " + suggestion
                          );
                          toast({
                            title: "Suggestion Applied",
                            description:
                              "AI suggestion has been added to your slide.",
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
            <DialogContent className="bg-slate-900 border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Export Presentation
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-slate-300">Choose your export format:</p>
                {hasUnsavedChanges && (
                  <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3 text-yellow-200 text-sm">
                    Your changes will be saved automatically before export.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => exportPresentation("pdf")}
                    disabled={isDownloading || !currentPresentationId}
                    className="h-20 flex flex-col items-center justify-center space-y-2 bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    <FileText className="w-6 h-6" />
                    <span>{isDownloading ? "Generating..." : "PDF"}</span>
                  </Button>
                  <Button
                    onClick={() => exportPresentation("pptx")}
                    disabled={isDownloading || !currentPresentationId}
                    className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                  >
                    <Presentation className="w-6 h-6" />
                    <span>
                      {isDownloading ? "Generating..." : "PowerPoint"}
                    </span>
                  </Button>
                </div>
                {!currentPresentationId && (
                  <p className="text-yellow-400 text-sm text-center">
                    Generate a presentation first to enable downloads
                  </p>
                )}
                {isDownloading && (
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-slate-400 text-sm">
                      Preparing your presentation for download...
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Generate Dialog */}
          <Dialog
            open={showGenerateDialog}
            onOpenChange={setShowGenerateDialog}
          >
            <DialogContent className="bg-slate-900 border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Generate AI Presentation
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Topic</Label>
                  <Input
                    value={generateTopic}
                    onChange={e => setGenerateTopic(e.target.value)}
                    placeholder="e.g., Climate Change, Machine Learning, History of Art..."
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Number of Slides</Label>
                  <Input
                    type="number"
                    value={slideCount}
                    onChange={e =>
                      setSlideCount(Number.parseInt(e.target.value) || 5)
                    }
                    min="3"
                    max="20"
                    className="bg-white/5 border-white/20 text-white"
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
                {isGenerating && (
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">
                      Creating your AI-powered presentation...
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Image Dialog */}
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogContent className="bg-slate-900 border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">Upload Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <UploadButton
                  endpoint="presentationImage"
                  onClientUploadComplete={(res: Array<{ url: string }>) => {
                    if (res && res[0]) {
                      handleImageUpload(res[0].url);
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
                      description: "Your image is being uploaded.",
                    });
                  }}
                  className="w-full"
                  appearance={{
                    button: "w-full bg-muted hover:bg-muted/80 text-foreground",
                    allowedContent: "hidden",
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Max file size: 2MB. Only images allowed.
                </p>
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
                {chartTypes.map(chart => (
                  <Button
                    key={chart.id}
                    onClick={() => addChart(chart.name)}
                    className="h-20 flex flex-col items-center justify-center space-y-2 bg-slate-800 hover:bg-slate-700"
                    disabled={isGenerating}
                  >
                    <chart.icon className="w-6 h-6" />
                    <span className="text-sm">{chart.name}</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Background Dialog */}
          <Dialog
            open={showBackgroundDialog}
            onOpenChange={setShowBackgroundDialog}
          >
            <DialogContent className="bg-slate-900 border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Choose Background Style
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {backgroundStyles.map((style, index) => (
                  <Button
                    key={index}
                    onClick={() => changeBackground(style)}
                    className={`h-20 relative overflow-hidden ${
                      style.type === "gradient"
                        ? `bg-gradient-to-br ${style.value}`
                        : style.value
                    } hover:scale-105 transition-transform`}
                    disabled={isGenerating}
                  >
                    <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                    <span className="relative z-10 text-xs font-medium">
                      {style.name}
                    </span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!presentationToDelete}
            onOpenChange={open => {
              if (!open) setPresentationToDelete(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Presentation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-red-500">
                    {presentationToDelete?.title || "this presentation"}
                  </span>
                  ?<br />
                  This action cannot be undone and will permanently remove the
                  presentation and its slides.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  onClick={() => {
                    if (presentationToDelete) {
                      deletePresentation(presentationToDelete.id);
                      setPresentationToDelete(null);
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </PresentationsErrorBoundary>
  );
};

export default AIPresentations;

// Defensive helpers
const safeArray = <T,>(val: T[] | undefined): T[] =>
  Array.isArray(val) ? val : [];
const safeSlides = (slides: any): Slide[] =>
  safeArray(slides).map((slide: any, index: number) => ({
    id: slide.id?.toString() || `slide_${index}`,
    title: slide.title || `Slide ${index + 1}`,
    subtitle: slide.subtitle || "",
    content: slide.content || "",
    backgroundStyle: slide.backgroundStyle || "gradient",
    backgroundGradient:
      slide.backgroundGradient || "from-purple-600 via-blue-600 to-indigo-700",
    images: safeArray(slide.images),
    bulletPoints: safeArray(slide.bulletPoints),
  }));
