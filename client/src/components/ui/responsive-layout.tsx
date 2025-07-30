import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
  container?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  optimistic?: boolean
  animate?: boolean
}

const ResponsiveLayout = React.forwardRef<HTMLDivElement, ResponsiveLayoutProps>(
  ({ 
    children, 
    className, 
    container = true,
    maxWidth = "xl",
    padding = "md",
    spacing = "md",
    optimistic = false,
    animate = false,
    ...props 
  }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-full"
    }

    const paddingClasses = {
      none: "",
      sm: "px-4 py-4",
      md: "px-4 sm:px-6 lg:px-8 py-6 sm:py-8",
      lg: "px-6 sm:px-8 lg:px-12 py-8 sm:py-12",
      xl: "px-8 sm:px-12 lg:px-16 py-12 sm:py-16"
    }

    const spacingClasses = {
      none: "",
      sm: "space-y-4",
      md: "space-y-6 sm:space-y-8",
      lg: "space-y-8 sm:space-y-12",
      xl: "space-y-12 sm:space-y-16"
    }

    const layoutContent = (
      <div
        ref={ref}
        className={cn(
          container && "mx-auto",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          spacingClasses[spacing],
          optimistic && "optimistic-ui",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {layoutContent}
        </motion.div>
      )
    }

    if (optimistic) {
      return (
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {layoutContent}
        </motion.div>
      )
    }

    return layoutContent
  }
)
ResponsiveLayout.displayName = "ResponsiveLayout"

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: "sm" | "md" | "lg" | "xl"
  responsive?: boolean
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    children, 
    className, 
    cols = 1,
    gap = "md",
    responsive = true,
    ...props 
  }, ref) => {
    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
      6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    }

    const gapClasses = {
      sm: "gap-3 sm:gap-4",
      md: "gap-4 sm:gap-6",
      lg: "gap-6 sm:gap-8",
      xl: "gap-8 sm:gap-12"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          responsive ? gridCols[cols] : `grid-cols-${cols}`,
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResponsiveGrid.displayName = "ResponsiveGrid"

interface ResponsiveSectionProps {
  children: React.ReactNode
  className?: string
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  background?: "none" | "glassmorphism" | "gradient"
  animate?: boolean
}

const ResponsiveSection = React.forwardRef<HTMLDivElement, ResponsiveSectionProps>(
  ({ 
    children, 
    className, 
    padding = "md",
    background = "none",
    animate = false,
    ...props 
  }, ref) => {
    const paddingClasses = {
      none: "",
      sm: "py-8 sm:py-12",
      md: "py-12 sm:py-16",
      lg: "py-16 sm:py-20",
      xl: "py-20 sm:py-24"
    }

    const backgroundClasses = {
      none: "",
      glassmorphism: "glassmorphism rounded-2xl",
      gradient: "bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl"
    }

    const sectionContent = (
      <section
        ref={ref}
        className={cn(
          paddingClasses[padding],
          backgroundClasses[background],
          className
        )}
        {...props}
      >
        {children}
      </section>
    )

    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {sectionContent}
        </motion.div>
      )
    }

    return sectionContent
  }
)
ResponsiveSection.displayName = "ResponsiveSection"

export { ResponsiveLayout, ResponsiveGrid, ResponsiveSection } 