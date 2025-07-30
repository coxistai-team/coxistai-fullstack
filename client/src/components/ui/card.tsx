import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    optimistic?: boolean
    hover?: boolean
    responsive?: boolean
  }
>(({ className, optimistic = false, hover = false, responsive = false, children, ...props }, ref) => {
  const cardContent = (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
        responsive && "p-4 sm:p-6 lg:p-8",
        hover && "hover:shadow-md hover:scale-[1.02] transition-all duration-300",
        optimistic && "optimistic-ui",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )

  if (optimistic) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    responsive?: boolean
  }
>(({ className, responsive = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      responsive && "p-4 sm:p-6 lg:p-8",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    responsive?: boolean
  }
>(({ className, responsive = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      responsive && "text-lg sm:text-xl lg:text-2xl",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    responsive?: boolean
  }
>(({ className, responsive = false, ...props }, ref) => (
  <div
    className={cn(
      "text-sm text-muted-foreground",
      responsive && "text-xs sm:text-sm lg:text-base",
      className
    )}
    ref={ref}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    responsive?: boolean
  }
>(({ className, responsive = false, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6 pt-0",
      responsive && "p-4 sm:p-6 lg:p-8 pt-0",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    responsive?: boolean
  }
>(({ className, responsive = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      responsive && "p-4 sm:p-6 lg:p-8 pt-0",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
