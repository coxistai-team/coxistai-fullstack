import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Users, DollarSign, GraduationCap, Filter, X, TrendingUp, Award, BookOpen, Sparkles, Zap, Brain, Target, Lightbulb, CheckCircle, AlertCircle, Activity, BarChart3, Users2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import ParticleField from "@/components/effects/ParticleField";

interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  type: 'Public' | 'Private';
  satRange: [number, number];
  actRange: [number, number];
  gpaRange: [number, number];
  acceptanceRate: number;
  tuition: number;
  enrollment: number;
  ranking: number;
  majors: string[];
  description: string;
  website: string;
}

const COLLEGES: College[] = [
  {
    id: "1",
    name: "Harvard University",
    location: "Cambridge, MA",
    state: "Massachusetts",
    type: "Private",
    satRange: [1460, 1580],
    actRange: [33, 35],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 3.4,
    tuition: 54002,
    enrollment: 6755,
    ranking: 2,
    majors: ["Computer Science", "Economics", "Government", "Psychology", "English"],
    description: "Harvard University is a private Ivy League research university in Cambridge, Massachusetts.",
    website: "harvard.edu"
  },
  {
    id: "2",
    name: "Stanford University",
    location: "Stanford, CA",
    state: "California",
    type: "Private",
    satRange: [1440, 1570],
    actRange: [32, 35],
    gpaRange: [3.96, 4.0],
    acceptanceRate: 3.9,
    tuition: 56169,
    enrollment: 6994,
    ranking: 6,
    majors: ["Computer Science", "Engineering", "Economics", "Biology", "Psychology"],
    description: "Stanford University is a private research university in Stanford, California.",
    website: "stanford.edu"
  },
  {
    id: "3",
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, MA",
    state: "Massachusetts",
    type: "Private",
    satRange: [1510, 1580],
    actRange: [34, 36],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 6.7,
    tuition: 53790,
    enrollment: 4361,
    ranking: 2,
    majors: ["Computer Science", "Engineering", "Mathematics", "Physics", "Economics"],
    description: "MIT is a private research university in Cambridge, Massachusetts.",
    website: "mit.edu"
  },
  {
    id: "4",
    name: "University of California, Berkeley",
    location: "Berkeley, CA",
    state: "California",
    type: "Public",
    satRange: [1330, 1530],
    actRange: [30, 35],
    gpaRange: [3.89, 4.0],
    acceptanceRate: 14.5,
    tuition: 14170,
    enrollment: 31348,
    ranking: 22,
    majors: ["Computer Science", "Engineering", "Business", "Economics", "Biology"],
    description: "UC Berkeley is a public research university in Berkeley, California.",
    website: "berkeley.edu"
  },
  {
    id: "5",
    name: "Princeton University",
    location: "Princeton, NJ",
    state: "New Jersey",
    type: "Private",
    satRange: [1460, 1570],
    actRange: [33, 35],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 5.6,
    tuition: 51870,
    enrollment: 5321,
    ranking: 1,
    majors: ["Economics", "Computer Science", "International Affairs", "Psychology", "History"],
    description: "Princeton University is a private Ivy League research university in Princeton, New Jersey.",
    website: "princeton.edu"
  },
  {
    id: "6",
    name: "Yale University",
    location: "New Haven, CT",
    state: "Connecticut",
    type: "Private",
    satRange: [1460, 1580],
    actRange: [33, 35],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 6.3,
    tuition: 55500,
    enrollment: 5746,
    ranking: 4,
    majors: ["Economics", "Political Science", "History", "Psychology", "English"],
    description: "Yale University is a private Ivy League research university in New Haven, Connecticut.",
    website: "yale.edu"
  },
  {
    id: "7",
    name: "University of Chicago",
    location: "Chicago, IL",
    state: "Illinois",
    type: "Private",
    satRange: [1470, 1570],
    actRange: [33, 35],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 7.3,
    tuition: 57006,
    enrollment: 6264,
    ranking: 6,
    majors: ["Economics", "Mathematics", "Political Science", "Biology", "Psychology"],
    description: "The University of Chicago is a private research university in Chicago, Illinois.",
    website: "uchicago.edu"
  },
  {
    id: "8",
    name: "Columbia University",
    location: "New York, NY",
    state: "New York",
    type: "Private",
    satRange: [1450, 1560],
    actRange: [33, 35],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 5.1,
    tuition: 59430,
    enrollment: 6245,
    ranking: 18,
    majors: ["Economics", "Political Science", "Psychology", "English", "History"],
    description: "Columbia University is a private Ivy League research university in New York City.",
    website: "columbia.edu"
  },
  {
    id: "9",
    name: "University of Pennsylvania",
    location: "Philadelphia, PA",
    state: "Pennsylvania",
    type: "Private",
    satRange: [1450, 1570],
    actRange: [33, 35],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 8.1,
    tuition: 56212,
    enrollment: 9872,
    ranking: 8,
    majors: ["Business", "Economics", "Engineering", "Biology", "Psychology"],
    description: "The University of Pennsylvania is a private Ivy League research university in Philadelphia.",
    website: "upenn.edu"
  },
  {
    id: "10",
    name: "California Institute of Technology",
    location: "Pasadena, CA",
    state: "California",
    type: "Private",
    satRange: [1530, 1580],
    actRange: [35, 36],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 6.4,
    tuition: 54570,
    enrollment: 938,
    ranking: 9,
    majors: ["Engineering", "Physics", "Mathematics", "Computer Science", "Chemistry"],
    description: "Caltech is a private research university in Pasadena, California.",
    website: "caltech.edu"
  },
  {
    id: "11",
    name: "Duke University",
    location: "Durham, NC",
    state: "North Carolina",
    type: "Private",
    satRange: [1450, 1570],
    actRange: [33, 35],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 7.7,
    tuition: 55880,
    enrollment: 6649,
    ranking: 10,
    majors: ["Economics", "Public Policy", "Biology", "Psychology", "Computer Science"],
    description: "Duke University is a private research university in Durham, North Carolina.",
    website: "duke.edu"
  },
  {
    id: "12",
    name: "Northwestern University",
    location: "Evanston, IL",
    state: "Illinois",
    type: "Private",
    satRange: [1440, 1550],
    actRange: [33, 35],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 9.3,
    tuition: 56691,
    enrollment: 8327,
    ranking: 10,
    majors: ["Economics", "Engineering", "Journalism", "Psychology", "Political Science"],
    description: "Northwestern University is a private research university in Evanston, Illinois.",
    website: "northwestern.edu"
  },
  {
    id: "13",
    name: "University of California, Los Angeles",
    location: "Los Angeles, CA",
    state: "California",
    type: "Public",
    satRange: [1290, 1510],
    actRange: [29, 34],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 12.3,
    tuition: 13249,
    enrollment: 31636,
    ranking: 20,
    majors: ["Business Economics", "Biology", "Psychology", "Political Science", "Economics"],
    description: "UCLA is a public research university in Los Angeles, California.",
    website: "ucla.edu"
  },
  {
    id: "14",
    name: "Carnegie Mellon University",
    location: "Pittsburgh, PA",
    state: "Pennsylvania",
    type: "Private",
    satRange: [1460, 1560],
    actRange: [33, 35],
    gpaRange: [3.8, 4.0],
    acceptanceRate: 15.4,
    tuition: 55465,
    enrollment: 6896,
    ranking: 25,
    majors: ["Computer Science", "Engineering", "Business", "Drama", "Art"],
    description: "Carnegie Mellon University is a private research university in Pittsburgh, Pennsylvania.",
    website: "cmu.edu"
  },
  {
    id: "15",
    name: "University of Michigan",
    location: "Ann Arbor, MI",
    state: "Michigan",
    type: "Public",
    satRange: [1340, 1520],
    actRange: [31, 34],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 22.9,
    tuition: 15558,
    enrollment: 31266,
    ranking: 25,
    majors: ["Engineering", "Business", "Psychology", "Economics", "Computer Science"],
    description: "The University of Michigan is a public research university in Ann Arbor, Michigan.",
    website: "umich.edu"
  },
  {
    id: "16",
    name: "University of Virginia",
    location: "Charlottesville, VA",
    state: "Virginia",
    type: "Public",
    satRange: [1350, 1500],
    actRange: [31, 34],
    gpaRange: [3.9, 4.0],
    acceptanceRate: 23.9,
    tuition: 18059,
    enrollment: 16777,
    ranking: 25,
    majors: ["Economics", "Commerce", "Psychology", "Biology", "Government"],
    description: "The University of Virginia is a public research university in Charlottesville, Virginia.",
    website: "virginia.edu"
  },
  {
    id: "17",
    name: "Georgia Institute of Technology",
    location: "Atlanta, GA",
    state: "Georgia",
    type: "Public",
    satRange: [1370, 1520],
    actRange: [31, 35],
    gpaRange: [3.8, 4.0],
    acceptanceRate: 23.0,
    tuition: 12682,
    enrollment: 15507,
    ranking: 38,
    majors: ["Engineering", "Computer Science", "Business", "Architecture", "Sciences"],
    description: "Georgia Tech is a public research university in Atlanta, Georgia.",
    website: "gatech.edu"
  },
  {
    id: "18",
    name: "University of North Carolina at Chapel Hill",
    location: "Chapel Hill, NC",
    state: "North Carolina",
    type: "Public",
    satRange: [1300, 1480],
    actRange: [29, 33],
    gpaRange: [3.8, 4.0],
    acceptanceRate: 22.6,
    tuition: 8834,
    enrollment: 18523,
    ranking: 28,
    majors: ["Business", "Psychology", "Biology", "Economics", "Journalism"],
    description: "UNC Chapel Hill is a public research university in Chapel Hill, North Carolina.",
    website: "unc.edu"
  },
  {
    id: "19",
    name: "University of Southern California",
    location: "Los Angeles, CA",
    state: "California",
    type: "Private",
    satRange: [1360, 1520],
    actRange: [31, 34],
    gpaRange: [3.8, 4.0],
    acceptanceRate: 16.1,
    tuition: 56225,
    enrollment: 18794,
    ranking: 25,
    majors: ["Business", "Engineering", "Communications", "Cinema Arts", "Psychology"],
    description: "USC is a private research university in Los Angeles, California.",
    website: "usc.edu"
  },
  {
    id: "20",
    name: "New York University",
    location: "New York, NY",
    state: "New York",
    type: "Private",
    satRange: [1350, 1530],
    actRange: [31, 34],
    gpaRange: [3.7, 4.0],
    acceptanceRate: 20.1,
    tuition: 53308,
    enrollment: 26733,
    ranking: 30,
    majors: ["Liberal Studies", "Business", "Economics", "Psychology", "Computer Science"],
    description: "NYU is a private research university in New York City.",
    website: "nyu.edu"
  }
];

