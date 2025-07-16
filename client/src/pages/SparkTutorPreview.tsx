import FeaturePreview from "./FeaturePreview";

const SparkTutorPreview = () => {
  const feature = {
    title: "SparkTutor AI Chat",
    subtitle: "Your personal AI learning assistant",
    description: "Get instant help with homework, explanations of complex concepts, and step-by-step problem solving. Upload images, documents, and get personalized tutoring 24/7.",
    image: "/api/placeholder/600/400",
    benefits: [
      "Instant homework help across all subjects",
      "Step-by-step problem explanations",
      "Upload images and documents for analysis",
      "Voice and text interactions",
      "Personalized learning recommendations",
      "24/7 availability for study sessions"
    ],
    gradient: "from-blue-500 to-green-500"
  };

  return <FeaturePreview feature={feature} />;
};

export default SparkTutorPreview;