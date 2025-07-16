import FeaturePreview from "./FeaturePreview";

const CodeSparkPreview = () => {
  const feature = {
    title: "CodeSpark",
    subtitle: "Interactive programming lessons",
    description: "Learn programming through hands-on coding exercises with real-time feedback. Support for multiple languages including Python, JavaScript, C++, and Java with AI-powered assistance.",
    image: "/api/placeholder/600/400",
    benefits: [
      "Interactive code editor with syntax highlighting",
      "Support for Python, JavaScript, C++, Java, and more",
      "Real-time code execution and feedback",
      "AI-powered debugging assistance",
      "Progressive difficulty levels",
      "Track your coding progress and achievements"
    ],
    gradient: "from-purple-500 to-pink-500"
  };

  return <FeaturePreview feature={feature} />;
};

export default CodeSparkPreview;