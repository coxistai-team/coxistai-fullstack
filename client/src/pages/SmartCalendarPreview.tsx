import FeaturePreview from "./FeaturePreview";

const SmartCalendarPreview = () => {
  const feature = {
    title: "Smart Calendar",
    subtitle: "AI-powered scheduling",
    description: "Intelligent calendar management with Google Calendar sync, AI-powered scheduling suggestions, and automated study session planning to optimize your learning schedule.",
    image: "/api/placeholder/600/400",
    benefits: [
      "Google Calendar integration and sync",
      "AI-powered scheduling suggestions",
      "Automated study session planning",
      "Smart reminder notifications",
      "Task and deadline management",
      "Analytics on study time and productivity"
    ],
    gradient: "from-indigo-500 to-purple-500"
  };

  return <FeaturePreview feature={feature} />;
};

export default SmartCalendarPreview;