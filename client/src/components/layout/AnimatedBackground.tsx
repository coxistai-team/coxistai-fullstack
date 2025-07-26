import { motion } from "framer-motion";

const AnimatedBackground = () => {
  const floatingShapes = [
    { id: 1, type: "cube", size: "w-8 h-8", color: "bg-blue-500", position: "top-10 left-10", delay: 0 },
    { id: 2, type: "circle", size: "w-6 h-6", color: "bg-green-500", position: "top-32 right-20", delay: 2 },
    { id: 3, type: "diamond", size: "w-10 h-10", color: "bg-blue-500", position: "top-1/2 left-1/4", delay: 0 },
    { id: 4, type: "ring", size: "w-12 h-12", color: "border-green-500", position: "top-3/4 right-1/3", delay: 1 },
    { id: 5, type: "gradient", size: "w-8 h-8", color: "bg-gradient-to-r from-blue-500 to-green-500", position: "top-1/3 right-10", delay: 2 }
  ];

  const mathSymbols = [
    { id: 6, symbol: "∑", position: "bottom-20 left-1/2", delay: 2 },
    { id: 7, symbol: "∫", position: "top-20 right-1/4", delay: 0 },
    { id: 8, symbol: "π", position: "bottom-32 left-20", delay: 1 }
  ];

  const floatVariants = {
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [-20, 20, -20],
      rotate: [0, 180, 360],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Main Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-[#ec8f4f] opacity-95"></div>
      
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
      
      {/* Floating Shapes with updated colors to match the new theme */}
      {floatingShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.position} ${shape.size} opacity-10`}
          variants={floatVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: shape.delay }}
        >
          {shape.type === "cube" && (
            <div className="bg-white/20 rounded-lg w-full h-full backdrop-blur-sm" />
          )}
          {shape.type === "circle" && (
            <div className="bg-orange-300/30 rounded-full w-full h-full backdrop-blur-sm" />
          )}
          {shape.type === "diamond" && (
            <div className="bg-blue-300/30 transform rotate-45 w-full h-full backdrop-blur-sm" />
          )}
          {shape.type === "ring" && (
            <div className="border-2 border-white/30 rounded-full w-full h-full backdrop-blur-sm" />
          )}
          {shape.type === "gradient" && (
            <div className="bg-gradient-to-r from-blue-300/30 to-orange-300/30 rounded-full w-full h-full backdrop-blur-sm" />
          )}
        </motion.div>
      ))}

      {/* Math Symbols with updated colors */}
      {mathSymbols.map((symbol) => (
        <motion.div
          key={symbol.id}
          className={`absolute ${symbol.position} text-4xl font-bold text-white/20 select-none`}
          variants={floatVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: symbol.delay }}
        >
          {symbol.symbol}
        </motion.div>
      ))}
      
      {/* Additional atmospheric elements */}
      <motion.div
        className="absolute top-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-orange-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut" as const
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gradient-to-l from-orange-400/15 to-blue-400/15 rounded-full blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: 2
        }}
      />
    </div>
  );
};

export default AnimatedBackground;