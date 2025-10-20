import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const RefundPolicy = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Back Button */}
        <motion.button
          onClick={() => setLocation("/")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          whileHover={{ x: -5 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </motion.button>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Refund & Cancellation Policy
            </span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="glassmorphism-enhanced rounded-2xl p-6 sm:p-8 md:p-12 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="prose prose-invert max-w-none">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
              <p className="text-blue-300 text-center font-medium">
                <strong>Last Updated:</strong> August 2025
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Subscription Services (Monthly/Yearly)</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                You can cancel your subscription at any time. Your access to the paid features will continue until 
                the end of the current billing period.
              </li>
              <li>
                <strong className="text-blue-400">Annual Subscriptions:</strong> If you cancel an annual subscription 
                within 14 days of the initial purchase, you are eligible for a full refund. No refunds will be issued 
                for cancellations made after 14 days.
              </li>
              <li>
                <strong className="text-blue-400">Monthly Subscriptions:</strong> Monthly subscription fees are 
                non-refundable. When you cancel, you will not be charged for the subsequent months.
              </li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Pay-As-You-Go / Credit Packs</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                Credit packs and pay-as-you-go services are non-refundable once purchased and used.
              </li>
              <li>
                Unused credits may be eligible for refund within 7 days of purchase, subject to review.
              </li>
              <li>
                Credits expire after 12 months from the date of purchase.
              </li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Premium Features and Add-ons</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                Premium features and add-ons are non-refundable once activated.
              </li>
              <li>
                If a premium feature is not working as advertised, we will work to resolve the issue or provide 
                a credit for the affected period.
              </li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Refund Process</h2>
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <h3 className="text-xl font-semibold text-gray-200">How to Request a Refund</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Contact our support team at teamcoxistai@gmail.com</li>
                <li>Include your account email and order details</li>
                <li>Provide a reason for the refund request</li>
                <li>Allow 3-5 business days for review and processing</li>
              </ol>
            </div>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Refund Eligibility</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Eligible for Refund</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                  <li>Annual subscriptions cancelled within 14 days</li>
                  <li>Unused credits within 7 days of purchase</li>
                  <li>Technical issues preventing service use</li>
                  <li>Duplicate charges or billing errors</li>
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Not Eligible for Refund</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                  <li>Monthly subscriptions</li>
                  <li>Used credits or services</li>
                  <li>Premium features after activation</li>
                  <li>Violation of terms of service</li>
                </ul>
              </div>
            </div>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Processing Time</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                <strong className="text-blue-400">Review Period:</strong> 3-5 business days for refund requests
              </li>
              <li>
                <strong className="text-blue-400">Processing Time:</strong> 5-10 business days for approved refunds
              </li>
              <li>
                <strong className="text-blue-400">Payment Method:</strong> Refunds will be processed to the original 
                payment method used for the purchase
              </li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Cancellation Process</h2>
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <h3 className="text-xl font-semibold text-gray-200">How to Cancel</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Log into your account</li>
                <li>Go to Account Settings &gt; Billing</li>
                <li>Click on "Cancel Subscription"</li>
                <li>Confirm your cancellation</li>
                <li>You'll receive a confirmation email</li>
              </ol>
            </div>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Exceptions</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to make exceptions to this policy on a case-by-case basis. Special circumstances 
              such as technical issues, service outages, or other extenuating circumstances may be considered for 
              refunds outside of our standard policy.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              For refund and cancellation requests, please contact us at:
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <p className="text-gray-300">
                <strong>Email:</strong> teamcoxistai@gmail.com<br />
                <strong>Subject Line:</strong> Refund Request - [Your Account Email]<br />
                <strong>Response Time:</strong> Within 24 hours during business days<br />
                <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-8">
              <p className="text-yellow-300 text-center font-medium">
                <strong>Note:</strong> This policy is subject to change. Please check back periodically for updates.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicy; 