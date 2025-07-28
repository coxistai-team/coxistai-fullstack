import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Palette,
  Type,
  Download,
  Heading1,
  Heading2,
  Heading3,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useState, useCallback, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { forwardRef, useImperativeHandle } from 'react';

interface RichTextEditorProps {
  content?: string
  onUpdate?: (content: string) => void
  title?: string
  className?: string
  mode?: 'simple' | 'rich' // Add mode prop
}

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat'
]

const fontSizes = [
  '8px',
  '10px',
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '48px'
]

const textFormats = [
  { label: 'Body', value: 'paragraph', icon: null },
  { label: 'Title', value: 'heading-1', level: 1, icon: Heading1 },
  { label: 'Heading', value: 'heading-2', level: 2, icon: Heading2 },
  { label: 'Subheading', value: 'heading-3', level: 3, icon: Heading3 },
]

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000', '#800000'
]

// Simple Text Editor Component (Google Keep Style)
const SimpleTextEditor: React.FC<{
  content: string
  onUpdate: (content: string) => void
  placeholder?: string
  className?: string
}> = ({ content, onUpdate, placeholder = "Take a note...", className = "" }) => {
  const [localContent, setLocalContent] = useState(content)
  const [isSaving, setIsSaving] = useState(false)

  // Debounced auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localContent !== content) {
        setIsSaving(true)
        onUpdate(localContent)
        setTimeout(() => setIsSaving(false), 500)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [localContent, content, onUpdate])

  return (
    <div className={`relative ${className}`}>
      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-white placeholder:text-slate-400 focus:outline-none resize-none border-none p-0 text-base leading-relaxed"
        style={{
          minHeight: '400px',
          fontFamily: 'inherit',
          fontSize: '16px',
          lineHeight: '1.6'
        }}
      />
      {isSaving && (
        <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-slate-400">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
          <span>Saving...</span>
        </div>
      )}
    </div>
  )
}

