import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, Sparkles, Lock } from "lucide-react";
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
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Feature Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className={`bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg`}>
              <div className="aspect-square rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{feature.subtitle}</p>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <Lock className="w-8 h-8 text-blue-500" />
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
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6 border border-blue-200 dark:border-blue-700"
              >
                <Lock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Premium Feature</span>
              </motion.div>

              <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {feature.title}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">What you'll get:</h3>
              {feature.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
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
                className="flex-1 sm:flex-none"
              >
                <span>Sign Up to Access</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </GlassmorphismButton>
              
              <GlassmorphismButton
                onClick={() => setLocation('/login')}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Already have an account? Login
              </GlassmorphismButton>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
            >
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Join thousands of learners</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Create your free account and unlock the full potential of AI-powered learning
                  </p>
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