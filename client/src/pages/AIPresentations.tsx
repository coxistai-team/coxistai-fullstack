"use client"
import React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef } from "react";

import {
  Download,
  RefreshCw,
  FileText,
  Presentation,
  Wand2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Copy,
  Trash2,
  Plus,
  Sparkles,
  Zap,
  Brain,
  Target,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  Users2,
  Award,
  Clock,
  Star
} from "lucide-react"
import GlassmorphismButton from "@/components/ui/glassmorphism-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import ParticleField from "@/components/effects/ParticleField";

// New interface for individual elements within a slide, mirroring Flask's JSON
interface SlideElement {
  type: "title" | "text" | "bullet_list" | "image" | "subtitle" // Add "subtitle"
  content?: string // For title, text, subtitle
  items?: string[] // For bullet_list
  position: {
    left: number
    top: number
    width: number
    height: number
  }
  style: {
    font_size: number
    font_weight: "normal" | "bold"
    color: string // Hex color
    alignment: "left" | "center" | "right"
  }
  src?: string // For image
  alt?: string // For image
}

// Updated Slide interface to directly reflect backend JSON structure
interface Slide {
  id: string
  slide_number: number
  layout_type: string
  background: {
    type: "gradient" | "solid"
    gradient?: string // Tailwind gradient classes
    color?: string // Hex color for solid backgrounds
  }
  elements: SlideElement[]
}

