import { motion, AnimatePresence } from "framer-motion";
import { usePageLoading } from "@/contexts/PageLoadingContext";

const PageLoader = () => {
  const { isPageLoading } = usePageLoading();

  return (
    <AnimatePresence>
      {isPageLoading && (
        <motion.div 
          className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            {/* Animated loading ring */}
            <div className="relative w-16 h-16 mx-auto mb-4">
              <motion.div
                className="absolute inset-0 border-4 border-blue-500/20 rounded-full"
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              <motion.div
                className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                className="absolute inset-2 border-2 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            
            {/* Loading text */}
            <motion.div
              className="text-white text-lg font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Loading...
            </motion.div>
            
            {/* Animated dots */}
            <div className="flex justify-center space-x-1 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Mini loader component for inline loading states
export const MiniLoader = ({ size = "sm", className = "" }: { size?: "xs" | "sm" | "md"; className?: string }) => {
  const sizeMap = {
    xs: "w-3 h-3",
    sm: "w-4 h-4", 
    md: "w-6 h-6"
  };

  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      <motion.div
        className="absolute inset-0 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

// Skeleton loader for content placeholders
export const SkeletonLoader = ({ className = "", lines = 3 }: { className?: string; lines?: number }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-700 rounded h-4 mb-2 ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export default PageLoader;