export default function CollegeRecommender() {
  const [filters, setFilters] = useState({
    satScore: 0,
    actScore: 0,
    gpa: 0,
    major: "any",
    state: "any",
    type: "any",
    maxTuition: 60000,
    minAcceptanceRate: 0,
    searchTerm: ""
  });

  const [showFilters, setShowFilters] = useState(false);

  const getMatchScore = (college: College) => {
    let score = 0;
    
    // Test score match (SAT or ACT)
    let testScoreBonus = 0;
    if (filters.satScore > 0) {
      if (filters.satScore >= college.satRange[0] && filters.satScore <= college.satRange[1]) {
        testScoreBonus = 30; // Perfect match
      } else if (filters.satScore >= college.satRange[0] - 50) {
        testScoreBonus = 25; // Close match
      } else if (filters.satScore >= college.satRange[0] - 100) {
        testScoreBonus = 15; // Reach school
      } else if (filters.satScore >= college.satRange[0] - 150) {
        testScoreBonus = 5; // Big reach
      }
    }
    
    if (filters.actScore > 0) {
      if (filters.actScore >= college.actRange[0] && filters.actScore <= college.actRange[1]) {
        testScoreBonus = Math.max(testScoreBonus, 30); // Perfect match
      } else if (filters.actScore >= college.actRange[0] - 1) {
        testScoreBonus = Math.max(testScoreBonus, 25); // Close match
      } else if (filters.actScore >= college.actRange[0] - 2) {
        testScoreBonus = Math.max(testScoreBonus, 15); // Reach school
      } else if (filters.actScore >= college.actRange[0] - 3) {
        testScoreBonus = Math.max(testScoreBonus, 5); // Big reach
      }
    }
    score += testScoreBonus;

    // GPA match
    if (filters.gpa > 0) {
      if (filters.gpa >= college.gpaRange[0]) {
        score += 25; // Meets or exceeds requirement
      } else if (filters.gpa >= college.gpaRange[0] - 0.1) {
        score += 20; // Very close
      } else if (filters.gpa >= college.gpaRange[0] - 0.2) {
        score += 15; // Close
      } else if (filters.gpa >= college.gpaRange[0] - 0.3) {
        score += 10; // Reach
      }
    }

    // Major match
    if (filters.major && filters.major !== "any" && college.majors.some(major => 
      major.toLowerCase().includes(filters.major.toLowerCase()))) {
      score += 20;
    }

    // Acceptance rate considerations
    if (college.acceptanceRate > 30) {
      score += 10; // Safety school bonus
    } else if (college.acceptanceRate < 10) {
      score -= 5; // Highly competitive penalty
    }

    // Ranking bonus
    if (college.ranking <= 10) {
      score += 15;
    } else if (college.ranking <= 25) {
      score += 10;
    } else if (college.ranking <= 50) {
      score += 5;
    }

    return Math.min(score, 100);
  };

  const filteredColleges = useMemo(() => {
    return COLLEGES.filter(college => {
      // SAT Score filter - more inclusive approach
      if (filters.satScore > 0) {
        const isInRange = filters.satScore >= college.satRange[0] - 100 && filters.satScore <= college.satRange[1] + 50;
        if (!isInRange) return false;
      }

      // ACT Score filter - more inclusive approach  
      if (filters.actScore > 0) {
        const isInRange = filters.actScore >= college.actRange[0] - 2 && filters.actScore <= college.actRange[1] + 1;
        if (!isInRange) return false;
      }

      // GPA filter - more inclusive approach
      if (filters.gpa > 0) {
        const isInRange = filters.gpa >= college.gpaRange[0] - 0.3;
        if (!isInRange) return false;
      }

      // Major filter
      if (filters.major && filters.major !== "any" && !college.majors.some(major => 
        major.toLowerCase().includes(filters.major.toLowerCase()))) {
        return false;
      }

      // State filter
      if (filters.state && filters.state !== "any" && college.state !== filters.state) {
        return false;
      }

      // Type filter
      if (filters.type && filters.type !== "any" && college.type !== filters.type) {
        return false;
      }

      // Tuition filter
      if (college.tuition > filters.maxTuition) {
        return false;
      }

      // Acceptance rate filter
      if (college.acceptanceRate < filters.minAcceptanceRate) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm && 
          !college.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !college.location.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by match score first, then by ranking
      const scoreA = getMatchScore(a);
      const scoreB = getMatchScore(b);
      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Higher score first
      }
      return a.ranking - b.ranking; // Lower ranking number first
    });
  }, [filters, getMatchScore]);

  const getMatchLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent Match", color: "bg-green-500" };
    if (score >= 60) return { level: "Good Match", color: "bg-blue-500" };
    if (score >= 40) return { level: "Possible Match", color: "bg-yellow-500" };
    return { level: "Reach School", color: "bg-red-500" };
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-black text-white overflow-hidden">
      {/* Particle Field Background */}
      <ParticleField />
      
      {/* Creative Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating-element"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-2xl floating-element"></div>
        
        {/* Creative Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl creative-shape"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg creative-shape"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-md creative-shape"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg flex items-center justify-center">
            <GraduationCap className="w-8 h-8 mr-3 text-blue-400" />
            College Finder
          </h1>
          <p className="text-slate-400 text-lg font-medium drop-shadow-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 mr-2 text-green-400" />
            Find colleges that match your academic profile and preferences
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glassmorphism-strong shadow-xl border-slate-500/20 bg-slate-900/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search colleges by name or location..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="w-full glassmorphism border-slate-500/20 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="flex items-center gap-2 glassmorphism-button border-slate-500/20 text-white hover:bg-slate-600/20"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {showFilters && <X className="h-4 w-4" />}
                </Button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-slate-500/20"
                >
                  <div>
                    <Label className="text-sm font-medium mb-2 block text-white">SAT Score</Label>
                    <Input
                      type="number"
                      placeholder="1600"
                      value={filters.satScore || ""}
                      onChange={(e) => setFilters({ ...filters, satScore: parseInt(e.target.value) || 0 })}
                      className="glassmorphism border-slate-500/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block text-white">ACT Score</Label>
                    <Input
                      type="number"
                      placeholder="36"
                      value={filters.actScore || ""}
                      onChange={(e) => setFilters({ ...filters, actScore: parseInt(e.target.value) || 0 })}
                      className="glassmorphism border-slate-500/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block text-white">GPA</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="4.0"
                      value={filters.gpa || ""}
                      onChange={(e) => setFilters({ ...filters, gpa: parseFloat(e.target.value) || 0 })}
                      className="glassmorphism border-slate-500/20 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block text-white">Major</Label>
                    <Select value={filters.major} onValueChange={(value) => setFilters({ ...filters, major: value })}>
                      <SelectTrigger className="glassmorphism border-slate-500/20 text-white">
                        <SelectValue placeholder="Select major" />
                      </SelectTrigger>
                      <SelectContent className="glassmorphism border-slate-500/20 bg-slate-800">
                        <SelectItem value="any" className="text-white hover:bg-slate-700">Any Major</SelectItem>
                        <SelectItem value="Computer Science" className="text-white hover:bg-slate-700">Computer Science</SelectItem>
                        <SelectItem value="Engineering" className="text-white hover:bg-slate-700">Engineering</SelectItem>
                        <SelectItem value="Business" className="text-white hover:bg-slate-700">Business</SelectItem>
                        <SelectItem value="Economics" className="text-white hover:bg-slate-700">Economics</SelectItem>
                        <SelectItem value="Biology" className="text-white hover:bg-slate-700">Biology</SelectItem>
                        <SelectItem value="Psychology" className="text-white hover:bg-slate-700">Psychology</SelectItem>
                        <SelectItem value="Political Science" className="text-white hover:bg-slate-700">Political Science</SelectItem>
                        <SelectItem value="Mathematics" className="text-white hover:bg-slate-700">Mathematics</SelectItem>
                        <SelectItem value="Physics" className="text-white hover:bg-slate-700">Physics</SelectItem>
                        <SelectItem value="Chemistry" className="text-white hover:bg-slate-700">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block text-white">State</Label>
                    <Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value })}>
                      <SelectTrigger className="glassmorphism border-slate-500/20 text-white">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="glassmorphism border-slate-500/20 bg-slate-800">
                        <SelectItem value="any" className="text-white hover:bg-slate-700">Any State</SelectItem>
                        <SelectItem value="California" className="text-white hover:bg-slate-700">California</SelectItem>
                        <SelectItem value="Massachusetts" className="text-white hover:bg-slate-700">Massachusetts</SelectItem>
                        <SelectItem value="New York" className="text-white hover:bg-slate-700">New York</SelectItem>
                        <SelectItem value="Pennsylvania" className="text-white hover:bg-slate-700">Pennsylvania</SelectItem>
                        <SelectItem value="Illinois" className="text-white hover:bg-slate-700">Illinois</SelectItem>
                        <SelectItem value="Michigan" className="text-white hover:bg-slate-700">Michigan</SelectItem>
                        <SelectItem value="Virginia" className="text-white hover:bg-slate-700">Virginia</SelectItem>
                        <SelectItem value="North Carolina" className="text-white hover:bg-slate-700">North Carolina</SelectItem>
                        <SelectItem value="Georgia" className="text-white hover:bg-slate-700">Georgia</SelectItem>
                        <SelectItem value="Connecticut" className="text-white hover:bg-slate-700">Connecticut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block text-white">School Type</Label>
                    <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                      <SelectTrigger className="glassmorphism border-slate-500/20 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="glassmorphism border-slate-500/20 bg-slate-800">
                        <SelectItem value="any" className="text-white hover:bg-slate-700">Any Type</SelectItem>
                        <SelectItem value="Public" className="text-white hover:bg-slate-700">Public</SelectItem>
                        <SelectItem value="Private" className="text-white hover:bg-slate-700">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block text-white">Max Tuition: ${filters.maxTuition.toLocaleString()}</Label>
                    <Slider
                      value={[filters.maxTuition]}
                      onValueChange={(value) => setFilters({ ...filters, maxTuition: value[0] })}
                      max={60000}
                      min={5000}
                      step={5000}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block text-white">Min Acceptance Rate: {filters.minAcceptanceRate}%</Label>
                    <Slider
                      value={[filters.minAcceptanceRate]}
                      onValueChange={(value) => setFilters({ ...filters, minAcceptanceRate: value[0] })}
                      max={50}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => setFilters({
                        satScore: 0,
                        actScore: 0,
                        gpa: 0,
                        major: "any",
                        state: "any",
                        type: "any",
                        maxTuition: 60000,
                        minAcceptanceRate: 0,
                        searchTerm: ""
                      })}
                      variant="outline"
                      className="w-full glassmorphism-button border-slate-500/20 text-white hover:bg-slate-600/20"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-white text-lg font-semibold drop-shadow-lg">
            Found {filteredColleges.length} colleges matching your criteria
          </p>
        </div>

        {/* College Results */}
        <div className="grid gap-6">
          {filteredColleges.map((college, index) => {
            const matchScore = getMatchScore(college);
            const matchInfo = getMatchLevel(matchScore);
            
            return (
              <motion.div
                key={college.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glassmorphism-strong shadow-xl border-slate-500/20 hover:border-slate-400/40 transition-all duration-300 bg-slate-900/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {college.name}
                          </h3>
                          <Badge className={`${matchInfo.color} text-white`}>
                            {matchInfo.level}
                          </Badge>
                          <Badge variant="outline" className="text-slate-300 border-slate-400">
                            #{college.ranking}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {college.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {college.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {college.enrollment.toLocaleString()} students
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm">
                          {college.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                        <div className="text-lg font-bold text-blue-400">
                          {college.satRange[0]}-{college.satRange[1]}
                        </div>
                        <div className="text-xs text-slate-300">SAT Range</div>
                      </div>
                      
                      <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                        <div className="text-lg font-bold text-green-400">
                          {college.gpaRange[0]}-{college.gpaRange[1]}
                        </div>
                        <div className="text-xs text-slate-300">GPA Range</div>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                        <div className="text-lg font-bold text-purple-400">
                          {college.acceptanceRate}%
                        </div>
                        <div className="text-xs text-slate-300">Accept Rate</div>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-900/20 rounded-lg border border-orange-500/20">
                        <div className="text-lg font-bold text-orange-400">
                          ${college.tuition.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-300">Annual Tuition</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block text-white">Popular Majors:</Label>
                      <div className="flex flex-wrap gap-2">
                        {college.majors.slice(0, 5).map((major) => (
                          <Badge key={major} variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                            {major}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">Match Score:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${matchInfo.color} transition-all duration-500`}
                              style={{ width: `${matchScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white">{matchScore}%</span>
                        </div>
                      </div>
                      
                      <Button size="sm" className="bg-slate-800 text-white hover:bg-slate-700 border border-slate-600">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredColleges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-slate-400 mb-4">
              <Search className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No colleges found</h3>
              <p>Try adjusting your filters to see more results.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
