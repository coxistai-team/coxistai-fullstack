import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassmorphismButtonProps {
  children: ReactNode;
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
}

const GlassmorphismButton = ({ 
  children, 
  className, 
  variant = "default", 
  size = "md",
  onClick,
  disabled = false,
  title,
  type = "button"
}: GlassmorphismButtonProps) => {
  const baseClasses = "font-semibold transition-all duration-300 border border-slate-300/20 dark:border-white/20 flex items-center justify-center";
  
  const variants = {
    default: "glassmorphism-button text-slate-900 dark:text-white",
    outline: "glassmorphism text-slate-900 dark:text-white hover:glassmorphism-button"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl"
  };
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

export default GlassmorphismButton;
