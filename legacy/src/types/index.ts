
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
  strategy?: ProjectStrategy;
  validationData?: ValidationData;
  launchPlan?: LaunchPlanData;
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

export interface UserProfile {
  name: string;
  role: string;
  goals: string[];
  experience: "beginner" | "intermediate" | "advanced";
  interests: string[];
  mission?: string;
  vision?: string;
  antiVision?: string;
  alignmentScores?: {
    clarity: number;
    energy: number;
    confidence: number;
  };
}

export interface ProjectStrategy {
  leanCanvas?: LeanCanvasData;
  swotAnalysis?: SWOTData;
  businessModel?: BMCData;
  personas?: PersonaData[];
  effortImpactGrid?: TaskPriorityData[];
}

export interface LeanCanvasData {
  problem: string[];
  solution: string[];
  keyMetrics: string[];
  valueProposition: string;
  unfairAdvantage: string;
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface BMCData {
  keyPartners: string[];
  keyActivities: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  customerSegments: string[];
  keyResources: string[];
  channels: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface PersonaData {
  id: string;
  name: string;
  age: number;
  occupation: string;
  demographics: string;
  goals: string[];
  painPoints: string[];
  motivations: string[];
  behaviors: string[];
  jobsToBeDone: string[];
}

export interface TaskPriorityData {
  id: string;
  task: string;
  effort: number; // 1-10
  impact: number; // 1-10
  priority: "high" | "medium" | "low";
}

export interface ValidationData {
  assumptions: string[];
  experiments: ValidationExperiment[];
  feedback: CustomerFeedback[];
}

export interface ValidationExperiment {
  id: string;
  hypothesis: string;
  method: string;
  success_criteria: string;
  status: "planned" | "running" | "completed";
  results?: string;
}

export interface CustomerFeedback {
  id: string;
  source: string;
  feedback: string;
  sentiment: "positive" | "neutral" | "negative";
  date: Date;
}

export interface LaunchPlanData {
  launchDate?: Date;
  prelaunchTasks: string[];
  launchTasks: string[];
  postlaunchTasks: string[];
  marketingChannels: string[];
  successMetrics: string[];
}
