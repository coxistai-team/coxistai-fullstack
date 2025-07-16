import FeaturePreview from "./FeaturePreview";

const AIPresentationsPreview = () => {
  const feature = {
    title: "AI Presentations",
    subtitle: "Create stunning slides with AI",
    description: "Generate professional presentations automatically with AI assistance. Create beautiful slides, add charts and visuals, and export to PowerPoint format for seamless sharing.",
    image: "/api/placeholder/600/400",
    benefits: [
      "AI-powered slide generation from topics",
      "Professional templates and designs",
      "Interactive charts and data visualization",
      "Export to PowerPoint and PDF formats",
      "Customizable themes and layouts",
      "Real-time collaboration features"
    ],
    gradient: "from-orange-500 to-red-500"
  };

  return <FeaturePreview feature={feature} />;
};

export default AIPresentationsPreview;