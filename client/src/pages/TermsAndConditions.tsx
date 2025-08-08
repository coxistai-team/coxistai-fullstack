import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const TermsAndConditions = () => {
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
              Terms & Conditions
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
            <p className="text-gray-300 leading-relaxed">
              This document is an electronic record in terms of the Information Technology Act, 2000 and applicable rules. 
              It is published in accordance with Rule 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011 
              and constitutes the terms of use for access or usage of the domain name coxist.ai ("Website"), including its related 
              sub-domains, mobile site, and applications (together, the "Platform").
            </p>

            <p className="text-gray-300 leading-relaxed">
              Coxist AI is a company registered under the Companies Act, 1956, with its registered office at A2103, Aditya Empress Towers, 
              Shaikpet, Tolichowki, Hyderabad, India.
            </p>

            <p className="text-gray-300 leading-relaxed">
              By accessing or using the Platform, you agree to be bound by these Terms and Conditions ("Terms of Use") and any other 
              applicable policies. If you do not agree, you may not use the Platform.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">1. Use of the Platform</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>You agree to provide accurate and complete information when registering or transacting.</li>
              <li>You are solely responsible for all activities done through your registered account.</li>
              <li>The services provided by Coxist AI are available globally unless otherwise specified. Some services may be restricted in certain locations.</li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">2. Intellectual Property</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>All content, including design, layout, graphics, logos, and branding, are proprietary to us or licensed to us.</li>
              <li>Unauthorized use may result in legal action.</li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>You agree not to use the Platform for unlawful, harmful, or malicious activities.</li>
              <li>You will not violate any applicable law or infringe on the rights of others.</li>
              <li>You will not attempt to gain unauthorized access to any part of the Platform.</li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Links</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Platform may contain links to third-party websites. We are not responsible for the content, privacy practices, 
              or terms of use of such websites.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Your use of the Platform is entirely at your own risk.</li>
              <li>We do not guarantee accuracy or completeness of any content or service.</li>
              <li>We are not liable for any direct or indirect damages arising from use or inability to use the Platform.</li>
            </ul>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">6. Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Platform, 
              to understand our practices.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">7. Modifications</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
              Your continued use of the Platform constitutes acceptance of the modified terms.
            </p>

            <hr className="border-gray-700 my-8" />

            <h2 className="text-2xl font-bold text-white mb-4">8. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <p className="text-gray-300">
                <strong>Email:</strong> support@coxistai.com<br />
                <strong>Address:</strong> A2103, Aditya Empress Towers, Shaikpet, Tolichowki, Hyderabad, India
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 