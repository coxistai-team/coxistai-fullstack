import FeaturePreview from "./FeaturePreview";

const NotesHubPreview = () => {
  const feature = {
    title: "Notes Hub",
    subtitle: "Smart note-taking & organization",
    description: "Create, organize, and search through your notes with AI-powered features. Export to PDF, collaborate with others, and never lose track of important information.",
    image: "/api/placeholder/600/400",
    benefits: [
      "Smart note organization with tags and categories",
      "Advanced search across all your notes",
      "Rich text editor with formatting options",
      "PDF export functionality",
      "Real-time collaboration features",
      "AI-powered note suggestions and summaries"
    ],
    gradient: "from-green-500 to-blue-500"
  };

  return <FeaturePreview feature={feature} />;
};

export default NotesHubPreview;