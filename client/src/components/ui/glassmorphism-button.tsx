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
  const baseClasses = "font-semibold transition-all duration-300 border border-white/20 flex items-center justify-center relative overflow-hidden group";
  
  const variants = {
    default: "glassmorphism-button text-white",
    outline: "glassmorphism text-white hover:glassmorphism-button border-white/30 hover:border-white/50"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-xl"
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
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
      
      {/* Shine effect */}
      <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
    </motion.button>
  );
};

export default GlassmorphismButton;