import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Play, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  ExternalLink,
  Book,
  Video,
  Code,
  Terminal,
  Download,
  Search,
  Plus,
  X,
  Upload
} from "lucide-react";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = import.meta.env.VITE_API_URL;

const CodeSpark = () => {
  const getDefaultCode = (language: string) => {
    const defaultCodes: Record<string, string> = {
      python: `print("Hello, World!")
# Write your Python code here`,
      javascript: `console.log("Hello, World!");
// Write your JavaScript code here`,
      c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
    };
    return defaultCodes[language] || defaultCodes.python;
  };

  const [code, setCode] = useState(getDefaultCode("python"));
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [error, setError] = useState("");
  const [userInput, setUserInput] = useState("");
  const [executionTime, setExecutionTime] = useState(0);
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [customCourse, setCustomCourse] = useState({ name: "", query: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState<number | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  
  // Ref for code editor section
  const codeEditorRef = useRef<HTMLDivElement>(null);

  // Coding challenges to fill empty space
  const codingChallenges = [
    {
      id: 1,
      title: "FizzBuzz Challenge",
      difficulty: "Beginner",
      description: "Print numbers 1-100, but replace multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', and multiples of both with 'FizzBuzz'",
      category: "Logic",
      points: 10,
      completed: false,
      hint: "Use modulo operator (%) to check for multiples",
      testCases: [
        { input: "1", expected: "1" },
        { input: "3", expected: "Fizz" },
        { input: "5", expected: "Buzz" },
        { input: "15", expected: "FizzBuzz" }
      ]
    },
    {
      id: 2,
      title: "Palindrome Checker",
      difficulty: "Beginner",
      description: "Check if a given string reads the same forwards and backwards",
      category: "Strings",
      points: 15,
      completed: false,
      hint: "Compare the string with its reverse",
      testCases: [
        { input: "racecar", expected: "true" },
        { input: "hello", expected: "false" },
        { input: "A man a plan a canal Panama", expected: "true" }
      ]
    },
    {
      id: 3,
      title: "Factorial Calculator",
      difficulty: "Beginner",
      description: "Calculate the factorial of a given number using recursion or iteration",
      category: "Math",
      points: 12,
      completed: false,
      hint: "factorial(n) = n * factorial(n-1), with factorial(0) = 1",
      testCases: [
        { input: "5", expected: "120" },
        { input: "0", expected: "1" },
        { input: "3", expected: "6" }
      ]
    },
    {
      id: 4,
      title: "Array Sum",
      difficulty: "Intermediate",
      description: "Find the sum of all elements in an array",
      category: "Arrays",
      points: 18,
      completed: false,
      hint: "Use a loop or built-in array methods",
      testCases: [
        { input: "[1, 2, 3, 4, 5]", expected: "15" },
        { input: "[-1, 0, 1]", expected: "0" },
        { input: "[10, 20]", expected: "30" }
      ]
    },
    {
      id: 5,
      title: "Prime Number Check",
      difficulty: "Intermediate",
      description: "Determine if a given number is prime",
      category: "Math",
      points: 20,
      completed: false,
      hint: "A prime number is only divisible by 1 and itself",
      testCases: [
        { input: "7", expected: "true" },
        { input: "4", expected: "false" },
        { input: "2", expected: "true" }
      ]
    },
    {
      id: 6,
      title: "Binary Search",
      difficulty: "Advanced",
      description: "Implement binary search algorithm to find an element in a sorted array",
      category: "Algorithms",
      points: 25,
      completed: false,
      hint: "Divide and conquer - compare with middle element",
      testCases: [
        { input: "arr=[1,3,5,7,9], target=5", expected: "2" },
        { input: "arr=[1,2,3,4,5], target=6", expected: "-1" },
        { input: "arr=[10,20,30], target=20", expected: "1" }
      ]
    }
  ];

  // Programming tips to display
  const programmingTips = [
    {
      id: 1,
      category: "Best Practices",
      tip: "Use meaningful variable names that describe what the data represents",
      example: "Use 'userAge' instead of 'x' for storing a person's age"
    },
    {
      id: 2,
      category: "Debugging",
      tip: "Use print statements or console.log to track variable values during execution",
      example: "Add console.log(variable) to see what value it contains"
    },
    {
      id: 3,
      category: "Performance",
      tip: "Avoid nested loops when possible - they can slow down your program significantly",
      example: "Try using hash maps or sets for faster lookups instead of nested loops"
    },
    {
      id: 4,
      category: "Code Organization",
      tip: "Break large functions into smaller, reusable functions",
      example: "Instead of one 100-line function, create several 10-20 line functions"
    }
  ];

  // Default courses with YouTube links
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Python Full Course",
      description: "Complete Python tutorial for beginners",
      duration: "4 hours",
      views: "15M",
      youtubeUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
      thumbnail: "🐍"
    },
    {
      id: 2,
      name: "JavaScript Crash Course",
      description: "Learn JavaScript fundamentals quickly",
      duration: "2.5 hours",
      views: "8M",
      youtubeUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
      thumbnail: "🟨"
    },
    {
      id: 3,
      name: "React Tutorial",
      description: "Modern React development with hooks",
      duration: "3 hours",
      views: "5M",
      youtubeUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      thumbnail: "⚛️"
    },
    {
      id: 4,
      name: "Node.js Backend Course",
      description: "Build APIs and servers with Node.js",
      duration: "6 hours",
      views: "3M",
      youtubeUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE",
      thumbnail: "🟢"
    },
    {
      id: 5,
      name: "SQL Database Tutorial",
      description: "Master database queries and design",
      duration: "2 hours",
      views: "4M",
      youtubeUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
      thumbnail: "🗄️"
    }
  ]);

  const roadmapItems = [
    {
      id: 1,
      title: "Programming Fundamentals",
      description: "Variables, data types, and basic operations",
      completed: true,
      progress: 100,
      color: "green",
      lessons: ["Variables & Data Types", "Basic Operations", "Input/Output"],
      detailedContent: {
        overview: "Master the building blocks of programming including variables, data types, and fundamental operations.",
        concepts: [
          {
            title: "Variables & Data Types",
            description: "Learn how to store and manipulate different types of data",
            points: [
              "String variables for text data",
              "Integer variables for whole numbers", 
              "Float variables for decimal numbers",
              "Boolean variables for true/false values",
              "Variable naming conventions"
            ]
          },
          {
            title: "Basic Operations", 
            description: "Perform calculations and manipulate data",
            points: [
              "Arithmetic operations (+, -, *, /)",
              "String concatenation and manipulation",
              "Type conversion between data types",
              "Assignment operators (=, +=, -=)",
              "Operator precedence and evaluation order"
            ]
          },
          {
            title: "Input/Output",
            description: "Interact with users and display results",
            points: [
              "Getting user input with input() functions",
              "Displaying output with print() statements",
              "Formatting output with f-strings",
              "Reading from and writing to files",
              "Error handling for invalid input"
            ]
          }
        ]
      }
    },
    {
      id: 2,
      title: "Control Structures",
      description: "If statements, loops, and conditionals",
      completed: false,
      progress: 75,
      color: "blue",
      current: true,
      lessons: ["If Statements", "For Loops", "While Loops", "Switch Cases"],
      detailedContent: {
        overview: "Control the flow of your programs with conditional statements and loops to make decisions and repeat actions.",
        concepts: [
          {
            title: "Conditional Statements",
            description: "Make decisions in your code based on conditions",
            points: [
              "if statements for basic conditions",
              "else clauses for alternative actions",
              "elif for multiple condition checks",
              "Nested conditionals for complex logic",
              "Comparison operators (==, !=, <, >)"
            ]
          },
          {
            title: "For Loops",
            description: "Iterate over sequences and repeat code blocks",
            points: [
              "Basic for loop syntax and structure",
              "Iterating through lists and ranges",
              "Using loop variables and counters",
              "Nested loops for multi-dimensional data",
              "Loop control with break and continue"
            ]
          },
          {
            title: "While Loops",
            description: "Repeat code while conditions are true",
            points: [
              "While loop syntax and conditions",
              "Avoiding infinite loops",
              "Loop counters and incrementing",
              "Input validation with while loops",
              "Do-while loop patterns"
            ]
          }
        ]
      }
    },
    {
      id: 3,
      title: "Functions & Modules",
      description: "Creating reusable code blocks",
      completed: false,
      progress: 30,
      color: "orange",
      lessons: ["Function Definition", "Parameters", "Return Values", "Modules"],
      detailedContent: {
        overview: "Organize your code into reusable functions and modules to create more maintainable and efficient programs.",
        concepts: [
          {
            title: "Function Basics",
            description: "Create and use functions to organize code",
            points: [
              "Function definition syntax (def keyword)",
              "Function naming conventions",
              "Calling functions and execution flow",
              "Local vs global variable scope",
              "Function documentation with docstrings"
            ]
          },
          {
            title: "Parameters & Arguments",
            description: "Pass data to functions for processing",
            points: [
              "Positional parameters and arguments",
              "Default parameter values",
              "Keyword arguments for clarity",
              "Variable-length arguments (*args, **kwargs)",
              "Parameter validation and type hints"
            ]
          },
          {
            title: "Return Values & Modules",
            description: "Get results from functions and organize code",
            points: [
              "Returning single and multiple values",
              "Using return statements effectively",
              "Importing modules and libraries",
              "Creating your own modules",
              "Package management and dependencies"
            ]
          }
        ]
      }
    },
    {
      id: 4,
      title: "Data Structures",
      description: "Arrays, lists, objects, and more",
      completed: false,
      progress: 0,
      color: "gray",
      lessons: ["Arrays", "Objects", "Sets", "Maps"],
      detailedContent: {
        overview: "Master different ways to organize and store data efficiently for various programming tasks.",
        concepts: [
          {
            title: "Lists & Arrays",
            description: "Store and manipulate ordered collections of data",
            points: [
              "Creating and initializing lists",
              "Accessing elements by index",
              "Adding and removing elements",
              "List slicing and subsetting",
              "Sorting and searching in lists"
            ]
          },
          {
            title: "Dictionaries & Objects",
            description: "Store key-value pairs and structured data",
            points: [
              "Creating dictionaries with key-value pairs",
              "Accessing and modifying dictionary values",
              "Dictionary methods and operations",
              "Nested dictionaries for complex data",
              "JSON data handling and conversion"
            ]
          },
          {
            title: "Sets & Advanced Structures",
            description: "Work with unique collections and specialized structures",
            points: [
              "Creating sets for unique elements",
              "Set operations (union, intersection)",
              "Tuples for immutable sequences",
              "Stack and queue implementations",
              "Choosing the right data structure"
            ]
          }
        ]
      }
    },
    {
      id: 5,
      title: "Object-Oriented Programming",
      description: "Classes, objects, and inheritance",
      completed: false,
      progress: 0,
      color: "gray",
      lessons: ["Classes", "Objects", "Inheritance", "Polymorphism"],
      detailedContent: {
        overview: "Learn to organize code using objects and classes for more scalable and maintainable applications.",
        concepts: [
          {
            title: "Classes & Objects",
            description: "Create blueprints and instances for structured programming",
            points: [
              "Class definition and structure",
              "Creating object instances",
              "Instance variables and attributes",
              "Constructor methods (__init__)",
              "Class vs instance methods"
            ]
          },
          {
            title: "Inheritance & Polymorphism",
            description: "Extend classes and create flexible object hierarchies",
            points: [
              "Inheriting from parent classes",
              "Method overriding and extension",
              "Super() for parent class access",
              "Multiple inheritance patterns",
              "Abstract classes and interfaces"
            ]
          },
          {
            title: "Encapsulation & Design",
            description: "Hide implementation details and design clean interfaces",
            points: [
              "Private and protected attributes",
              "Property decorators and getters/setters",
              "Class design principles",
              "Composition vs inheritance",
              "Design patterns and best practices"
            ]
          }
        ]
      }
    }
  ];

  const codeExamples: Record<string, Record<string, string>> = {
    python: {
      "Hello World": `print("Hello, World!")
print("Welcome to Python!")`,
      "User Input": `name = input("Enter your name: ")
age = int(input("Enter your age: "))
print(f"Hello {name}! You are {age} years old.")`,
      "Calculator": `num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))
operation = input("Enter operation (+, -, *, /): ")

if operation == "+":
    result = num1 + num2
elif operation == "-":
    result = num1 - num2
elif operation == "*":
    result = num1 * num2
elif operation == "/":
    result = num1 / num2
else:
    result = "Invalid operation"

print(f"Result: {result}")`,
      "For Loop": `n = int(input("Enter number of iterations: "))
for i in range(n):
    print(f"Count: {i + 1}")
    
print("Loop completed!")`
    },
    javascript: {
      "Hello World": `console.log("Hello, World!");
console.log("Welcome to JavaScript!");`,
      "Variables": `const name = "Alice";
let age = 25;
const height = 5.7;
console.log(\`Name: \${name}, Age: \${age}, Height: \${height}\`);`,
      "If Statement": `const age = 18;
if (age >= 18) {
    console.log("You can vote!");
} else {
    console.log("Wait until you're 18");
}`,
      "For Loop": `for (let i = 0; i < 5; i++) {
    console.log(\`Count: \${i}\`);
}

const fruits = ["apple", "banana", "orange"];
fruits.forEach(fruit => {
    console.log(\`I like \${fruit}\`);
});`
    },
    c: {
      "Hello World": `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Welcome to C!\\n");
    return 0;
}`,
      "Variables": `#include <stdio.h>

int main() {
    char name[] = "Alice";
    int age = 25;
    float height = 5.7;
    printf("Name: %s, Age: %d, Height: %.1f\\n", name, age, height);
    return 0;
}`,
      "If Statement": `#include <stdio.h>

int main() {
    int age = 18;
    if (age >= 18) {
        printf("You can vote!\\n");
    } else {
        printf("Wait until you're 18\\n");
    }
    return 0;
}`,
      "For Loop": `#include <stdio.h>

int main() {
    for (int i = 0; i < 5; i++) {
        printf("Count: %d\\n", i);
    }
    
    char fruits[][10] = {"apple", "banana", "orange"};
    for (int i = 0; i < 3; i++) {
        printf("I like %s\\n", fruits[i]);
    }
    return 0;
}`
    },
    cpp: {
      "Hello World": `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "Welcome to C++!" << endl;
    return 0;
}`,
      "Variables": `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Alice";
    int age = 25;
    float height = 5.7;
    cout << "Name: " << name << ", Age: " << age << ", Height: " << height << endl;
    return 0;
}`,
      "If Statement": `#include <iostream>
using namespace std;

int main() {
    int age = 18;
    if (age >= 18) {
        cout << "You can vote!" << endl;
    } else {
        cout << "Wait until you're 18" << endl;
    }
    return 0;
}`,
      "For Loop": `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    for (int i = 0; i < 5; i++) {
        cout << "Count: " << i << endl;
    }
    
    vector<string> fruits = {"apple", "banana", "orange"};
    for (const string& fruit : fruits) {
        cout << "I like " << fruit << endl;
    }
    return 0;
}`
    },
    java: {
      "Hello World": `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java!");
    }
}`,
      "Variables": `public class Main {
    public static void main(String[] args) {
        String name = "Alice";
        int age = 25;
        double height = 5.7;
        System.out.println("Name: " + name + ", Age: " + age + ", Height: " + height);
    }
}`,
      "If Statement": `public class Main {
    public static void main(String[] args) {
        int age = 18;
        if (age >= 18) {
            System.out.println("You can vote!");
        } else {
            System.out.println("Wait until you're 18");
        }
    }
}`,
      "For Loop": `public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
        
        String[] fruits = {"apple", "banana", "orange"};
        for (String fruit : fruits) {
            System.out.println("I like " + fruit);
        }
    }
}`
    }
  };

  // Syntax validation for different languages
  const validateSyntax = (code: string, language: string): { isValid: boolean; error?: string } => {
    try {
      switch (language) {
        case "python":
          // Basic Python syntax checks
          if (code.includes("print(") && !code.match(/print\([^)]*\)/)) {
            return { isValid: false, error: "SyntaxError: Unclosed print statement" };
          }
          if (code.includes("if ") && !code.includes(":")) {
            return { isValid: false, error: "SyntaxError: Invalid if statement - missing colon" };
          }
          break;
        
        case "javascript":
          // Basic JavaScript syntax checks
          if (code.includes("console.log(") && !code.match(/console\.log\([^)]*\)/)) {
            return { isValid: false, error: "SyntaxError: Unclosed console.log statement" };
          }
          const openBraces = (code.match(/{/g) || []).length;
          const closeBraces = (code.match(/}/g) || []).length;
          if (openBraces !== closeBraces) {
            return { isValid: false, error: "SyntaxError: Mismatched braces" };
          }
          break;
        
        case "c":
          // Basic C syntax checks
          if (!code.includes("#include") && !code.includes("int main")) {
            return { isValid: false, error: "CompileError: Missing main function or includes" };
          }
          if (code.includes("printf(") && !code.match(/printf\([^)]*\)/)) {
            return { isValid: false, error: "CompileError: Unclosed printf statement" };
          }
          if (code.includes("int main") && !code.includes("return 0;")) {
            return { isValid: false, error: "CompileError: Main function must return 0" };
          }
          break;
        
        case "cpp":
          // Basic C++ syntax checks
          if (!code.includes("#include") && !code.includes("int main")) {
            return { isValid: false, error: "CompileError: Missing main function or includes" };
          }
          if (code.includes("cout") && !code.includes("using namespace std") && !code.includes("std::cout")) {
            return { isValid: false, error: "CompileError: cout requires 'using namespace std' or 'std::cout'" };
          }
          break;
        
        case "java":
          // Basic Java syntax checks
          if (!code.includes("public class") || !code.includes("public static void main")) {
            return { isValid: false, error: "CompileError: Missing public class or main method" };
          }
          if (code.includes("System.out.println(") && !code.match(/System\.out\.println\([^)]*\)/)) {
            return { isValid: false, error: "CompileError: Unclosed System.out.println statement" };
          }
          break;
      }
      return { isValid: true };
    } catch (e) {
      return { isValid: false, error: "Syntax validation error" };
    }
  };

  // Real code execution function using backend compiler
  const runCode = async () => {
    setIsRunning(true);
    setOutput("Compiling and running...");
    setError("");
    setExecutionTime(0);
    
    try {
      const response = await fetch(`${API_URL}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          input: userInput
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Execution failed');
      }

      setOutput(result.output || 'Program executed successfully');
      setError(result.error || '');
      setExecutionTime(result.executionTime || 0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error occurred');
      setOutput('');
    } finally {
      setIsRunning(false);
    }
  };

  // Open YouTube course
  const openCourse = (youtubeUrl: string) => {
    window.open(youtubeUrl, '_blank');
  };

  // Add custom course
  const addCustomCourse = () => {
    if (customCourse.name && customCourse.query) {
      const newCourse = {
        id: courses.length + 1,
        name: customCourse.name,
        description: `Custom course: ${customCourse.query}`,
        duration: "Variable",
        views: "Custom",
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(customCourse.query)}`,
        thumbnail: "🎯"
      };
      setCourses([...courses, newCourse]);
      setCustomCourse({ name: "", query: "" });
      setShowAddCourseDialog(false);
    }
  };

  // Load code example
  const loadExample = (exampleName: string) => {
    const examples = codeExamples[selectedLanguage];
    if (examples && examples[exampleName]) {
      setCode(examples[exampleName]);
      setOutput("");
      setError("");
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setCode(getDefaultCode(newLanguage));
    setOutput("");
    setError("");
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="relative z-10 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            CodeSpark Module
          </motion.h1>
          <motion.p 
            className="text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Master programming with interactive lessons and hands-on practice
          </motion.p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Learning Roadmap & Resources */}
          <div className="lg:col-span-1 space-y-6">
            {/* Learning Roadmap */}
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Learning Roadmap</h2>
              <div className="space-y-4">
                {roadmapItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className={`flex items-start space-x-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-3 rounded-lg transition-all duration-200 ${
                      selectedRoadmapItem === item.id ? 'bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600' : ''
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    onClick={() => setSelectedRoadmapItem(selectedRoadmapItem === item.id ? null : item.id)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.completed 
                        ? 'bg-green-500' 
                        : item.current 
                          ? 'bg-blue-500 animate-pulse' 
                          : item.color === 'orange' ? 'bg-orange-500' 
                          : 'bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                    }`}>
                      {item.completed ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.id}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        item.completed ? 'text-green-500' : 
                        item.current ? 'text-blue-500' : 
                        item.color === 'orange' ? 'text-orange-500' :
                        'text-slate-900 dark:text-white'
                      }`}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                      {item.lessons && (
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                          {item.lessons.length} lessons
                        </div>
                      )}
                      <div className={`mt-2 rounded-full h-2 ${
                        item.color === 'green' ? 'bg-green-500/20' :
                        item.color === 'blue' ? 'bg-blue-500/20' :
                        item.color === 'orange' ? 'bg-orange-500/20' :
                        'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            item.color === 'green' ? 'bg-green-500' :
                            item.color === 'blue' ? 'bg-blue-500' :
                            item.color === 'orange' ? 'bg-orange-500' :
                            'bg-slate-400 dark:bg-slate-500'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Learning Resources */}
            <motion.div 
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Learning Resources</h3>
                <GlassmorphismButton 
                  size="sm" 
                  onClick={() => setShowAddCourseDialog(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </GlassmorphismButton>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredCourses.map((course) => (
                  <motion.div 
                    key={course.id}
                    className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                    onClick={() => openCourse(course.youtubeUrl)}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-xl">
                        {course.thumbnail}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{course.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{course.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-slate-600 dark:text-slate-500">{course.duration}</span>
                          <span className="text-xs text-slate-600 dark:text-slate-500">•</span>
                          <span className="text-xs text-slate-600 dark:text-slate-500">{course.views} views</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Code Editor and Content */}
          <div className="lg:col-span-2">
            <motion.div 
              className="glassmorphism rounded-xl overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Code Editor Header */}
              <div className="border-b border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Interactive Code Editor</h2>
                  <div className="flex items-center space-x-3">
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Practice programming with real-time code execution</p>
              </div>
              
              {/* Code Examples */}
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold mb-4">Code Examples</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(codeExamples[selectedLanguage]).map((example) => (
                    <GlassmorphismButton
                      key={example}
                      variant="outline"
                      size="sm"
                      onClick={() => loadExample(example)}
                      className="text-left justify-start"
                    >
                      <Code className="w-3 h-3 mr-2" />
                      {example}
                    </GlassmorphismButton>
                  ))}
                </div>
              </div>
              
              {/* Code Editor */}
              <div ref={codeEditorRef} className="p-6">
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-slate-700 border-b border-slate-600">
                    <span className="text-sm text-slate-300">Code Editor</span>
                    <div className="flex space-x-2">
                      <GlassmorphismButton 
                        size="sm" 
                        onClick={runCode}
                        disabled={isRunning}
                      >
                        <Terminal className="w-3 h-3 mr-1" />
                        {isRunning ? "Running..." : "Run Code"}
                      </GlassmorphismButton>
                      <GlassmorphismButton 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setCode(getDefaultCode(selectedLanguage));
                          setOutput("");
                          setError("");
                        }}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </GlassmorphismButton>
                    </div>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-64 p-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-green-400 font-mono text-sm resize-none outline-none border border-slate-300 dark:border-slate-600"
                    spellCheck={false}
                    placeholder={
                      selectedLanguage === "python" ? "# Write Python code here..." :
                      selectedLanguage === "javascript" ? "// Write JavaScript code here..." :
                      selectedLanguage === "c" ? "// Write C code here..." :
                      selectedLanguage === "cpp" ? "// Write C++ code here..." :
                      selectedLanguage === "java" ? "// Write Java code here..." :
                      "// Write your code here..."
                    }
                  />
                </div>
                
                {/* User Input Section */}
                <div className="mt-4">
                  <div className="bg-slate-700 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-slate-600 border-b border-slate-500">
                      <span className="text-sm text-slate-300">Program Input</span>
                      <span className="text-xs text-slate-400">Enter input for your program (one line per input)</span>
                    </div>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full h-20 p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm resize-none outline-none border border-slate-300 dark:border-slate-600"
                      placeholder="Enter input values here (e.g., for input() or scanf)..."
                      spellCheck={false}
                    />
                  </div>
                </div>
                
                {/* Output and Error Display */}
                <div className="mt-4 space-y-3">
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg overflow-hidden">
                      <div className="p-3 bg-red-800/30 border-b border-red-500/30">
                        <span className="text-sm text-red-300 font-semibold">❌ Compilation Error</span>
                      </div>
                      <div className="p-4 font-mono text-sm">
                        <pre className="text-red-600 dark:text-red-400 whitespace-pre-wrap">{error}</pre>
                        <div className="mt-2 text-xs text-red-300">
                          Please check your code syntax and try again.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Output Display */}
                  <div className="bg-slate-900 rounded-lg overflow-hidden">
                    <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                      <span className="text-sm text-slate-300">
                        {error ? "⚠️ Output (Previous Run)" : "📤 Output"}
                      </span>
                      {executionTime > 0 && (
                        <span className="text-xs text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {executionTime}ms
                        </span>
                      )}
                    </div>
                    <div className="p-4 min-h-[100px] font-mono text-sm bg-slate-100 dark:bg-slate-800">
                      {output ? (
                        <pre className="text-green-700 dark:text-green-400 whitespace-pre-wrap">{output}</pre>
                      ) : (
                        <span className="text-slate-500">
                          {error ? "Fix the error above and run again..." : `Click "Run Code" to compile and execute your ${selectedLanguage.toUpperCase()} code...`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dynamic Learning Content Based on Roadmap Selection */}
              <div className="p-6 border-t border-white/10">
                {selectedRoadmapItem ? (
                  <>
                    <h3 className="text-lg font-semibold mb-6">
                      {roadmapItems.find(item => item.id === selectedRoadmapItem)?.title} - Learning Guide
                    </h3>
                    <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      {(() => {
                        const selectedItem = roadmapItems.find(item => item.id === selectedRoadmapItem);
                        if (!selectedItem?.detailedContent) return null;
                        
                        return (
                          <>
                            <div className="glassmorphism rounded-lg p-4 mb-4">
                              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Overview</h4>
                              <p className="text-slate-600 dark:text-slate-400 text-sm">{selectedItem.detailedContent.overview}</p>
                            </div>
                            
                            {selectedItem.detailedContent.concepts.map((concept, index) => (
                              <div key={index} className="glassmorphism rounded-lg p-4">
                                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white mr-2">
                                    {index + 1}
                                  </span>
                                  {concept.title}
                                </h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{concept.description}</p>
                                <ul className="text-slate-600 dark:text-slate-500 text-xs space-y-1 ml-4">
                                  {concept.points.map((point, pointIndex) => (
                                    <li key={pointIndex}>• <span className="text-blue-600 dark:text-blue-300">{point}</span></li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-6">Complete Programming Concepts Guide</h3>
                    <div className="text-center py-8">
                      <div className="glassmorphism rounded-lg p-6">
                        <Book className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Interactive Learning</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                          Click on any roadmap item above to view detailed learning content and concepts for that topic.
                        </p>
                        <p className="text-slate-600 dark:text-slate-500 text-xs">
                          Each section includes comprehensive explanations, key concepts, and practical examples to help you master programming fundamentals.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Coding Challenges Section */}
        <div className="mt-12">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Coding Challenges</h2>
            <p className="text-slate-600 dark:text-slate-400">Test your skills with these programming challenges</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {codingChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                className="glassmorphism rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => setSelectedChallenge(selectedChallenge === challenge.id ? null : challenge.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    challenge.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                    challenge.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">{challenge.points} pts</span>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{challenge.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{challenge.description}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-400">{challenge.category}</span>
                  <span className={`${challenge.completed ? 'text-green-400' : 'text-slate-500'}`}>
                    {challenge.completed ? '✓ Completed' : 'Not Started'}
                  </span>
                </div>

                {selectedChallenge === challenge.id && (
                  <motion.div
                    className="mt-4 pt-4 border-t border-white/10"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-blue-400 mb-1">Hint:</h4>
                        <p className="text-xs text-slate-400">{challenge.hint}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-green-400 mb-2">Test Cases:</h4>
                        <div className="space-y-1">
                          {challenge.testCases.slice(0, 2).map((testCase, idx) => (
                            <div key={idx} className="text-xs text-slate-500">
                              Input: <span className="text-blue-300">{testCase.input}</span> → 
                              Expected: <span className="text-green-300">{testCase.expected}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <GlassmorphismButton
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Load challenge template code
                          setCode(`# ${challenge.title}\n# ${challenge.description}\n# Hint: ${challenge.hint}\n\ndef solve():\n    # Write your solution here\n    pass\n\n# Test your solution\nsolve()`);
                          // Scroll to code editor
                          setTimeout(() => {
                            codeEditorRef.current?.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'start' 
                            });
                          }, 100);
                        }}
                      >
                        Start Challenge
                      </GlassmorphismButton>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Programming Tips Section */}
        <div className="mt-12">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Programming Tips</h2>
            <p className="text-slate-400">Essential tips to improve your coding skills</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {programmingTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                className="glassmorphism rounded-xl p-6"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{tip.id}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-400 mb-2">{tip.category}</h3>
                    <p className="text-sm text-slate-300 mb-3">{tip.tip}</p>
                    <div className="bg-slate-800/50 rounded-lg p-3 border-l-4 border-green-500">
                      <p className="text-xs text-green-400 font-mono">{tip.example}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Course Dialog */}
      <Dialog open={showAddCourseDialog} onOpenChange={setShowAddCourseDialog}>
        <DialogContent className="max-w-md bg-slate-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Add Custom Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Course Name</label>
              <Input
                placeholder="e.g., Advanced React Patterns"
                value={customCourse.name}
                onChange={(e) => setCustomCourse(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Search Query</label>
              <Input
                placeholder="e.g., react hooks tutorial 2024"
                value={customCourse.query}
                onChange={(e) => setCustomCourse(prev => ({ ...prev, query: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <GlassmorphismButton
                variant="outline"
                onClick={() => setShowAddCourseDialog(false)}
              >
                Cancel
              </GlassmorphismButton>
              <GlassmorphismButton
                onClick={addCustomCourse}
                disabled={!customCourse.name || !customCourse.query}
              >
                Add Course
              </GlassmorphismButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default CodeSpark;
