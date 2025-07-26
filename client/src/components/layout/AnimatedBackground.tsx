import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating geometric shapes
  const floatingShapes = [
    { id: 1, size: "w-32 h-32", color: "bg-blue-500/10", position: "top-20 left-20", delay: 0 },
    { id: 2, size: "w-24 h-24", color: "bg-purple-500/10", position: "top-40 right-32", delay: 2 },
    { id: 3, size: "w-40 h-40", color: "bg-blue-400/5", position: "bottom-32 left-40", delay: 1 },
    { id: 4, size: "w-20 h-20", color: "bg-purple-400/10", position: "bottom-20 right-20", delay: 3 },
    { id: 5, size: "w-28 h-28", color: "bg-blue-300/8", position: "top-1/2 left-1/4", delay: 1.5 },
  ];

  // Particle system
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  const floatVariants = {
    initial: { y: 0, rotate: 0, scale: 1 },
    animate: {
      y: [-20, 20, -20],
      rotate: [0, 180, 360],
      scale: [1, 1.1, 1],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial opacity-60"></div>
      
      {/* Mouse-following gradient */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, rgba(51, 102, 255, 0.3) 0%, transparent 70%)`,
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating geometric shapes */}
      {floatingShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.position} ${shape.size} ${shape.color} rounded-full blur-xl`}
          variants={floatVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: shape.delay }}
        />
      ))}

      {/* Particle system */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-blue-400/30 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Animated light beams */}
      <motion.div
        className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
        animate={{
          opacity: [0, 1, 0],
          scaleY: [0, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 0,
        }}
      />
      <motion.div
        className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"
        animate={{
          opacity: [0, 1, 0],
          scaleY: [0, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 2,
        }}
      />

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;