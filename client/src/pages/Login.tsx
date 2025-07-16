import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user profile exists for this login
    const existingUser = localStorage.getItem('coexist-user-profile');
    
    if (!existingUser) {
      // Create a basic user profile from login data
      const newUser = {
        id: Date.now(),
        firstName: formData.username.split('.')[0] || formData.username,
        lastName: formData.username.split('.')[1] || '',
        email: formData.username.includes('@') ? formData.username : `${formData.username}@example.com`,
        username: formData.username,
        phone: '',
        bio: '',
        location: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatar: null,
        dateOfBirth: '',
        occupation: '',
        company: '',
        theme: 'dark',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        weeklyDigest: true,
        language: 'en',
        publicProfile: false,
      };
      
      // Save user profile to localStorage
      localStorage.setItem('coexist-user-profile', JSON.stringify(newUser));
    }
    
    login();
    setLocation("/");
  };

  const handleSocialLogin = (provider: string) => {
    login();
    setLocation("/");
  };

  return (
    <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
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
          className="glassmorphism rounded-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-slate-600 dark:text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Sign in to your Coexist AI account
            </motion.p>
          </div>

          {/* Social Login Buttons */}
          <motion.div 
            className="space-y-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <GlassmorphismButton
              variant="outline"
              className="w-full py-3 flex items-center justify-center space-x-3 text-slate-900 dark:text-white"
              onClick={() => handleSocialLogin("google")}
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
              <span>Continue with Google</span>
            </GlassmorphismButton>

            <GlassmorphismButton
              variant="outline"
              className="w-full py-3 flex items-center justify-center space-x-3 text-slate-900 dark:text-white"
              onClick={() => handleSocialLogin("github")}
            >
              <FaGithub className="w-5 h-5 text-slate-900 dark:text-white" />
              <span>Continue with GitHub</span>
            </GlassmorphismButton>

            <GlassmorphismButton
              variant="outline"
              className="w-full py-3 flex items-center justify-center space-x-3 text-slate-900 dark:text-white"
              onClick={() => handleSocialLogin("apple")}
            >
              <FaApple className="w-5 h-5 text-slate-900 dark:text-white" />
              <span>Continue with Apple</span>
            </GlassmorphismButton>
          </motion.div>

          {/* Divider */}
          <motion.div 
            className="flex items-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Separator className="flex-1 bg-slate-300 dark:bg-white/20" />
            <span className="px-4 text-sm text-slate-600 dark:text-slate-400">or</span>
            <Separator className="flex-1 bg-slate-300 dark:bg-white/20" />
          </motion.div>

          {/* Login Form */}
          <motion.form 
            onSubmit={handleLogin}
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-900 dark:text-white">Username or Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username or email"
                  className="pl-10 bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-900 dark:text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 dark:focus:border-blue-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link href="/forgot-password">
                <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot your password?
                </button>
              </Link>
            </div>

            {/* Login Button */}
            <GlassmorphismButton
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              Sign In
            </GlassmorphismButton>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link href="/signup">
                <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer transition-colors">
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