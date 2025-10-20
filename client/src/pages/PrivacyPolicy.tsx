import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const PrivacyPolicy = () => {
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
              Privacy Policy
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
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
              <p className="text-yellow-300 text-center font-medium">
                <strong>Last Updated:</strong> August 2025
              </p>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              This Privacy Policy describes how <strong className="text-blue-400">Coxist AI CFO</strong> and its affiliates 
              (collectively "we, our, us") collect, use, share, protect or otherwise process your information/ personal 
              data through our AI finance platform <strong className="text-blue-400">coxistai.com</strong> (hereinafter referred to as <strong className="text-blue-400">Platform</strong>).
            </p>

            <p className="text-gray-300 leading-relaxed">
              Please note that you may be able to browse certain sections of the Platform without registering with us. 
              We do not offer any product/service under this Platform outside India and your personal data will primarily 
              be stored and processed in India. By visiting this Platform, providing your information or availing any 
              product/service offered on the Platform, you expressly agree to be bound by the terms and conditions of 
              this Privacy Policy, the Terms of Use and the applicable service/product terms and conditions, and agree 
              to be governed by the laws of India including but not limited to the laws applicable to data protection 
              and privacy. If you do not agree please do not use or access our Platform.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-200 mb-3">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Name, email address, phone number, and other contact information</li>
              <li>Financial data including bank account connections, transaction data, and cashflow information</li>
              <li>Payment information and billing details</li>
              <li>Profile information and user-generated content</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-6">Usage Information</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Log data, device information, and IP addresses</li>
              <li>Usage patterns, preferences, and interactions with our finance services</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>To provide and maintain our financial services</li>
              <li>To personalize your finance experience</li>
              <li>To process payments and manage subscriptions</li>
              <li>To communicate with you about our services</li>
              <li>To improve our platform and develop new features</li>
              <li>To ensure security and prevent fraud</li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Information Sharing</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>With service providers who assist in operating our platform</li>
              <li>To comply with legal obligations or protect our rights</li>
              <li>In connection with a business transfer or merger</li>
              <li>With your explicit consent</li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
              internet or electronic storage is 100% secure.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Withdraw consent where applicable</li>
              <li>Data portability</li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide 
              personalized content. You can control cookie settings through your browser preferences.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If you are a parent or guardian and believe your child has provided 
              us with personal information, please contact us.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by 
              posting the new policy on this page and updating the "Last Updated" date.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <p className="text-gray-300">
                <strong>Email:</strong> teamcoxistai@gmail.com<br />
                <strong>Address:</strong> A2103, Aditya Empress Towers, Shaikpet, Tolichowki, Hyderabad, India<br />
                <strong>Phone:</strong> +91 7997157510
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 