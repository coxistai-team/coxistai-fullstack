import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, Sparkles, Lock, Star, Shield, Zap } from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";

interface FeaturePreviewProps {
  feature: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    benefits: string[];
    gradient: string;
  };
}

const FeaturePreview = ({ feature }: FeaturePreviewProps) => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Feature Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="glassmorphism-strong rounded-3xl p-8 border border-white/10">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 flex items-center justify-center relative overflow-hidden">
                {/* Feature Icon */}
                <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 relative z-10`}>
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
                
                {/* Animated rings */}
                <motion.div
                  className="absolute inset-0 border-2 border-blue-500/30 rounded-2xl"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-4 border border-purple-500/20 rounded-xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
                
                {/* Feature title overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.subtitle}</p>
                </div>
              </div>
            </div>
            
            {/* Floating Lock Icon */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-16 h-16 glassmorphism rounded-full flex items-center justify-center border border-white/20"
            >
              <Lock className="w-8 h-8 text-blue-400" />
            </motion.div>
          </motion.div>

          {/* Right Side - Feature Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center space-x-2 px-4 py-2 glassmorphism rounded-full mb-6 border border-blue-500/30"
              >
                <Lock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Premium Feature</span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {feature.title}
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Star className="w-6 h-6 text-yellow-400 mr-2" />
                What you'll get:
              </h3>
              {feature.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start space-x-3 group"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 pt-8"
            >
              <GlassmorphismButton
                onClick={() => setLocation('/signup')}
                className="flex-1 sm:flex-none group"
                size="lg"
              >
                <span className="flex items-center">
                  Sign Up to Access
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </GlassmorphismButton>
              
              <GlassmorphismButton
                onClick={() => setLocation('/login')}
                variant="outline"
                className="flex-1 sm:flex-none"
                size="lg"
              >
                Already have an account? Login
              </GlassmorphismButton>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="glassmorphism rounded-2xl p-6 border border-blue-500/20"
            >
              <div className="flex items-start space-x-3">
                <Sparkles className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-2 flex items-center">
                    Join thousands of learners
                    <Shield className="w-4 h-4 text-green-400 ml-2" />
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Create your free account and unlock the full potential of AI-powered learning. 
                    Trusted by students worldwide.
                  </p>
                  <div className="flex items-center space-x-4 mt-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span>Instant setup</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span>Secure & private</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-blue-400" />
                      <span>Premium features</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeaturePreview;