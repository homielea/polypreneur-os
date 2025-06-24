export interface Project {
  id: string;
  title: string;
  type: "web-app" | "extension" | "mobile";
  status: "ideation" | "in-progress" | "ready-to-launch" | "launched";
  progress: number;
  phases: Phase[];
  createdAt: Date;
  template?: string;
  purpose?: string;
  keyTasks?: string[];
  timeline?: string;
  tags?: string[];
  voiceNotes?: string;
}

export interface Phase {
  id: string;
  name: string;
  completed: boolean;
  tasks: string[];
  subtasks: string[];
  automationTrigger?: string;
  description?: string;
}

export interface IdeaData {
  id: string;
  title: string;
  description: string;
  category: "saas" | "coaching" | "content" | "physical" | "service";
  targetAudience: string;
  problemItSolves: string;
  pmfScore: number;
  portfolioFitScore: number;
  launchSpeedScore: number;
  energyLevel: "high" | "medium" | "low";
  aiPriorityScore: number;
  status: "idea" | "validated" | "killed" | "converted";
  nextStep: string;
  createdAt: Date;
}
