import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sparkles } from "lucide-react";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3, "Username is required").max(32),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const Login = () => {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const { login, error, loading } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setValidationErrors({ ...validationErrors, [e.target.name]: undefined });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});
    setIsLoggingIn(true);
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setValidationErrors(fieldErrors);
      setIsLoggingIn(false);
      return;
    }
    const success = await login(formData.username, formData.password);
    setIsLoggingIn(false);
    if (success) {
      setLocation("/");
    } else {
      setFormError(error || "Login failed");
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Social login is not implemented yet
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white glassmorphism border border-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glassmorphism-strong rounded-3xl p-8 border border-white/10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Sign in to your Coexist AI account
            </motion.p>
          </div>

          {/* Social Login Buttons */}
          <motion.div 
            className="space-y-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <GlassmorphismButton
              variant="outline"
              className="w-full py-3 flex items-center justify-center space-x-3 text-white border-white/20 hover:border-white/30"
              onClick={() => handleSocialLogin("google")}
              disabled
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
              <span>Continue with Google</span>
            </GlassmorphismButton>

            <GlassmorphismButton
              variant="outline"
              className="w-full py-3 flex items-center justify-center space-x-3 text-white border-white/20 hover:border-white/30"
              onClick={() => handleSocialLogin("github")}
              disabled
            >
              <FaGithub className="w-5 h-5 text-white" />
              <span>Continue with GitHub</span>
            </GlassmorphismButton>

            <GlassmorphismButton
              variant="outline"
              className="w-full py-3 flex items-center justify-center space-x-3 text-white border-white/20 hover:border-white/30"
              onClick={() => handleSocialLogin("apple")}
              disabled
            >
              <FaApple className="w-5 h-5 text-white" />
              <span>Continue with Apple</span>
            </GlassmorphismButton>
          </motion.div>

          {/* Divider */}
          <motion.div 
            className="flex items-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Separator className="flex-1 bg-white/20" />
            <span className="px-4 text-sm text-gray-400">or</span>
            <Separator className="flex-1 bg-white/20" />
          </motion.div>

          {/* Login Form */}
          <motion.form 
            onSubmit={handleLogin}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white font-medium">Username or Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username or email"
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
                  required
                />
              </div>
              {validationErrors.username && (
                <div className="text-red-400 text-xs mt-1">{validationErrors.username}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <div className="text-red-400 text-xs mt-1">{validationErrors.password}</div>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link href="/forgot-password">
                <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot your password?
                </button>
              </Link>
            </div>

            {/* Error Message */}
            {formError && (
              <motion.div 
                className="text-red-400 text-sm text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {formError}
              </motion.div>
            )}

            {/* Login Button */}
            <GlassmorphismButton
              type="submit"
              className="w-full py-4 text-lg font-semibold"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </GlassmorphismButton>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link href="/signup">
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors font-medium">
                  Sign up here
                </span>
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

export default Login;