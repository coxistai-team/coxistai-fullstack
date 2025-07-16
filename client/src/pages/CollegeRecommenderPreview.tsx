import FeaturePreview from "./FeaturePreview";

const CollegeRecommenderPreview = () => {
  const feature = {
    title: "College Recommender",
    subtitle: "AI college recommendations",
    description: "Get personalized college recommendations based on your academic profile, preferences, and career goals. Compare colleges, track applications, and make informed decisions about your future.",
    image: "/api/placeholder/600/400",
    benefits: [
      "Personalized college recommendations using AI",
      "Compare colleges by rankings, costs, and programs",
      "Track your application progress",
      "Admission probability calculations",
      "Scholarship and financial aid information",
      "Career outcome data for each institution"
    ],
    gradient: "from-emerald-500 to-teal-500"
  };

  return <FeaturePreview feature={feature} />;
};

export default CollegeRecommenderPreview;