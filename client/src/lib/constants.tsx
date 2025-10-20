export const COLORS = {
  primaryBg: '#0f0f1a',
  cardBg: '#21223a',
  accentBlue: '#3a86ff',
  mintGreen: '#06d6a0',
  textPrimary: '#ffffff',
  textSecondary: '#b0bec5'
} as const;

export const NAVIGATION_ITEMS = [
  { id: 'notes', label: 'Notes Hub', path: '/notes' },
  { id: 'calendar', label: 'Smart Calendar', path: '/calendar' },
  { id: 'chat', label: 'AI CFO Chat', path: '/chat' },
  { id: 'presentations', label: 'AI PPTs', path: '/presentations' },
  { id: 'community', label: 'Community', path: '/community' },
  { id: 'code', label: 'CodeSpark', path: '/code' },
  { id: 'college', label: 'Startup Recommender', path: '/college' },
] as const;

export const MOCK_STARTUP_DATA = [
  {
    id: 1,
    name: "TechCorp Inc.",
    location: "San Francisco, CA",
    rank: 2,
    acceptanceRate: 4,
    avgSAT: 1520,
    employees: "50-200",
    matchScore: 96,
    logo: "SU",
    color: "from-red-500 to-red-600",
    description: "Leading fintech startup with strong AI and machine learning focus. Excellent growth opportunities.",
    tags: ["Fintech", "AI/ML"]
  },
  {
    id: 2,
    name: "MIT",
    location: "Cambridge, MA",
    rank: 1,
    acceptanceRate: 7,
    avgSAT: 1535,
    students: "11K",
    matchScore: 94,
    logo: "MIT",
    color: "from-blue-500 to-blue-600",
    description: "Leading institution in technology and innovation. Excellent research opportunities and entrepreneurship programs.",
    tags: ["Engineering", "Research"]
  },
  {
    id: 3,
    name: "University of Washington",
    location: "Seattle, WA",
    rank: 58,
    acceptanceRate: 56,
    avgSAT: 1420,
    students: "47K",
    matchScore: 89,
    logo: "UW",
    color: "from-purple-500 to-purple-600",
    description: "Strong computer science and engineering programs. Located in the heart of the tech industry.",
    tags: ["Computer Science", "Large Campus"]
  }
];

export const MOCK_NOTES_DATA = [
  {
    id: 1,
    title: "Calculus Derivatives",
    lastEdited: "2 hours ago",
    tags: ["Math", "Calculus"],
    content: `# Calculus Derivatives

## Definition
The derivative of a function measures the rate at which the function's value changes with respect to changes in its input. It represents the slope of the tangent line to the function's graph at any given point.

## Basic Formula
f'(x) = lim(h→0) [f(x+h) - f(x)] / h

## Common Derivatives
- d/dx(x^n) = nx^(n-1)
- d/dx(sin x) = cos x
- d/dx(cos x) = -sin x
- d/dx(e^x) = e^x

## Chain Rule
For composite functions: d/dx[f(g(x))] = f'(g(x)) · g'(x)`,
    active: true
  },
  {
    id: 2,
    title: "Organic Chemistry Basics",
    lastEdited: "yesterday",
    tags: ["Chemistry"],
    content: "Basic organic chemistry concepts...",
    active: false
  },
  {
    id: 3,
    title: "World War II Timeline",
    lastEdited: "3 days ago",
    tags: ["History"],
    content: "World War II historical timeline...",
    active: false
  }
];

export const TEAM_DATA = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    role: "CEO & Co-Founder",
    designation: "Former Stripe Finance VP",
    image: "SC",
    linkedin: "https://linkedin.com/in/sarahchen",
    email: "teamcoxistai@gmail.com",
    bio: "Leading AI finance innovation with 10+ years in fintech and startup finance research.",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "CTO & Co-Founder",
    designation: "Ex-Microsoft Principal Engineer",
    image: "MR",
    linkedin: "https://linkedin.com/in/marcusrodriguez",
    email: "teamcoxistai@gmail.com",
    bio: "Building scalable finance platforms with expertise in fintech and startup operations.",
    gradient: "from-green-500 to-blue-600"
  },
  {
    id: 3,
    name: "Dr. Priya Patel",
    role: "Head of AI Research",
    designation: "Former Goldman Sachs Quant",
    image: "PP",
    linkedin: "https://linkedin.com/in/priyapatel",
    email: "teamcoxistai@gmail.com",
    bio: "Developing next-generation AI algorithms for cashflow forecasting and financial risk management.",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Head of Product",
    designation: "Former Stripe Finance Lead",
    image: "JW",
    linkedin: "https://linkedin.com/in/jameswilson",
    email: "teamcoxistai@gmail.com",
    bio: "Designing intuitive finance dashboards that help founders make data-driven decisions.",
    gradient: "from-orange-500 to-red-600"
  },
  {
    id: 5,
    name: "Emily Zhang",
    role: "Lead UX Designer",
    designation: "Design Systems Specialist",
    image: "EZ",
    linkedin: "https://linkedin.com/in/emilyzhang",
    email: "teamcoxistai@gmail.com",
    bio: "Creating beautiful, accessible interfaces that make financial data understandable for founders.",
    gradient: "from-teal-500 to-green-600"
  },
  {
    id: 6,
    name: "Alex Kumar",
    role: "Head of Engineering",
    designation: "Full-Stack Architecture Expert",
    image: "AK",
    linkedin: "https://linkedin.com/in/alexkumar",
    email: "teamcoxistai@gmail.com",
    bio: "Building robust, secure infrastructure for financial data processing and real-time analytics.",
    gradient: "from-indigo-500 to-blue-600"
  }
];

export const MOCK_COMMUNITY_DATA = [
  {
    id: 1,
    title: "Weekly Finance Review: Cashflow Analysis",
    content: "Join us every Wednesday at 7 PM EST for collaborative finance sessions. This week we're covering cashflow forecasting...",
    author: "Finance Expert Mike",
    avatar: "MT",
    category: "Finance Groups",
    isPinned: true,
    replies: 23,
    views: 156,
    timeAgo: "2 hours ago"
  },
  {
    id: 2,
    title: "Need help with organic chemistry mechanisms",
    content: "I'm struggling to understand SN1 vs SN2 reactions. Can someone explain the key differences and when each occurs?",
    author: "Jessica Liu",
    avatar: "J",
    category: "Q&A",
    isPinned: false,
    replies: 7,
    views: 42,
    timeAgo: "4 hours ago"
  },
  {
    id: 3,
    title: "Complete Physics Formulas Sheet - Mechanics",
    content: "Comprehensive cashflow analysis covering burn rate, runway calculations, and fundraising metrics. Perfect for startup founders!",
    author: "David Park",
    avatar: "D",
    category: "Shared Notes",
    isPinned: false,
    downloads: 89,
    likes: 24,
    timeAgo: "6 hours ago"
  }
];
