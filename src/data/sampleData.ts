
import { Project, IdeaData } from "@/types";
import { PHASES } from "@/constants/phases";

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: "sample-1",
    title: "AI Email Assistant",
    type: "web-app",
    status: "in-progress",
    progress: 67,
    phases: PHASES.map((phase, index) => ({
      id: `sample-1-${index}`,
      name: phase.name,
      completed: index < 8,
      tasks: [`Complete ${phase.name.toLowerCase()} tasks`],
      subtasks: phase.subtasks,
      description: phase.description,
      automationTrigger: phase.automationTrigger
    })),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    template: "web-app-saas",
    purpose: "Help busy professionals manage their inbox with AI-powered email sorting and response suggestions",
    keyTasks: ["Implement Gmail API integration", "Train AI model on user preferences", "Design dashboard UI"],
    tags: ["AI", "Productivity", "SaaS"]
  },
  {
    id: "sample-2", 
    title: "Habit Tracker Chrome Extension",
    type: "extension",
    status: "ready-to-launch",
    progress: 89,
    phases: PHASES.map((phase, index) => ({
      id: `sample-2-${index}`,
      name: phase.name,
      completed: index < 11,
      tasks: [`Complete ${phase.name.toLowerCase()} tasks`],
      subtasks: phase.subtasks,
      description: phase.description,
      automationTrigger: phase.automationTrigger
    })),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    template: "extension-template",
    purpose: "Simple habit tracking that lives in your new tab page",
    keyTasks: ["Chrome Web Store submission", "Final testing", "Marketing assets"],
    tags: ["Chrome Extension", "Habits", "Productivity"]
  },
  {
    id: "sample-3",
    title: "Local Food Finder App",
    type: "mobile",
    status: "ideation", 
    progress: 23,
    phases: PHASES.map((phase, index) => ({
      id: `sample-3-${index}`,
      name: phase.name,
      completed: index < 3,
      tasks: [`Complete ${phase.name.toLowerCase()} tasks`],
      subtasks: phase.subtasks,
      description: phase.description,
      automationTrigger: phase.automationTrigger
    })),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    template: "mobile-app-template",
    purpose: "Connect food lovers with local restaurants and hidden gems in their area",
    keyTasks: ["Market research", "UI wireframes", "Location API integration"],
    tags: ["Mobile", "Food", "Local"]
  }
];

export const SAMPLE_IDEAS: IdeaData[] = [
  {
    id: "idea-1",
    title: "Voice-to-Text Meeting Notes",
    description: "AI-powered meeting transcription with action item extraction and automatic follow-up scheduling",
    category: "saas",
    targetAudience: "Remote teams and consultants",
    problemItSolves: "Meeting fatigue and poor follow-through on action items",
    pmfScore: 8,
    portfolioFitScore: 7,
    launchSpeedScore: 6,
    energyLevel: "high",
    aiPriorityScore: 85,
    status: "idea",
    nextStep: "Research existing solutions and interview potential users",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: "idea-2", 
    title: "Micro-Learning Platform for Developers",
    description: "5-minute daily coding challenges with real-world scenarios",
    category: "content",
    targetAudience: "Junior to mid-level developers",
    problemItSolves: "Keeping programming skills sharp in a busy schedule",
    pmfScore: 7,
    portfolioFitScore: 9,
    launchSpeedScore: 8,
    energyLevel: "medium",
    aiPriorityScore: 78,
    status: "idea", 
    nextStep: "Create MVP with 10 sample challenges",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: "idea-3",
    title: "Plant Care Reminder System",
    description: "Smart plant care assistant using image recognition to assess plant health",
    category: "physical",
    targetAudience: "Urban plant enthusiasts and beginners",
    problemItSolves: "Plant neglect and lack of care knowledge",
    pmfScore: 6,
    portfolioFitScore: 5,
    launchSpeedScore: 4,
    energyLevel: "low",
    aiPriorityScore: 62,
    status: "idea",
    nextStep: "Validate demand through plant community surveys",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
];

export const SAMPLE_DAILY_CHECKINS = [
  {
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mood: "high" as const,
    energy: "high" as const,
    focus: "Launch preparation and bug fixes",
    reflection: "Feeling motivated about the upcoming launch. Clear priorities today.",
    completed: true
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mood: "medium" as const,
    energy: "medium" as const,
    focus: "Testing user flows and mobile responsiveness",
    reflection: "Some challenges with mobile layout but making steady progress.",
    completed: true
  }
];

export const SAMPLE_EVENING_REFLECTIONS = [
  {
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tasksCompleted: 8,
    focusAchieved: 7,
    energyUsed: 6,
    accomplishments: "Fixed mobile navigation, added error boundaries, optimized chart performance",
    challenges: "Mobile responsive issues took longer than expected",
    tomorrowPriority: "Complete sample data integration and test user onboarding flow",
    satisfactionLevel: 8,
    completed: true
  }
];
