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
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Floating Shapes */}
      {floatingShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.position} ${shape.size} opacity-20`}
          variants={floatVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: shape.delay }}
        >
          {shape.type === "cube" && (
            <div className={`${shape.color} rounded-lg w-full h-full`} />
          )}
          {shape.type === "circle" && (
            <div className={`${shape.color} rounded-full w-full h-full`} />
          )}
          {shape.type === "diamond" && (
            <div className={`${shape.color} transform rotate-45 w-full h-full`} />
          )}
          {shape.type === "ring" && (
            <div className={`border-2 ${shape.color} rounded-full w-full h-full`} />
          )}
          {shape.type === "gradient" && (
            <div className={`${shape.color} rounded-full w-full h-full`} />
          )}
        </motion.div>
      ))}

      {/* Math Symbols */}
      {mathSymbols.map((symbol) => (
        <motion.div
          key={symbol.id}
          className={`absolute ${symbol.position} text-4xl font-bold text-blue-500 opacity-30 select-none`}
          variants={floatVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: symbol.delay }}
        >
          {symbol.symbol}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedBackground;