const AIPresentations = () => {
  // Error boundary for the component
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (hasError) {
    return (
      <main className="relative z-10 pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 text-lg mb-4">Something went wrong</div>
          <div className="text-slate-600 dark:text-slate-300 mb-4">{errorMessage}</div>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </main>
    );
  }
  const { toast } = useToast()
  const [presentationId, setPresentationId] = useState<string | null>(null)
  const [presentationTopic, setPresentationTopic] = useState<string>("AI Presentation") // New state for download filename
  const [savedPresentations, setSavedPresentations] = useState<any[]>([]);
  const [isLoadingPresentations, setIsLoadingPresentations] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  // Add state for dialog controls
  const [pendingDeletePresentation, setPendingDeletePresentation] = useState<string | null>(null)
  const [pendingDeleteSlide, setPendingDeleteSlide] = useState<number | null>(null)
  const [isLoadingSlides, setIsLoadingSlides] = useState(false)

  // Background styles array
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

  const [slides, setSlides] = useState<Slide[]>([
    // Initial dummy slide, will be replaced by AI generated content
    {
      id: "1",
      slide_number: 1,
      layout_type: "title",
      background: { type: "gradient", gradient: "from-purple-600 via-blue-600 to-indigo-700" },
      elements: [
        {
          type: "title",
          content: "Welcome to AI Presentations",
          position: { left: 0, top: 0, width: 0, height: 0 },
          style: { font_size: 40, font_weight: "bold", color: "#FFFFFF", alignment: "center" },
        },
        {
          type: "text",
          content: "Generate stunning slides with AI",
          position: { left: 0, top: 0, width: 0, height: 0 },
          style: { font_size: 20, font_weight: "normal", color: "#FFFFFF", alignment: "center" },
        },
      ],
    },
  ])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateTopic, setGenerateTopic] = useState("")
  const [slideCount, setSlideCount] = useState(5)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [editorSubtitle, setEditorSubtitle] = useState("") // New state for subtitle

  const currentSlide = slides[currentSlideIndex] || null
  


  // Helper to extract title and content for the editor from the elements array
  // Helper function to safely map slide elements
  const safeMapElements = (elements: SlideElement[] | undefined, mapper: (el: SlideElement, index: number) => any) => {
    try {
      return (elements || []).map(mapper);
    } catch (error) {
      console.error("Error mapping slide elements:", error);
      return [];
    }
  };

  const getEditorContent = (slide: Slide | null) => {
    if (!slide || !slide.elements) {
      return { title: "", subtitle: "", content: "" }
    }
    
    let title = ""
    let subtitle = "" // Initialize subtitle
    let content = ""
    const contentElements: string[] = []

    slide.elements.forEach((el) => {
      if (el.type === "title" && el.content) {
        title = el.content
      } else if (el.type === "subtitle" && el.content) {
        // Extract subtitle
        subtitle = el.content
      } else if (el.type === "text" && el.content) {
        contentElements.push(el.content)
      } else if (el.type === "bullet_list" && el.items) {
        contentElements.push(el.items.map((item) => `• ${item}`).join("\n"))
      }
    })

    content = contentElements.join("\n\n")
    return { title, subtitle, content } // Return subtitle
  }
 
  const { title: editorTitle, subtitle: editorSubtitleValue, content: editorContent } = currentSlide ? getEditorContent(currentSlide) : { title: "", subtitle: "", content: "" }

  // Update editorSubtitle state when currentSlide changes
  React.useEffect(() => {
    setEditorSubtitle(editorSubtitleValue)
  }, [editorSubtitleValue])

  // Update slide content and sync with backend
  const updateSlideContent = async (field: "title" | "subtitle" | "content", value: string) => {
    const updatedSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        const newElements = safeMapElements(slide.elements, (el) => {
          if (field === "title" && el.type === "title") {
            return { ...el, content: value }
          }
          if (field === "subtitle" && el.type === "subtitle") {
            return { ...el, content: value }
          }
          if (field === "content" && (el.type === "text" || el.type === "bullet_list")) {
            if (el.type === "text") {
              return { ...el, content: value }
            } else if (el.type === "bullet_list") {
              return {
                ...el,
                items: value.split("\n").map((item) => (item.startsWith("•") ? item.substring(1).trim() : item.trim())),
              }
            }
          }
          return el
        })

        if (field === "subtitle" && !newElements.some((el) => el.type === "subtitle") && currentSlideIndex === 0) {
          newElements.push({
            type: "subtitle",
            content: value,
            position: { left: 0, top: 0, width: 0, height: 0 },
            style: {
              font_size: 24,
              font_weight: "normal",
              color: "#FFFFFF",
              alignment: "center",
            },
          })
        }

        if (field === "content" && !newElements.some((el) => el.type === "text" || el.type === "bullet_list")) {
          newElements.push({
            type: "text",
            content: value,
            position: { left: 0, top: 0, width: 0, height: 0 },
            style: {
              font_size: 16,
              font_weight: "normal",
              color: "#FFFFFF",
              alignment: "left",
            },
          })
        }

        return { ...slide, elements: newElements }
      }
      return slide
    })

    setSlides(updatedSlides)

    // Save to DB if presentationId exists
    if (presentationId && presentationTopic) {
      debouncedSave(presentationId, presentationTopic, { slides: updatedSlides });
    }
  }

  // Create new presentation
  const createNewPresentation = () => {
    setSlides([
        {
          id: `slide_${Date.now()}`,
        slide_number: 1,
        layout_type: "title",
        background: { type: "gradient", gradient: "from-purple-600 via-blue-600 to-indigo-700" },
        elements: [
          {
            type: "title",
            content: "New Presentation",
            position: { left: 0, top: 0, width: 0, height: 0 },
            style: { font_size: 40, font_weight: "bold", color: "#FFFFFF", alignment: "center" },
          },
        ],
      },
    ])
    setPresentationId(null)
    setCurrentSlideIndex(0)
    }

  // Add new slide
  const addSlide = () => {
    const randomBackground = backgroundStyles[Math.floor(Math.random() * backgroundStyles.length)]
    const newSlide: Slide = {
      id: Date.now().toString(),
      slide_number: slides.length + 1,
      layout_type: "content",
      background:
        randomBackground.type === "gradient"
          ? { type: "gradient", gradient: randomBackground.value }
          : { type: "solid", color: randomBackground.value },
      elements: [
        {
          type: "title",
          content: "New Slide Title",
          position: { left: 0, top: 0, width: 0, height: 0 },
          style: { font_size: 32, font_weight: "bold", color: "#FFFFFF", alignment: "center" },
        },
        {
          type: "text",
          content: "Add your content here...",
          position: { left: 0, top: 0, width: 0, height: 0 },
          style: { font_size: 18, font_weight: "normal", color: "#FFFFFF", alignment: "left" },
        },
      ],
    }
    setSlides((prev) => [...prev, newSlide])
    setCurrentSlideIndex(slides.length)
    toast({
      title: "Slide Added",
      description: "New slide has been created successfully.",
    })
  }

  // Duplicate slide with backend persistence
  const duplicateSlide = async (index: number) => {
    if (!presentationId) {
      toast({
        title: "No Presentation",
        description: "Please generate or load a presentation first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const PPT_API_URL = import.meta.env.VITE_PPT_API_URL;
      const response = await fetch(`${PPT_API_URL}/slide_operations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "copy",
          presentation_id: presentationId,
          slide_index: index,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to duplicate slide");
      }

      const data = await response.json();
      
      if (data.success && data.updated_slides && Array.isArray(data.updated_slides)) {
        // Update local state with the new slides
        const updatedSlides = data.updated_slides.map((slide: any, slideIndex: number) => {
          const backgroundStyle = backgroundStyles[slideIndex % backgroundStyles.length];
          return {
            ...slide,
            background:
              backgroundStyle.type === "gradient"
                ? { type: "gradient", gradient: backgroundStyle.value }
                : { type: "solid", color: backgroundStyle.value },
            elements: (slide.elements || []).map((el: any) => ({
              ...el,
              style: {
                ...el.style,
                color:
                  backgroundStyle.type === "gradient" ||
                  backgroundStyle.value.includes("bg-gray-900") ||
                  backgroundStyle.value.includes("bg-blue-900")
                    ? "#FFFFFF"
                    : el.style.color,
              },
            })),
          };
        });

        setSlides(updatedSlides);
        
        toast({
          title: "Slide Duplicated",
          description: "Slide has been copied and saved successfully.",
        });
      } else {
        throw new Error(data.error || "Failed to duplicate slide");
      }
    } catch (error: any) {
      console.error("Error duplicating slide:", error);
      toast({
        title: "Duplication Failed",
        description: error.message || "There was an error duplicating the slide.",
        variant: "destructive",
      });
    }
  }

  // Generate presentation with AI via Flask backend
  const generatePresentation = async () => {
    if (!generateTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your presentation.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Check if PPT API is available first
    const PPT_API_URL = import.meta.env.VITE_PPT_API_URL;
    if (!PPT_API_URL) {
      toast({
        title: "Configuration Error",
        description: "PPT API URL not configured. Please check your environment variables.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    try {
      const PPT_API_URL = import.meta.env.VITE_PPT_API_URL;
      
      if (!PPT_API_URL) {
        throw new Error("PPT API URL not configured. Please check your environment variables.")
      }
      
      console.log("Attempting to connect to PPT API at:", PPT_API_URL)
      
      // Check if the PPT API is available
      try {
        const healthResponse = await fetch(`${PPT_API_URL}/health`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!healthResponse.ok) {
          throw new Error(`PPT API health check failed: ${healthResponse.status}`);
        }
        
        const healthData = await healthResponse.json();
        console.log("PPT API health check:", healthData);
      } catch (healthError) {
        console.error("PPT API health check failed:", healthError);
        toast({
          title: "Service Unavailable",
          description: "The AI presentation service is currently unavailable. Please try again later.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }
      
      const createResponse = await fetch(`${PPT_API_URL}/create_presentation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: generateTopic,
          slides: slideCount,
        }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `Failed to initiate presentation generation. Status: ${createResponse.status}`)
      }

      const createData = await createResponse.json()
      console.log("Backend create_presentation response:", createData)

      if (!createData.success || !createData.presentation_id) {
        console.error("Invalid create_presentation response:", createData)
        throw new Error(createData.error || "Backend did not return a valid presentation ID.")
      }

      const newPresentationId = createData.presentation_id
      setPresentationId(newPresentationId)
      setPresentationTopic(createData.topic)

      const getJsonResponse = await fetch(`${PPT_API_URL}/get_presentation_json/${newPresentationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!getJsonResponse.ok) {
        const errorData = await getJsonResponse.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `Failed to retrieve presentation JSON. Status: ${getJsonResponse.status}`)
      }

      const getJsonData = await getJsonResponse.json()
      console.log("Backend get_presentation_json response:", getJsonData)

      if (
        !getJsonData.success ||
        !getJsonData.json_data ||
        !getJsonData.json_data.slides ||
        !Array.isArray(getJsonData.json_data.slides) ||
        getJsonData.json_data.slides.length === 0
      ) {
        console.error("Invalid response structure:", getJsonData)
        throw new Error(getJsonData.error || "Retrieved presentation JSON is empty or malformed.")
      }

      const convertedSlides = getJsonData.json_data.slides.map((slide: any, index: number) => {
        const backgroundStyle = backgroundStyles[index % backgroundStyles.length]
        
        // Convert AI format (title, content, description) to frontend format (elements)
        const elements: SlideElement[] = []
        
        // Add title element
        if (slide.title) {
          elements.push({
            type: "title",
            content: slide.title,
            position: { left: 50, top: 50, width: 800, height: 100 },
            style: {
              font_size: 32,
              font_weight: "bold",
              color: "#FFFFFF",
              alignment: "center"
            }
          })
        }
        
        // Add content elements (bullet points)
        if (slide.content && Array.isArray(slide.content)) {
          slide.content.forEach((item: string, contentIndex: number) => {
            if (item && typeof item === 'string' && item.trim()) {
              elements.push({
                type: "text",
                content: item,
                position: { 
                  left: 100, 
                  top: 150 + (contentIndex * 60), 
                  width: 700, 
                  height: 50 
                },
                style: {
                  font_size: 18,
                  font_weight: "normal",
                  color: "#FFFFFF",
                  alignment: "left"
                }
              })
            }
          })
        }
        
        // If no elements were created, add a default text element
        if (elements.length === 0) {
          elements.push({
            type: "text",
            content: slide.description || "No content available",
            position: { left: 50, top: 150, width: 800, height: 100 },
            style: {
              font_size: 18,
              font_weight: "normal",
              color: "#FFFFFF",
              alignment: "center"
            }
          })
        }
        
        const convertedSlide = {
          id: `slide-${index + 1}`,
          slide_number: index + 1,
          layout_type: "title_and_content",
          background:
            backgroundStyle.type === "gradient"
              ? { type: "gradient", gradient: backgroundStyle.value }
              : { type: "solid", color: backgroundStyle.value },
          elements: elements
        }
        
        return convertedSlide;
      })

      setSlides(convertedSlides)
      setCurrentSlideIndex(0)
      setPresentationId(newPresentationId)
      setPresentationTopic(createData.topic)

      // Immediately save to DB after generation with rich converted data
      if (newPresentationId && createData.topic) {
        const richJsonData = {
          slides: convertedSlides,
          topic: createData.topic,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await savePresentation(newPresentationId, createData.topic, richJsonData);
      }

      toast({
        title: "Presentation Generated",
        description: `Successfully created ${convertedSlides.length} slides about ${createData.topic}.`,
      })
    } catch (error: any) {
      console.error("Error generating presentation:", error)
      
      // If the AI service fails, offer to create a simple presentation locally
      if (error.message.includes("Service Unavailable") || error.message.includes("Failed to connect")) {
        const createSimple = window.confirm(
          "The AI service is unavailable. Would you like to create a simple presentation template instead?"
        );
        
        if (createSimple) {
          createSimplePresentation();
        }
      } else {
        // Set error state for critical errors
        setHasError(true);
        setErrorMessage(error.message || "An unexpected error occurred while generating the presentation.");
        toast({
          title: "Generation Failed",
          description: error.message || "There was an error generating your presentation.",
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
      setShowGenerateDialog(false)
      setGenerateTopic("")
    }
  }

  // Create a simple presentation template when AI service is unavailable
  const createSimplePresentation = () => {
    const simpleSlides = [
      {
        id: "slide-1",
        slide_number: 1,
        layout_type: "title",
        background: { type: "gradient", gradient: "from-purple-600 via-blue-600 to-indigo-700" },
        elements: [
          {
            type: "title",
            content: generateTopic || "New Presentation",
            position: { left: 50, top: 50, width: 800, height: 100 },
            style: { font_size: 32, font_weight: "bold", color: "#FFFFFF", alignment: "center" }
          },
          {
            type: "text",
            content: "Created with CoXist AI",
            position: { left: 50, top: 200, width: 800, height: 50 },
            style: { font_size: 18, font_weight: "normal", color: "#FFFFFF", alignment: "center" }
          }
        ]
      },
      {
        id: "slide-2",
        slide_number: 2,
        layout_type: "content",
        background: { type: "gradient", gradient: "from-green-600 via-blue-600 to-purple-700" },
        elements: [
          {
            type: "title",
            content: "Key Points",
            position: { left: 50, top: 50, width: 800, height: 100 },
            style: { font_size: 28, font_weight: "bold", color: "#FFFFFF", alignment: "center" }
          },
          {
            type: "bullet_list",
            items: ["Add your first point here", "Add your second point here", "Add your third point here"],
            position: { left: 100, top: 150, width: 700, height: 200 },
            style: { font_size: 18, font_weight: "normal", color: "#FFFFFF", alignment: "left" }
          }
        ]
      }
    ];

    setSlides(simpleSlides);
    setCurrentSlideIndex(0);
    setPresentationId(`local-${Date.now()}`);
    setPresentationTopic(generateTopic || "New Presentation");

    toast({
      title: "Simple Presentation Created",
      description: "A basic presentation template has been created. You can now edit it manually.",
    });
  }

  // Export presentation via Flask backend
  const exportPresentation = async (format: string) => {
    if (!presentationId) {
      toast({
        title: "No Presentation to Export",
        description: "Please generate a presentation first.",
        variant: "destructive",
      })
      return
    }

    setShowExportDialog(false)
    setIsDownloading(true)

    try {
      const PPT_API_URL = import.meta.env.VITE_PPT_API_URL;
      const response = await fetch(`${PPT_API_URL}/export_ppt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presentationId: presentationId,
          format: format,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to export presentation")
      }

      const blob = await response.blob()
      const sanitizedTopic = presentationTopic.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      const filename = `${sanitizedTopic || "presentation"}.${format}`

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: `${format.toUpperCase()} Download Complete`,
        description: `Your presentation has been downloaded as ${format.toUpperCase()}.`,
      })
    } catch (error: any) {
      console.error("Error exporting presentation:", error)
      toast({
        title: "Download Failed",
        description: error.message || "There was an error downloading your presentation.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // Navigation
  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  // Get background classes for slide
  const getSlideBackgroundClasses = (slide: Slide | null) => {
    if (!slide || !slide.background) {
      return "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"
    }
    
    if (slide.background.type === "gradient" && slide.background.gradient) {
      return `bg-gradient-to-br ${slide.background.gradient}`
    } else if (slide.background.type === "solid" && slide.background.color) {
      return slide.background.color
    }
    return "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"
  }

  // Render individual slide elements
  const renderSlideElements = (elements: SlideElement[], isFullscreen: boolean, slideNumber: number, slide: Slide | null) => {
    if (!elements || elements.length === 0) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-white text-lg">No slide content available</p>
        </div>
      )
    }
    const textElements = elements.filter(
      (el) => el.type === "title" || el.type === "text" || el.type === "bullet_list" || el.type === "subtitle",
    )
    const imageElements = elements.filter((el) => el.type === "image")

    const isTwoColumnLayout = imageElements.length > 0 && textElements.length > 0
    


    return (
      <div
        className={`h-full w-full relative flex flex-col justify-center items-center ${
          isTwoColumnLayout ? "md:grid md:grid-cols-2 md:gap-12" : "space-y-6"
        } ${isFullscreen ? "p-16" : "p-8"}`}
      >

        <div
          className={`absolute bottom-4 right-4 text-sm font-bold bg-black/50 px-3 py-1 rounded-full z-10 text-white`}
        >
          {slideNumber}
        </div>

        {isTwoColumnLayout ? (
          <>
            <div className="flex flex-col justify-center space-y-4 md:col-span-1">
              {textElements.map((element, elIndex) => {
                const baseStyle: React.CSSProperties = {
                  fontSize: element.style?.font_size
                    ? `${isFullscreen ? Math.min(element.style.font_size * 1.2, 36) : Math.min(element.style.font_size, 28)}px`
                    : undefined,
                  fontWeight: element.style?.font_weight || undefined,
                  color: element.style?.color || "#FFFFFF",
                  textAlign: element.style?.alignment || "left",
                }

                switch (element.type) {
                  case "title":
                    return (
                      <h1
                        key={elIndex}
                        className={`${isFullscreen ? "text-3xl" : "text-2xl"} font-bold leading-tight mb-4`}
                        style={baseStyle}
                      >
                        {element.content}
                      </h1>
                    )
                  case "subtitle":
                    return (
                      <p
                        key={elIndex}
                        className={`${isFullscreen ? "text-xl" : "text-lg"} leading-tight mb-3`}
                        style={baseStyle}
                      >
                        {element.content}
                      </p>
                    )
                  case "text":
                    return (
                      <p
                        key={elIndex}
                        className={`${isFullscreen ? "text-lg" : "text-base"} leading-relaxed`}
                        style={baseStyle}
                      >
                        {element.content}
                      </p>
                    )
                  case "bullet_list":
                    return (
                      <ul
                        key={elIndex}
                        className={`${isFullscreen ? "text-lg" : "text-base"} leading-relaxed list-disc list-inside text-left space-y-2`}
                        style={baseStyle}
                      >
                        {element.items?.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    )
                  default:
                    return null
                }
              })}
            </div>
            <div className="flex items-center justify-center md:col-span-1">
              {imageElements.map((element, elIndex) => (
                <img
                  key={elIndex}
                  src={element.src || "/placeholder.svg"}
                  alt={element.alt || `Slide image ${elIndex + 1}`}
                  className="w-full h-auto object-contain rounded-lg shadow-lg"
                  style={{
                    maxWidth: isFullscreen ? "85%" : "90%",
                    maxHeight: isFullscreen ? "400px" : "280px",
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {elements.map((element, elIndex) => {
            const baseStyle: React.CSSProperties = {
              fontSize: element.style?.font_size
                ? `${isFullscreen ? Math.min(element.style.font_size * 1.3, 48) : Math.min(element.style.font_size, 32)}px`
                : undefined,
              fontWeight: element.style?.font_weight || undefined,
              color: element.style?.color || "#FFFFFF",
              textAlign: element.style?.alignment || undefined,
            }

            switch (element.type) {
              case "title":
                return (
                  <h1
                    key={elIndex}
                    className={`${isFullscreen ? "text-4xl" : "text-3xl"} font-bold leading-tight mb-6`}
                    style={baseStyle}
                  >
                    {element.content}
                  </h1>
                )
              case "subtitle":
                return (
                  <p
                    key={elIndex}
                    className={`${isFullscreen ? "text-2xl" : "text-xl"} leading-tight mb-4`}
                    style={baseStyle}
                  >
                    {element.content}
                  </p>
                )
              case "text":
                return (
                  <p
                    key={elIndex}
                    className={`${isFullscreen ? "text-xl" : "text-lg"} max-w-4xl mx-auto leading-relaxed mb-4`}
                    style={baseStyle}
                  >
                    {element.content}
                  </p>
                )
              case "bullet_list":
                return (
                  <ul
                    key={elIndex}
                    className={`${isFullscreen ? "text-xl" : "text-lg"} max-w-4xl mx-auto leading-relaxed list-disc list-inside text-left space-y-2 mb-4`}
                    style={baseStyle}
                  >
                    {element.items?.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )
              case "image":
                return (
                  <img
                    key={elIndex}
                    src={element.src || "/placeholder.svg"}
                    alt={element.alt || `Slide image ${elIndex + 1}`}
                    className="w-full h-auto object-contain rounded-lg shadow-lg"
                    style={{
                      maxWidth: isFullscreen ? "70%" : "60%",
                      maxHeight: isFullscreen ? "450px" : "300px",
                    }}
                  />
                )
              default:
                return null
            }
          })}
          </>
        )}
      </div>
    )
  }

  // Fetch saved presentations on mount
  useEffect(() => {
    const fetchPresentations = async () => {
      setIsLoadingPresentations(true);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/presentations`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch presentations');
        const data = await res.json();
        setSavedPresentations(data);
      } catch (e) {
        setSavedPresentations([]);
      } finally {
        setIsLoadingPresentations(false);
      }
    };
    fetchPresentations();
  }, []);

  // Auto-load the most recent saved presentation if available
  useEffect(() => {
    // Only auto-load if we don't have any slides or if we're not in the middle of generation
    if (!isLoadingPresentations && savedPresentations.length > 0 && !isGenerating && slides.length === 0) {
      const mostRecent = savedPresentations[0];
      setSlides(mostRecent.json_data.slides);
      setPresentationId(mostRecent.id);
      setPresentationTopic(mostRecent.topic);
      setCurrentSlideIndex(0);
    }
  }, [isLoadingPresentations, savedPresentations, isGenerating, slides.length]);

  // Load a saved presentation
  const loadPresentation = async (id: string) => {
    setIsLoadingSlides(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/presentations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch presentation');
      const data = await res.json();
      
      // Convert slides to frontend format if needed
      const convertedSlides = data.json_data.slides.map((slide: any, index: number) => {
        const backgroundStyle = backgroundStyles[index % backgroundStyles.length]
        
        // If slide already has elements (frontend format), use it as is
        if (slide.elements && Array.isArray(slide.elements)) {
          return {
            ...slide,
            background:
              backgroundStyle.type === "gradient"
                ? { type: "gradient", gradient: backgroundStyle.value }
                : { type: "solid", color: backgroundStyle.value },
          }
        }
        
        // Convert AI format (title, content, description) to frontend format (elements)
        const elements: SlideElement[] = []
        
        // Add title element
        if (slide.title) {
          elements.push({
            type: "title",
            content: slide.title,
            position: { left: 50, top: 50, width: 800, height: 100 },
            style: {
              font_size: 32,
              font_weight: "bold",
              color: "#FFFFFF",
              alignment: "center"
            }
          })
        }
        
        // Add content elements (bullet points)
        if (slide.content && Array.isArray(slide.content)) {
          slide.content.forEach((item: string, contentIndex: number) => {
            if (item && typeof item === 'string' && item.trim()) {
              elements.push({
                type: "text",
                content: item,
                position: { 
                  left: 100, 
                  top: 150 + (contentIndex * 60), 
                  width: 700, 
                  height: 50 
                },
                style: {
                  font_size: 18,
                  font_weight: "normal",
                  color: "#FFFFFF",
                  alignment: "left"
                }
              })
            }
          })
        }
        
        // If no elements were created, add a default text element
        if (elements.length === 0) {
          elements.push({
            type: "text",
            content: slide.description || "No content available",
            position: { left: 50, top: 150, width: 800, height: 100 },
            style: {
              font_size: 18,
              font_weight: "normal",
              color: "#FFFFFF",
              alignment: "center"
            }
          })
        }
        
        return {
          id: slide.id || `slide-${index + 1}`,
          slide_number: slide.slide_number || index + 1,
          layout_type: slide.layout_type || "title_and_content",
          background:
            backgroundStyle.type === "gradient"
              ? { type: "gradient", gradient: backgroundStyle.value }
              : { type: "solid", color: backgroundStyle.value },
          elements: elements
        }
      })
      
      setSlides(convertedSlides);
      setPresentationId(data.id);
      setPresentationTopic(data.topic);
      setCurrentSlideIndex(0);
    } catch (e) {
      console.error("Error loading presentation:", e);
      toast({ title: 'Load Failed', description: 'Could not load presentation.', variant: 'destructive' });
    } finally {
      setIsLoadingSlides(false);
    }
  };

  // Save a new presentation after generation
  const savePresentation = async (id: string, topic: string, json_data: any) => {
    setIsSaving(true);
    try {
      // Save to Express backend (database)
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/presentations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, topic, json_data })
      });
      if (!res.ok) throw new Error('Failed to save presentation');
      const created = await res.json();
      setSavedPresentations(prev => [created, ...prev]);
      
      // Also save rich data to Flask service for enhanced PowerPoint export
      const PPT_API_URL = import.meta.env.VITE_PPT_API_URL;
      if (PPT_API_URL) {
        try {
          await fetch(`${PPT_API_URL}/update_presentation_data/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json_data })
          });
        } catch (flaskError) {
          console.warn('Could not update Flask service with rich data:', flaskError);
        }
      }
      
      toast({ title: 'Presentation Saved', description: 'Presentation saved to your account.' });
    } catch (e) {
      toast({ title: 'Save Failed', description: 'Could not save presentation.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Update an existing presentation (PUT)
  const updatePresentation = async (id: string, topic: string, json_data: any) => {
    setIsSaving(true);
    try {
      // Update in Express backend (database)
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/presentations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic, json_data })
      });
      if (!res.ok) throw new Error('Failed to update presentation');
      const updated = await res.json();
      setSavedPresentations(prev => prev.map(p => p.id === id ? updated : p));
      
      // Also update rich data in Flask service for enhanced PowerPoint export
      const PPT_API_URL = import.meta.env.VITE_PPT_API_URL;
      if (PPT_API_URL) {
        try {
          await fetch(`${PPT_API_URL}/update_presentation_data/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json_data })
          });
        } catch (flaskError) {
          console.warn('Could not update Flask service with rich data:', flaskError);
        }
      }
      
      toast({ title: 'Saved!', description: 'Presentation updated.' });
    } catch (e) {
      toast({ title: 'Save Failed', description: 'Could not update presentation.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save on edit
  const debouncedSave = (id: string, topic: string, json_data: any) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updatePresentation(id, topic, json_data);
    }, 1000);
  };

  // Delete a presentation
  const deletePresentation = async (id: string) => {
    setIsLoadingPresentations(true);
    try {
      // First, delete from Flask service (R2 storage)
      const PPT_API_URL = import.meta.env.VITE_PPT_API_URL;
      const flaskRes = await fetch(`${PPT_API_URL}/delete_presentation/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Then delete from Express backend (database)
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/presentations/${id}`, { 
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) throw new Error('Failed to delete presentation from database');
      
      setSavedPresentations(prev => prev.filter(p => p.id !== id));
      
      if (presentationId === id) {
        // If deleted presentation is active, load another or fallback
        const remaining = savedPresentations.filter(p => p.id !== id);
        if (remaining.length > 0) {
          loadPresentation(remaining[0].id);
        } else {
          setSlides([
            {
              id: "1",
              slide_number: 1,
              layout_type: "title",
              background: { type: "gradient", gradient: "from-purple-600 via-blue-600 to-indigo-700" },
              elements: [
                {
                  type: "title",
                  content: "Welcome to AI Presentations",
                  position: { left: 0, top: 0, width: 0, height: 0 },
                  style: { font_size: 40, font_weight: "bold", color: "#FFFFFF", alignment: "center" },
                },
                {
                  type: "text",
                  content: "Generate stunning slides with AI",
                  position: { left: 0, top: 0, width: 0, height: 0 },
                  style: { font_size: 20, font_weight: "normal", color: "#FFFFFF", alignment: "center" },
                },
              ],
            },
          ]);
          setPresentationId(null);
          setPresentationTopic("AI Presentation");
          setCurrentSlideIndex(0);
        }
      }
      
      toast({ title: "Deleted", description: "Presentation deleted from storage and database." });
    } catch (e) {
      console.error('Error deleting presentation:', e);
      toast({ title: "Delete Failed", description: "Could not delete presentation.", variant: "destructive" });
    } finally {
      setIsLoadingPresentations(false);
      setPendingDeletePresentation(null);
    }
  };

  // --- Slide delete API integration ---
  const deleteSlide = async (index: number) => {
    if (slides.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You need at least one slide in your presentation.",
        variant: "destructive",
      });
      setPendingDeleteSlide(null);
      return;
    }

    if (!presentationId) {
      toast({
        title: "No Presentation",
        description: "Please generate or load a presentation first.",
        variant: "destructive",
      });
      setPendingDeleteSlide(null);
      return;
    }

    try {
      const PPT_API_URL = import.meta.env.VITE_PPT_API_URL;
      const response = await fetch(`${PPT_API_URL}/slide_operations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "delete",
          presentation_id: presentationId,
          slide_index: index,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete slide");
      }

      const data = await response.json();
      
      if (data.success && data.updated_slides && Array.isArray(data.updated_slides)) {
        // Update local state with the new slides
        const updatedSlides = data.updated_slides.map((slide: any, slideIndex: number) => {
          const backgroundStyle = backgroundStyles[slideIndex % backgroundStyles.length];
          return {
            ...slide,
            background:
              backgroundStyle.type === "gradient"
                ? { type: "gradient", gradient: backgroundStyle.value }
                : { type: "solid", color: backgroundStyle.value },
            elements: (slide.elements || []).map((el: any) => ({
              ...el,
              style: {
                ...el.style,
                color:
                  backgroundStyle.type === "gradient" ||
                  backgroundStyle.value.includes("bg-gray-900") ||
                  backgroundStyle.value.includes("bg-blue-900")
                    ? "#FFFFFF"
                    : el.style.color,
              },
            })),
          };
        });

        setSlides(updatedSlides);
        
        // Adjust current slide index if needed
        if (currentSlideIndex >= updatedSlides.length) {
          setCurrentSlideIndex(Math.max(0, updatedSlides.length - 1));
        }
        
        toast({ 
          title: "Slide Deleted", 
          description: "Slide has been removed and saved successfully." 
        });
      } else {
        throw new Error(data.error || "Failed to delete slide");
      }
    } catch (error: any) {
      console.error("Error deleting slide:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "There was an error deleting the slide.",
        variant: "destructive",
      });
    }
    
    setPendingDeleteSlide(null);
  };

  // --- Keyboard navigation for fullscreen mode ---
  const [showArrowHint, setShowArrowHint] = useState(false);
  useEffect(() => {
    if (isPreviewMode) {
      setShowArrowHint(true);
      const timeout = setTimeout(() => setShowArrowHint(false), 3000);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isPreviewMode, currentSlideIndex, slides.length]);

  // Render loading state while fetching presentations
  if (isLoadingPresentations) {
    return (
      <main className="relative z-10 pt-20 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-lg text-slate-600 dark:text-slate-300">Loading your presentations…</div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 pt-16 min-h-screen bg-black text-white overflow-hidden">
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <motion.h1
            className="text-3xl font-bold mb-3 text-white flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Presentation className="w-7 h-7 mr-2 text-blue-400" />
            AI Presentations Studio
          </motion.h1>
          <motion.p
            className="text-gray-400 mb-4 flex items-center justify-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Sparkles className="w-3 h-3 mr-1 text-green-400" />
            Create stunning presentations with AI assistance and professional templates
          </motion.p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <GlassmorphismButton
              onClick={() => setShowExportDialog(true)}
              variant="outline"
              className="px-6 py-3 hover-lift"
              disabled={!presentationId}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </GlassmorphismButton>
            <GlassmorphismButton
              onClick={() => setShowGenerateDialog(true)}
              variant="outline"
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-emerald-400 hover:border-emerald-300 font-semibold shadow-lg hover-lift"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Generate
            </GlassmorphismButton>
          </div>
        </div>

        <AnimatePresence>
          {isPreviewMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black"
            >
              {showArrowHint && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-xl shadow-lg text-lg font-medium z-50"
                >
                  Use ← and → arrow keys to navigate slides
                </motion.div>
              )}
              <div className="w-screen h-screen flex items-center justify-center">
                <div
                  className={`w-full h-full flex flex-col justify-center overflow-hidden ${getSlideBackgroundClasses(currentSlide)}`}
                >
                  {renderSlideElements(currentSlide?.elements || [], true, currentSlide?.slide_number || 1, currentSlide)}
                </div>
              </div>

              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 bg-black/70 backdrop-blur-sm rounded-2xl px-8 py-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={prevSlide}
                  disabled={currentSlideIndex === 0}
                  className="text-white hover:bg-white/20 px-6 py-3 text-lg disabled:opacity-30"
                >
                  <ChevronLeft className="w-6 h-6 mr-2" />
                  Previous
                </Button>
                <div className="flex items-center space-x-4">
                  <span className="text-white bg-white/20 px-6 py-2 rounded-lg text-lg font-medium">
                    {currentSlideIndex + 1} / {slides.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={nextSlide}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="text-white hover:bg-white/20 px-6 py-3 text-lg disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
                <div className="border-l border-white/30 pl-6 ml-2">
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className="text-white hover:bg-white/20 px-6 py-3 text-lg rounded-lg transition-all duration-200 flex items-center"
                  >
                    <Minimize2 className="w-6 h-6 mr-2" />
                    Exit
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 text-white">Your Saved Presentations</h2>
          {isLoadingPresentations ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 glassmorphism rounded-lg border border-gray-700 shadow">
                  <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-3 w-1/3 bg-gray-800 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-8 rounded bg-gray-800 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : savedPresentations.length === 0 ? (
            <div className="text-gray-400">No saved presentations yet.</div>
          ) : (
            <div className="space-y-3">
              {savedPresentations.map((pres) => (
                <div key={pres.id} className={`flex items-center gap-4 p-4 glassmorphism rounded-lg border border-gray-700 shadow transition-all group ${pres.id === presentationId ? 'ring-2 ring-blue-400 border-blue-500' : ''}`}> 
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {pres.topic?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold text-white">{pres.topic}</div>
                    <div className="text-xs text-gray-400 truncate">{pres.created_at ? new Date(pres.created_at).toLocaleString() : ''}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50 backdrop-blur-sm"
                      aria-label="Load presentation"
                      onClick={() => loadPresentation(pres.id)}
                      disabled={pres.id === presentationId || isLoadingSlides}
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300"
                          aria-label="Delete presentation"
                          disabled={isLoadingSlides}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900/95 backdrop-blur-sm border-slate-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Presentation?</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-300">
                            Are you sure you want to delete <span className="font-semibold text-white">{pres.topic}</span>? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-600">Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { setPendingDeletePresentation(pres.id); deletePresentation(pres.id); }}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`grid lg:grid-cols-3 gap-8 ${isPreviewMode ? "hidden" : ""}`}>
          <div className="lg:col-span-2">
            <motion.div
              className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-2xl min-h-[500px]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {isLoadingSlides ? (
                <div className="space-y-6">
                  <Skeleton className="h-8 w-1/3 mb-2 bg-slate-700" />
                  <Skeleton className="h-96 w-full rounded-lg bg-slate-700" />
                  <div className="flex space-x-2 mt-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-24 rounded bg-slate-700" />)}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={prevSlide} disabled={currentSlideIndex === 0} className="text-slate-300 hover:text-white hover:bg-slate-700">
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
                        className="text-slate-300 hover:text-white hover:bg-slate-700"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GlassmorphismButton onClick={() => setIsPreviewMode(true)} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50">
                        <Eye className="w-4 h-4 mr-1" />
                        Fullscreen
                      </GlassmorphismButton>
                    </div>
                  </div>

                  <motion.div
                    className={`w-full rounded-lg border border-slate-600/50 overflow-hidden shadow-xl ${getSlideBackgroundClasses(currentSlide)}`}
                    style={{
                      aspectRatio: "16/9",
                      minHeight: "400px",
                      maxHeight: "500px",
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderSlideElements(currentSlide?.elements || [], false, currentSlide?.slide_number || 1, currentSlide)}
                  </motion.div>

                  <div className="flex space-x-2 overflow-x-auto pb-2 mt-4">
                    {slides.map((slide, index) => (
                      <motion.div
                        key={slide.id}
                        className={`relative flex-shrink-0 w-24 h-16 glassmorphism rounded cursor-pointer transition-all group overflow-hidden ${
                          currentSlideIndex === index ? "border-2 border-blue-500" : "opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setCurrentSlideIndex(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div
                          className={`w-full h-full rounded flex items-center justify-center p-1 relative ${getSlideBackgroundClasses(slide)}`}
                        >
                          <span className="text-[8px] font-bold absolute top-0.5 left-0.5 z-10 text-white">
                            {index + 1}
                          </span>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                            {(slide.elements || []).map((el, elIdx) => {
                              if (el.type === "title" && el.content) {
                                return (
                                  <p key={`${slide.id}-title-${elIdx}`} className="text-[6px] font-bold leading-tight truncate w-full text-white">
                                    {el.content}
                                  </p>
                                )
                              }
                              if (el.type === "subtitle" && el.content) {
                                return (
                                  <p key={`${slide.id}-subtitle-${elIdx}`} className="text-[5px] leading-tight truncate w-full text-white">
                                    {el.content}
                                  </p>
                                )
                              }
                              if ((el.type === "text" || el.type === "bullet_list") && (el.content || el.items)) {
                                const contentText = el.content || (el.items ? el.items[0] : "")
                                return (
                                  <p key={`${slide.id}-text-${elIdx}`} className="text-[4px] truncate w-full text-white">
                                    {contentText}
                                  </p>
                                )
                              }
                              if (el.type === "image" && el.src) {
                                return (
                                  <img
                                    key={`${slide.id}-image-${elIdx}`}
                                    src={el.src || "/placeholder.svg"}
                                    alt="thumb"
                                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                                  />
                                )
                              }
                              return null
                            })}
                          </div>

                          <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity space-x-0.5 z-20">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 bg-black/50 hover:bg-black/70 text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateSlide(index)
                              }}
                            >
                              <Copy className="w-2 h-2" />
                            </Button>
                            {slides.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 bg-black/50 hover:bg-black/70 text-red-400 hover:text-red-300"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPendingDeleteSlide(index)
                                }}
                              >
                                <Trash2 className="w-2 h-2" />
                              </Button>
                            )}
                            <AlertDialog open={pendingDeleteSlide === index} onOpenChange={(open) => { if (!open) setPendingDeleteSlide(null) }}>
                              <AlertDialogContent className="bg-slate-900/95 backdrop-blur-sm border-slate-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Delete Slide?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-300">
                                    Are you sure you want to delete this slide? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-600">Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteSlide(index)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <motion.div
                      className="flex-shrink-0 w-24 h-16 glassmorphism rounded cursor-pointer flex items-center justify-center hover:bg-white/10 transition-colors"
                      onClick={addSlide}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-6 h-6 text-slate-600 dark:text-white" />
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 space-y-6 border border-slate-700/50 min-h-[300px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {isLoadingSlides ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2 bg-slate-700" />
                  <Skeleton className="h-6 w-1/2 bg-slate-700" />
                  <Skeleton className="h-24 w-full bg-slate-700" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Edit Slide</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Title</Label>
                      <Input
                        value={editorTitle}
                        onChange={(e) => updateSlideContent("title", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300">Subtitle</Label>
                      <Input
                        value={editorSubtitle}
                        onChange={(e) => updateSlideContent("subtitle", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500"
                        placeholder="Add a subtitle (for title slide)"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300">Content</Label>
                      <Textarea
                        value={editorContent}
                        onChange={(e) => updateSlideContent("content", e.target.value)}
                        className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500 min-h-[120px]"
                        placeholder="Enter slide content or bullet points..."
                      />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>

        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-sm border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Export Presentation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-slate-300">Choose your export format:</p>
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
                  <span>{isDownloading ? "Generating..." : "PPTX"}</span>
                </Button>
              </div>
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

        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-sm border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Generate AI Presentation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Topic</Label>
                <Input
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                  placeholder="e.g., Climate Change, Machine Learning, History of Art..."
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500"
                />
              </div>
              <div>
                <Label className="text-slate-300">Number of Slides</Label>
                <Input
                  type="number"
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number.parseInt(e.target.value) || 5)}
                  min="3"
                  max="20"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500"
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
      </div>
    </main>
  )
}

export default AIPresentations
