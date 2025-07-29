import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Sparkles } from "lucide-react";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import ParticleField from "@/components/effects/ParticleField";

const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username is required").max(32),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const Signup = () => {
  const [, setLocation] = useLocation();
  const { signup, error, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ fullName?: string; username?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setValidationErrors({ ...validationErrors, [e.target.name]: undefined });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});
    setIsSigningUp(true);
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: any = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message;
      });
      setValidationErrors(fieldErrors);
      setIsSigningUp(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationErrors({ confirmPassword: "Passwords do not match" });
      setIsSigningUp(false);
      return;
    }
    if (!agreeToTerms) {
      setFormError("Please agree to the terms and conditions!");
      setIsSigningUp(false);
      return;
    }
    const success = await signup(formData.username, formData.email, formData.password);
    setIsSigningUp(false);
    if (success) {
      setLocation("/");
    } else {
      setFormError(error || "Signup failed");
    }
  };

  const handleSocialSignup = (provider: string) => {
    setLocation("/");
  };

  return (
    <main className="relative min-h-screen bg-black text-white flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Particle Field Background */}
      <ParticleField />
      
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

        {/* Signup Form */}
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
              Join CoXist AI
            </motion.h1>
            <motion.p 
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Create your account and start learning
            </motion.p>
          </div>

          {/* Social Signup Buttons 
          <motion.div 
            className="space-y-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <GlassmorphismButton
              variant="outline"
              className="w-full py-3 flex items-center justify-center space-x-3 text-white border-white/20 hover:border-white/30"
              onClick={() => handleSocialSignup("google")}
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
              <span>Sign up with Google</span>
            </GlassmorphismButton>

            <GlassmorphismButton
              variant="outline"
              className="w-full py-3 flex items-center justify-center space-x-3 text-white border-white/20 hover:border-white/30"
              onClick={() => handleSocialSignup("github")}
            >
              <FaGithub className="w-5 h-5 text-white" />
              <span>Sign up with GitHub</span>
            </GlassmorphismButton>

            <GlassmorphismButton
              variant="outline"
              className="w-full py-3 flex items-center justify-center space-x-3 text-white border-white/20 hover:border-white/30"
              onClick={() => handleSocialSignup("apple")}
            >
              <FaApple className="w-5 h-5 text-white" />
              <span>Sign up with Apple</span>
            </GlassmorphismButton>
          </motion.div>
          */}

          {/* Divider 
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
          */}

          {/* Signup Form */}
          <motion.form 
            onSubmit={handleSignup}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
                  required
                />
              </div>
              {validationErrors.fullName && (
                <div className="text-red-400 text-xs mt-1">{validationErrors.fullName}</div>
              )}
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
                  required
                />
              </div>
              {validationErrors.username && (
                <div className="text-red-400 text-xs mt-1">{validationErrors.username}</div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
                  required
                />
              </div>
              {validationErrors.email && (
                <div className="text-red-400 text-xs mt-1">{validationErrors.email}</div>
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
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <div className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1 border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label htmlFor="terms" className="text-sm text-gray-400 leading-5">
                I agree to the{" "}
                <Link href="/terms">
                  <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                    Terms of Service
                  </span>
                </Link>
                {" "}and{" "}
                <Link href="/privacy">
                  <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                    Privacy Policy
                  </span>
                </Link>
              </Label>
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

            {/* Signup Button */}
            <GlassmorphismButton
              type="submit"
              className="w-full py-4 text-lg font-semibold"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </GlassmorphismButton>
          </motion.form>

          {/* Login Link */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors font-medium">
                  Sign in here
                </span>
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

export default Signup;