export interface CardData {
  title: string;
  description: string;
  tag?: string;
  timeAgo: string;
  author?: string;
}

export const cardData = {
  ideas: [
    {
      title: "Why Brand Storytelling is Essential in Today's Digital Age",
      description: "Storytelling builds brand loyalty and emotional engagement",
      tag: "Storytelling",
      timeAgo: "2 hours ago",
      author: "Sarah M."
    },
    {
      title: "Demystifying SEO: Tips for Ranking Higher in 2024",
      description: "Improve visibility with SEO and search engine best practices",
      tag: "SEO",
      timeAgo: "4 hours ago",
      author: "Mike L."
    },
    {
      title: "The Future of Marketing: Trends to Watch in 2024",
      description: "AI, VR, and personalization trends shaping the industry",
      tag: undefined,
      timeAgo: "1 day ago",
      author: "Alex K."
    },
    {
      title: "Social Media Content Calendar Strategy",
      description: "Plan and schedule content for maximum engagement across platforms",
      tag: "Social",
      timeAgo: "2 days ago",
      author: "Emma R."
    },
    {
      title: "Email Marketing Automation Workflows",
      description: "Set up automated sequences to nurture leads and boost conversions",
      tag: "Email",
      timeAgo: "3 days ago",
      author: "David W."
    }
  ],
  research: [
    {
      title: "Harnessing the Power of Data: How to Create Data-Driven Marketing Campaigns",
      description: "Use data to personalize and target campaigns effectively",
      tag: "Data",
      timeAgo: "5 hours ago",
      author: "Lisa P."
    },
    {
      title: "Consumer Behavior Analysis Q4 2024",
      description: "Deep dive into purchasing patterns and decision-making factors",
      tag: "Analytics",
      timeAgo: "1 day ago",
      author: "Tom H."
    },
    {
      title: "Competitor Analysis: Social Media Strategies",
      description: "Comprehensive review of competitor social media approaches and performance",
      tag: "Research",
      timeAgo: "2 days ago",
      author: "Jenny S."
    }
  ],
  outline: [
    {
      title: "From Browsers to Buyers: Optimizing Your Website for Conversion",
      description: "Improve UX, CTAs, and reduce cart abandonment rates",
      tag: "Conversion",
      timeAgo: "6 hours ago",
      author: "Chris D."
    }
  ]
};