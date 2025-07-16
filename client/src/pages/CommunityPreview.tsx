import FeaturePreview from "./FeaturePreview";

const CommunityPreview = () => {
  const feature = {
    title: "SparkHub Community",
    subtitle: "Connect with fellow learners",
    description: "Join study groups, participate in forums, share knowledge, and collaborate with learners worldwide. Build connections and accelerate your learning through community support.",
    image: "/api/placeholder/600/400",
    benefits: [
      "Join study groups and find study partners",
      "Ask questions and get help from peers",
      "Share notes and learning resources",
      "Participate in academic discussions",
      "Build your reputation through helpful contributions",
      "Connect with learners in your field"
    ],
    gradient: "from-teal-500 to-cyan-500"
  };

  return <FeaturePreview feature={feature} />;
};

export default CommunityPreview;