import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Download, Upload, RefreshCw } from "lucide-react";
import { useLoading } from "@/contexts/LoadingContext";
import { MiniLoader, SkeletonLoader } from "@/components/ui/page-loader";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";

export default function LoadingDemo() {
  const { showLoader, hideLoader } = useLoading();
  const [miniLoading, setMiniLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);

  const simulatePageLoad = () => {
    showLoader("Loading your dashboard...");
    setTimeout(() => {
      hideLoader();
    }, 3000);
  };

  const simulateDataFetch = () => {
    showLoader("Fetching your data...");
    setTimeout(() => {
      showLoader("Processing results...");
      setTimeout(() => {
        hideLoader();
      }, 2000);
    }, 2000);
  };

  const simulateFileUpload = () => {
    showLoader("Uploading your files...");
    setTimeout(() => {
      showLoader("Analyzing content...");
      setTimeout(() => {
        showLoader("Finalizing upload...");
        setTimeout(() => {
          hideLoader();
        }, 1500);
      }, 2000);
    }, 2000);
  };

  const simulateMiniLoader = () => {
    setMiniLoading(true);
    setTimeout(() => {
      setMiniLoading(false);
    }, 3000);
  };

  const simulateSkeletonLoader = () => {
    setSkeletonLoading(true);
    setTimeout(() => {
      setSkeletonLoading(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Loading System Demo
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Experience our beautiful and peaceful loading animations designed to enhance user experience during wait times.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Full Page Loaders */}
          <motion.div
            className="glassmorphism p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Full Page Loaders</h2>
            <div className="space-y-4">
              <GlassmorphismButton 
                onClick={simulatePageLoad}
                className="w-full justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Simulate Page Loading
              </GlassmorphismButton>
              
              <GlassmorphismButton 
                onClick={simulateDataFetch}
                className="w-full justify-center"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Simulate Data Fetching
              </GlassmorphismButton>
              
              <GlassmorphismButton 
                onClick={simulateFileUpload}
                className="w-full justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Simulate File Upload
              </GlassmorphismButton>
            </div>
            
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Features:</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Animated 3D logo with orbiting particles</li>
                <li>• Dynamic loading text updates</li>
                <li>• Smooth progress bar animation</li>
                <li>• Floating background elements</li>
                <li>• Glassmorphism overlay design</li>
              </ul>
            </div>
          </motion.div>

          {/* Component Loaders */}
          <motion.div
            className="glassmorphism p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Component Loaders</h2>
            <div className="space-y-6">
              {/* Mini Loader Demo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Mini Loader</h3>
                  <GlassmorphismButton 
                    onClick={simulateMiniLoader}
                    size="sm"
                    variant="outline"
                  >
                    {miniLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Demo"}
                  </GlassmorphismButton>
                </div>
                <div className="bg-slate-800/50 rounded-lg h-20">
                  {miniLoading ? <MiniLoader /> : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      Content loads here
                    </div>
                  )}
                </div>
              </div>

              {/* Skeleton Loader Demo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Skeleton Loader</h3>
                  <GlassmorphismButton 
                    onClick={simulateSkeletonLoader}
                    size="sm"
                    variant="outline"
                  >
                    {skeletonLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Demo"}
                  </GlassmorphismButton>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  {skeletonLoading ? <SkeletonLoader /> : (
                    <div className="space-y-3">
                      <div className="font-semibold text-white">Sample Content Title</div>
                      <div className="text-slate-300 text-sm">
                        This is where your actual content would appear after loading completes. 
                        The skeleton loader provides a smooth placeholder experience.
                      </div>
                      <div className="w-full h-20 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* User Profile Demo */}
          <motion.div
            className="glassmorphism p-6 rounded-xl md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">User Profile System</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-white mb-4">Profile Features</h3>
                <ul className="text-slate-300 space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Avatar upload with preview
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Subscription details display
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Quick settings access
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Smooth dropdown animations
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Mobile-responsive design
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Navigation Integration</h3>
                <p className="text-slate-300 text-sm mb-4">
                  The user profile dropdown is seamlessly integrated into the navigation bar. 
                  Check the top-right corner to see the profile system in action. 
                  It automatically shows when a user is authenticated and displays login/signup options when not.
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-xs text-slate-400">Current Status:</div>
                  <div className="text-green-400 font-semibold">✓ User Authenticated (Demo Mode)</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Implementation Notes */}
        <motion.div
          className="mt-12 glassmorphism p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Implementation Guide</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-white mb-2">Global Loading</h3>
              <div className="text-slate-300 space-y-1">
                <div>• Use useLoading() hook</div>
                <div>• Call showLoader(text)</div>
                <div>• Call hideLoader() when done</div>
                <div>• Automatic overlay management</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Component Loading</h3>
              <div className="text-slate-300 space-y-1">
                <div>• MiniLoader for buttons</div>
                <div>• SkeletonLoader for content</div>
                <div>• Custom animations available</div>
                <div>• Responsive design included</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">User Profile</h3>
              <div className="text-slate-300 space-y-1">
                <div>• Avatar upload functionality</div>
                <div>• Subscription management</div>
                <div>• Settings quick access</div>
                <div>• Logout confirmation</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}