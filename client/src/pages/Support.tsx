import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, Clock, HelpCircle, Book, Users, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      availability: "24/7",
      responseTime: "< 5 minutes",
      action: "Start Chat",
      color: "bg-blue-500",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Always open",
      responseTime: "< 24 hours",
      action: "Send Email",
      color: "bg-green-500",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our experts",
      availability: "Mon-Fri 9AM-6PM PST",
      responseTime: "Immediate",
      action: "Call Now",
      color: "bg-purple-500",
    },
  ];

  const faqCategories = [
    { id: "all", name: "All", count: 12 },
    { id: "account", name: "Account", count: 4 },
    { id: "billing", name: "Billing", count: 3 },
    { id: "features", name: "Features", count: 5 },
  ];

  const faqs = [
    {
      category: "account",
      question: "How do I reset my password?",
      answer: "You can reset your password by clicking on 'Forgot Password' on the login page. We'll send you a secure link to create a new password.",
    },
    {
      category: "account",
      question: "How do I update my profile information?",
      answer: "Go to Profile Settings from the navigation menu. You can update your personal information, preferences, and account settings there.",
    },
    {
      category: "billing",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through Stripe.",
    },
    {
      category: "billing",
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from the Billing & Subscription page. Your access will continue until the end of your current billing period.",
    },
    {
      category: "features",
      question: "How does the AI CFO work?",
      answer: "Our AI CFO uses advanced financial models to provide personalized cashflow analysis and forecasting. You can connect your bank accounts, upload financial data, and get real-time insights and recommendations.",
    },
    {
      category: "features",
      question: "Can I share my financial reports with investors?",
      answer: "Yes, you can easily share financial reports and dashboards with investors, advisors, and team members through secure sharing links.",
    },
    {
      category: "features",
      question: "How do I join startup communities?",
      answer: "Visit the Community section to browse available startup groups and networking opportunities. You can join existing groups or create your own based on your industry and stage.",
    },
    {
      category: "account",
      question: "Is my data secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for detailed information.",
    },
    {
      category: "features",
      question: "Can I use Coxist AI CFO offline?",
      answer: "Some features like viewing downloaded reports work offline, but most AI-powered finance features require an internet connection for real-time data sync.",
    },
    {
      category: "billing",
      question: "Do you offer startup discounts?",
      answer: "Yes, we offer special pricing for early-stage startups. Contact our support team to learn about our startup program and available discounts.",
    },
    {
      category: "features",
      question: "How do I export my financial data?",
      answer: "You can export your financial reports, cashflow data, and analytics from the Settings page. We support various formats including PDF, Excel, and CSV.",
    },
    {
      category: "account",
      question: "How do I delete my account?",
      answer: "Account deletion can be requested through Privacy Settings. Please note that this action is permanent and cannot be undone.",
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const resources = [
    {
      icon: Book,
      title: "User Guide",
      description: "Complete documentation and tutorials",
      link: "/docs",
    },
    {
      icon: Users,
      title: "Community Forum",
      description: "Connect with other users and share tips",
      link: "/community",
    },
    {
      icon: HelpCircle,
      title: "Video Tutorials",
      description: "Watch step-by-step guides and demos",
      link: "/tutorials",
    },
  ];

  return (
    <main className="relative z-10 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 glassmorphism rounded-full px-3 py-1 mb-4">
            <HelpCircle className="w-3 h-3 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400">Support Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
            How Can We Help?
          </h1>
          <p className="text-lg text-slate-400 mb-6 max-w-3xl mx-auto leading-relaxed">
            Get the support you need to make the most of your Coxist AI CFO experience. 
            We're here to help you manage your startup finances and never run out of cash.
          </p>
        </motion.div>

        {/* Support Options */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {supportOptions.map((option, index) => (
            <Card key={index} className="glassmorphism border-slate-700/50 hover:border-blue-400/30 transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <option.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white">{option.title}</CardTitle>
                <CardDescription className="text-slate-400">{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">{option.availability}</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-800/50">
                    Response: {option.responseTime}
                  </Badge>
                </div>
                <Button className="w-full glassmorphism-button">
                  {option.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 mb-8">Find quick answers to common questions</p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glassmorphism border-slate-700/50"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex justify-center space-x-4 mb-8">
              {faqCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? "glassmorphism-button" : "glassmorphism border-slate-700/50"}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFaqs.map((faq, index) => (
              <Card key={index} className="glassmorphism border-slate-700/50 hover:border-blue-400/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-start space-x-3">
                    <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed pl-8">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-8">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {resources.map((resource, index) => (
              <Card key={index} className="glassmorphism border-slate-700/50 hover:border-blue-400/30 transition-all duration-300 group cursor-pointer">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{resource.title}</CardTitle>
                  <CardDescription className="text-slate-400">{resource.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="glassmorphism border-slate-700/50 max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Still Need Help?</CardTitle>
              <CardDescription className="text-slate-400">
                Send us a message and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Your Name" className="glassmorphism border-slate-700/50" />
                <Input placeholder="Your Email" type="email" className="glassmorphism border-slate-700/50" />
              </div>
              <Input placeholder="Subject" className="glassmorphism border-slate-700/50" />
              <Textarea 
                placeholder="Describe your issue or question..." 
                rows={5}
                className="glassmorphism border-slate-700/50"
              />
              <Button className="w-full glassmorphism-button">
                Send Message
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};

export default Support;