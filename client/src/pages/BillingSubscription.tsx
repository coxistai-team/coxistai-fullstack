import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Calendar, 
  Crown, 
  Check, 
  Download,
  Receipt,
  AlertCircle,
  Zap,
  Star,
  Shield,
  Users,
  Infinity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/contexts/LoadingContext";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  current?: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

export default function BillingSubscription() {
  const { toast } = useToast();
  const { showLoader, hideLoader } = useLoading();

  const [currentPlan, setCurrentPlan] = useState({
    name: "Pro",
    price: 29.99,
    interval: "month" as const,
    nextBilling: "2024-07-15",
    status: "active" as const
  });

  const [paymentMethod, setPaymentMethod] = useState({
    type: "card",
    last4: "4242",
    brand: "visa",
    expiry: "12/26"
  });

  const plans: SubscriptionPlan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      interval: "month",
      features: [
        "5 AI conversations per day",
        "Basic note-taking",
        "Community access",
        "Mobile app access"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: 29.99,
      interval: "month",
      popular: true,
      current: true,
      features: [
        "Unlimited AI conversations",
        "Advanced AI presentations",
        "Premium templates",
        "File upload & analysis",
        "Priority support",
        "Export capabilities"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 49.99,
      interval: "month",
      features: [
        "Everything in Pro",
        "Advanced analytics",
        "Team collaboration",
        "Custom AI training",
        "API access",
        "White-label options",
        "24/7 phone support"
      ]
    }
  ];

  const billingHistory: BillingHistory[] = [
    {
      id: "inv_001",
      date: "2024-06-15",
      amount: 29.99,
      status: "paid",
      description: "Pro Plan - Monthly",
      invoiceUrl: "#"
    },
    {
      id: "inv_002",
      date: "2024-05-15",
      amount: 29.99,
      status: "paid",
      description: "Pro Plan - Monthly",
      invoiceUrl: "#"
    },
    {
      id: "inv_003",
      date: "2024-04-15",
      amount: 29.99,
      status: "paid",
      description: "Pro Plan - Monthly",
      invoiceUrl: "#"
    }
  ];

  const handlePlanChange = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    showLoader("Updating your subscription...");
    
    setTimeout(() => {
      hideLoader();
      toast({
        title: "Subscription Updated",
        description: `Successfully upgraded to ${plan.name} plan.`,
      });
    }, 3000);
  };

  const handleUpdatePayment = () => {
    showLoader("Updating payment method...");
    
    setTimeout(() => {
      hideLoader();
      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been successfully updated.",
      });
    }, 2000);
  };

  const handleCancelSubscription = () => {
    showLoader("Processing cancellation...");
    
    setTimeout(() => {
      hideLoader();
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of the current billing period.",
        variant: "destructive"
      });
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Billing & Subscription
            </span>
          </h1>
          <p className="text-slate-400">Manage your subscription and billing information</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Subscription */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="glassmorphism border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white">{currentPlan.name}</h3>
                  <div className="text-3xl font-bold text-blue-400 mt-2">
                    ${currentPlan.price}
                    <span className="text-sm text-slate-400">/{currentPlan.interval}</span>
                  </div>
                  <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-400/30">
                    {currentPlan.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next billing:</span>
                    <span className="text-white">{formatDate(currentPlan.nextBilling)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment method:</span>
                    <span className="text-white">•••• {paymentMethod.last4}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    onClick={handleUpdatePayment}
                    variant="outline" 
                    className="w-full border-slate-600 text-white hover:bg-slate-700"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Update Payment
                  </Button>
                  <Button 
                    onClick={handleCancelSubscription}
                    variant="outline" 
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="glassmorphism border-slate-600 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-bold">
                    VISA
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">•••• •••• •••• {paymentMethod.last4}</div>
                    <div className="text-sm text-slate-400">Expires {paymentMethod.expiry}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Plans */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`glassmorphism border-slate-600 relative ${
                    plan.popular ? 'ring-2 ring-blue-500/50' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-blue-400">
                      ${plan.price}
                      <span className="text-sm text-slate-400">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      onClick={() => handlePlanChange(plan.id)}
                      className={`w-full ${
                        plan.current 
                          ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Billing History */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glassmorphism border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Billing History
              </CardTitle>
              <CardDescription className="text-slate-400">
                View and download your past invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{invoice.description}</div>
                        <div className="text-sm text-slate-400">{formatDate(invoice.date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <div className="text-right">
                        <div className="font-medium text-white">${invoice.amount}</div>
                        {invoice.invoiceUrl && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage & Limits */}
        <motion.div
          className="mt-8 grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glassmorphism border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Current Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">AI Conversations</span>
                  <span className="text-white">247 / Unlimited</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full w-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">File Uploads</span>
                  <span className="text-white">89 / Unlimited</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full w-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Storage Used</span>
                  <span className="text-white">2.3 GB / 100 GB</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full w-[23%]"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-400" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">
                Have questions about your subscription or billing? Our support team is here to help.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                  View FAQ
                </Button>
                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                  Billing Policies
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}