const RichTextEditor = forwardRef(function RichTextEditor({ content = '', onUpdate, title = 'Untitled Note', className = '', mode = 'rich' }: RichTextEditorProps, ref) {
  // If mode is simple, render the Google Keep-style editor
  if (mode === 'simple') {
    return (
      <SimpleTextEditor
        content={content}
        onUpdate={onUpdate || (() => {})}
        placeholder="Take a note..."
        className={className}
      />
    )
  }

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [lastSavedContent, setLastSavedContent] = useState(content)
  const [isSaving, setIsSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      ListItem,
      BulletList.configure({
        HTMLAttributes: {
          class: 'tiptap-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'tiptap-ordered-list',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML()
      setLastSavedContent(newContent)
      
      // Debounced auto-save
      if (onUpdate) {
        setIsSaving(true)
        setTimeout(() => {
          onUpdate(newContent)
          setIsSaving(false)
        }, 1000) // Save after 1 second of inactivity
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] p-6 bg-transparent text-white focus:outline-none',
      },
    },
  })

  const setFontFamily = useCallback((fontFamily: string) => {
    if (editor) {
      editor.chain().focus().setFontFamily(fontFamily).run()
    }
  }, [editor])

  const setFontSize = useCallback((fontSize: string) => {
    if (editor) {
      const selection = editor.state.selection
      if (selection.empty) {
        // If no text is selected, set the mark for future typing
        editor.chain().focus().setMark('textStyle', { fontSize }).run()
      } else {
        // If text is selected, apply the font size to the selection
        editor.chain().focus().setMark('textStyle', { fontSize }).run()
      }
    }
  }, [editor])

  const setTextFormat = useCallback((format: any) => {
    if (!editor) return
    
    if (format.value === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else if (format.value.startsWith('heading-')) {
      const level = parseInt(format.value.split('-')[1])
      editor.chain().focus().setHeading({ level }).run()
    }
  }, [editor])

  const getCurrentFormat = useCallback(() => {
    if (!editor) return textFormats[0]
    
    if (editor.isActive('heading', { level: 1 })) {
      return textFormats.find(f => f.value === 'heading-1') || textFormats[0]
    } else if (editor.isActive('heading', { level: 2 })) {
      return textFormats.find(f => f.value === 'heading-2') || textFormats[0]
    } else if (editor.isActive('heading', { level: 3 })) {
      return textFormats.find(f => f.value === 'heading-3') || textFormats[0]
    }
    
    return textFormats[0] // Body/paragraph
  }, [editor])

  const setColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run()
    }
  }, [editor])

  const setHighlight = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setHighlight({ color }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      if (linkText) {
        editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run()
      } else {
        editor.chain().focus().setLink({ href: linkUrl }).run()
      }
      setLinkUrl('')
      setLinkText('')
      setIsLinkDialogOpen(false)
    }
  }, [editor, linkUrl, linkText])

  const exportToPDF = useCallback(async () => {
    if (!editor) return

    const editorElement = document.querySelector('.ProseMirror')
    if (!editorElement) return

    try {
      // Create a temporary container for better export
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = '800px' // Fixed width for consistent formatting
      tempContainer.style.backgroundColor = '#ffffff'
      tempContainer.style.color = '#000000'
      tempContainer.style.padding = '40px'
      tempContainer.style.fontFamily = 'Arial, sans-serif'
      tempContainer.style.lineHeight = '1.6'
      
      // Clone the editor content
      const clonedContent = editorElement.cloneNode(true) as HTMLElement
      
      // Apply export-specific styles
      clonedContent.style.backgroundColor = '#ffffff'
      clonedContent.style.color = '#000000'
      clonedContent.style.fontFamily = 'Arial, sans-serif'
      clonedContent.style.lineHeight = '1.6'
      clonedContent.style.margin = '0'
      clonedContent.style.padding = '0'
      
      // Remove any dark mode classes and apply light mode styles
      clonedContent.classList.remove('dark')
      clonedContent.classList.add('export-mode')
      
      // Add the cloned content to temp container
      tempContainer.appendChild(clonedContent)
      document.body.appendChild(tempContainer)

      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 800,
        height: tempContainer.scrollHeight,
      })

      // Clean up temp container
      document.body.removeChild(tempContainer)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 170 // Leave margins
      const pageHeight = 277 // A4 height minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add title with proper formatting
      pdf.setFontSize(18)
      pdf.setTextColor(0, 0, 0)
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, 210, 297, 'F')
      pdf.text(title, 20, 25)

      // Add separator line
      pdf.setDrawColor(200, 200, 200)
      pdf.line(20, 30, 190, 30)

      // Add content
      pdf.addImage(imgData, 'PNG', 20, 35, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.setFillColor(255, 255, 255)
        pdf.rect(0, 0, 210, 297, 'F')
        pdf.addImage(imgData, 'PNG', 20, position + 5, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }, [editor, title])

  useImperativeHandle(ref, () => ({
    exportToPDF,
  }));

  if (!editor) {
    return null
  }

  return (
    <div className={`glassmorphism rounded-xl overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-white/10 p-4 space-y-3">
        {/* First Row - Basic Formatting */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="p-2"
          >
            <Bold className="w-4 h-4" />
          </Button>
          
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="p-2"
          >
            <Italic className="w-4 h-4" />
          </Button>
          
          <Button
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className="p-2"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="p-2"
          >
            <List className="w-4 h-4" />
          </Button>
          
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="p-2"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <Button
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className="p-2"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className="p-2"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          
          <Button
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className="p-2"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Second Row - Advanced Formatting */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select onValueChange={setTextFormat} value={getCurrentFormat().value}>
            <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white border-2 hover:border-white/30">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              {textFormats.map((format) => (
                <SelectItem key={format.value} value={format.value} className="text-white hover:bg-white/10">
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setFontFamily}>
            <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white border-2 hover:border-white/30">
              <SelectValue placeholder="Font Family" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font} className="text-white hover:bg-white/10">
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setFontSize}>
            <SelectTrigger className="w-20 bg-white/5 border-white/20 text-white border-2 hover:border-white/30">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              {fontSizes.map((size) => (
                <SelectItem key={size} value={size} className="text-white hover:bg-white/10">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 border-2 border-white/20 hover:border-white/30 bg-white/5">
                <Palette className="w-4 h-4" />
                <span className="ml-2 text-sm">Text Color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-slate-800 border-white/20">
              <div className="grid grid-cols-8 gap-1 p-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 border-2 border-white/20 hover:border-white/30 bg-white/5">
                <Palette className="w-4 h-4" />
                <span className="ml-2 text-sm">Highlight</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-slate-800 border-white/20">
              <div className="grid grid-cols-8 gap-1 p-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setHighlight(color)}
                    className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLinkDialogOpen(true)}
            className="p-2 border-2 border-white/20 hover:border-white/30 bg-white/5"
          >
            <LinkIcon className="w-4 h-4" />
            <span className="ml-2 text-sm">Link</span>
          </Button>

          {/* Remove Export PDF button from here */}
          <div className="ml-auto">
            {isSaving && (
              <span className="text-xs text-slate-400 mr-2 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
                Saving...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px] bg-white dark:bg-slate-900/50 p-4 rounded-lg">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="link-url" className="text-white">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="link-text" className="text-white">Text (optional)</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLinkDialogOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={addLink}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              disabled={!linkUrl.trim()}
            >
              Add Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        .ProseMirror {
          outline: none;
          color: #1e293b;
        }
        
        .dark .ProseMirror {
          color: #f1f5f9;
        }
        
        /* Export mode styles for better PDF formatting */
        .export-mode .ProseMirror {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        
        .export-mode .ProseMirror h1 {
          color: #000000 !important;
          font-size: 2rem !important;
          font-weight: bold !important;
          margin: 1rem 0 !important;
        }
        
        .export-mode .ProseMirror h2 {
          color: #000000 !important;
          font-size: 1.5rem !important;
          font-weight: bold !important;
          margin: 0.75rem 0 !important;
        }
        
        .export-mode .ProseMirror h3 {
          color: #000000 !important;
          font-size: 1.25rem !important;
          font-weight: bold !important;
          margin: 0.5rem 0 !important;
        }
        
        .export-mode .ProseMirror p {
          color: #000000 !important;
          margin: 0.5rem 0 !important;
        }
        
        .export-mode .ProseMirror strong {
          color: #000000 !important;
          font-weight: bold !important;
        }
        
        .export-mode .ProseMirror em {
          color: #000000 !important;
          font-style: italic !important;
        }
        
        .export-mode .ProseMirror u {
          color: #000000 !important;
          text-decoration: underline !important;
        }
        
        .ProseMirror ul.tiptap-bullet-list {
          list-style-type: disc;
          margin-left: 1.5rem;
          padding-left: 0;
        }
        
        .ProseMirror ol.tiptap-ordered-list {
          list-style-type: decimal;
          margin-left: 1.5rem;
          padding-left: 0;
        }
        
        .ProseMirror li {
          margin: 0.5rem 0;
        }
        
        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .ProseMirror a:hover {
          color: #60a5fa;
        }
        
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
        
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        
        .ProseMirror strong {
          font-weight: bold;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        .ProseMirror u {
          text-decoration: underline;
        }
        
        .ProseMirror span[style*="font-size"] {
          display: inline !important;
        }
        
        /* Preserve formatting in export */
        .export-mode .ProseMirror span[style*="font-size"] {
          display: inline !important;
        }
        
        .export-mode .ProseMirror span[style*="color"] {
          color: inherit !important;
        }
        
        .export-mode .ProseMirror span[style*="background-color"] {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  )
})

export default RichTextEditor;