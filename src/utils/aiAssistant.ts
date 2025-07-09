import { Project, IdeaData } from "@/types";

export interface UserContext {
  mood: "high" | "medium" | "low";
  energy: "high" | "medium" | "low";
  focus: string;
  profile?: {
    experience: "beginner" | "intermediate" | "advanced";
    goals: string[];
    interests: string[];
  };
}

export interface AIRecommendation {
  type: "focus" | "idea" | "project" | "tip";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  context: string;
  suggestedAction?: string;
}

export interface SmartSuggestions {
  primaryFocus: AIRecommendation;
  secondaryActions: AIRecommendation[];
  insights: AIRecommendation[];
  tips: AIRecommendation[];
}

export class AIAssistant {
  static generateDailyRecommendations(
    projects: Project[],
    ideas: IdeaData[],
    userContext: UserContext
  ): SmartSuggestions {
    const { mood, energy, focus, profile } = userContext;
    
    // Analyze current state
    const activeProjects = projects.filter(p => p.status === "in-progress");
    const ideationProjects = projects.filter(p => p.status === "ideation");
    const highPriorityIdeas = ideas.filter(i => i.aiPriorityScore >= 7);
    
    // Generate primary focus recommendation
    const primaryFocus = this.getPrimaryFocus(activeProjects, ideas, mood, energy, focus);
    
    // Generate secondary actions based on energy level
    const secondaryActions = this.getSecondaryActions(projects, ideas, energy, mood);
    
    // Generate insights based on patterns
    const insights = this.generateInsights(projects, ideas, userContext);
    
    // Generate contextual tips
    const tips = this.getContextualTips(userContext, projects.length, ideas.length);
    
    return {
      primaryFocus,
      secondaryActions,
      insights,
      tips
    };
  }

  private static getPrimaryFocus(
    activeProjects: Project[],
    ideas: IdeaData[],
    mood: string,
    energy: string,
    focus: string
  ): AIRecommendation {
    // High energy + good mood = tackle challenging work
    if (energy === "high" && mood === "high") {
      const nextPhaseProject = activeProjects.find(p => {
        const nextPhase = p.phases.find(phase => !phase.completed);
        return nextPhase && ["Development", "Launch", "Validation"].includes(nextPhase.name);
      });
      
      if (nextPhaseProject) {
        const nextPhase = nextPhaseProject.phases.find(phase => !phase.completed);
        return {
          type: "project",
          title: `Push forward on "${nextPhaseProject.title}"`,
          description: `You're in peak state! Focus on ${nextPhase?.name.toLowerCase()} phase - tackle the challenging technical work.`,
          priority: "high",
          actionable: true,
          context: "High energy optimal for complex tasks",
          suggestedAction: `Complete ${nextPhase?.name} tasks`
        };
      }
    }
    
    // Medium energy = maintenance and organization
    if (energy === "medium") {
      const organizationProject = activeProjects.find(p => {
        const nextPhase = p.phases.find(phase => !phase.completed);
        return nextPhase && ["Research", "Planning", "Design"].includes(nextPhase.name);
      });
      
      if (organizationProject) {
        return {
          type: "project",
          title: `Organize and plan "${organizationProject.title}"`,
          description: "Perfect energy level for strategic thinking and organizing your approach.",
          priority: "high",
          actionable: true,
          context: "Medium energy ideal for planning",
          suggestedAction: "Complete research and planning tasks"
        };
      }
    }
    
    // Low energy = idea capture and reflection
    if (energy === "low") {
      if (ideas.length < 3) {
        return {
          type: "idea",
          title: "Capture new ideas while reflecting",
          description: "Low energy is perfect for brainstorming and capturing thoughts without pressure.",
          priority: "medium",
          actionable: true,
          context: "Low energy optimal for creative reflection",
          suggestedAction: "Add 2-3 new ideas to your vault"
        };
      }
    }
    
    // Default recommendation based on focus
    return {
      type: "focus",
      title: "Continue your daily focus",
      description: `Stay on track with: "${focus}"`,
      priority: "high",
      actionable: true,
      context: "Based on your daily intention",
      suggestedAction: "Work on your stated focus for 25 minutes"
    };
  }

  private static getSecondaryActions(
    projects: Project[],
    ideas: IdeaData[],
    energy: string,
    mood: string
  ): AIRecommendation[] {
    const actions: AIRecommendation[] = [];
    
    // Always suggest idea review if there are unscored ideas
    const unscoredIdeas = ideas.filter(i => !i.aiPriorityScore || i.aiPriorityScore === 0);
    if (unscoredIdeas.length > 0) {
      actions.push({
        type: "idea",
        title: `Score ${unscoredIdeas.length} unscored ideas`,
        description: "Get AI analysis on your recent ideas to prioritize your next moves.",
        priority: "medium",
        actionable: true,
        context: "Unscored ideas found",
        suggestedAction: "Use the idea scoring wizard"
      });
    }
    
    // Suggest converting high-scoring ideas to projects
    const readyIdeas = ideas.filter(i => i.aiPriorityScore >= 8 && i.status !== "converted");
    if (readyIdeas.length > 0) {
      actions.push({
        type: "idea",
        title: `Convert ${readyIdeas.length} high-scoring ideas to projects`,
        description: "You have ideas with 8+ priority scores ready to become active projects.",
        priority: "high",
        actionable: true,
        context: "High-scoring ideas available",
        suggestedAction: "Convert ideas to projects"
      });
    }
    
    // Suggest project cleanup if too many active
    const activeProjects = projects.filter(p => p.status === "in-progress");
    if (activeProjects.length > 3) {
      actions.push({
        type: "project",
        title: "Consider focusing your project portfolio",
        description: `You have ${activeProjects.length} active projects. Consider pausing some to increase focus.`,
        priority: "medium",
        actionable: true,
        context: "Too many active projects",
        suggestedAction: "Review and pause low-priority projects"
      });
    }
    
    return actions.slice(0, 3); // Limit to 3 actions
  }

  private static generateInsights(
    projects: Project[],
    ideas: IdeaData[],
    userContext: UserContext
  ): AIRecommendation[] {
    const insights: AIRecommendation[] = [];
    
    // Pattern analysis
    const categoryFrequency = ideas.reduce((acc, idea) => {
      acc[idea.category] = (acc[idea.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categoryFrequency)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory && topCategory[1] > 2) {
      insights.push({
        type: "tip",
        title: `You're drawn to ${topCategory[0]} ideas`,
        description: `${topCategory[1]} of your ideas are ${topCategory[0]}-focused. Consider specializing or diversifying based on your goals.`,
        priority: "low",
        actionable: false,
        context: "Pattern recognition"
      });
    }
    
    // Progress analysis
    const projectsWithProgress = projects.filter(p => p.progress > 0);
    const avgProgress = projectsWithProgress.reduce((sum, p) => sum + p.progress, 0) / projectsWithProgress.length || 0;
    
    if (avgProgress < 30 && projects.length > 2) {
      insights.push({
        type: "tip",
        title: "Focus on fewer projects for better progress",
        description: `Your average project progress is ${Math.round(avgProgress)}%. Consider focusing on 1-2 key projects.`,
        priority: "medium",
        actionable: true,
        context: "Progress analysis",
        suggestedAction: "Prioritize your top 2 projects"
      });
    }
    
    return insights;
  }

  private static getContextualTips(
    userContext: UserContext,
    projectCount: number,
    ideaCount: number
  ): AIRecommendation[] {
    const tips: AIRecommendation[] = [];
    const { mood, energy, profile } = userContext;
    
    // Energy-based tips
    if (energy === "low" && mood !== "low") {
      tips.push({
        type: "tip",
        title: "Low energy, but good mood detected",
        description: "Perfect time for creative work, planning, or learning. Avoid heavy execution tasks.",
        priority: "low",
        actionable: false,
        context: "Energy optimization"
      });
    }
    
    // Experience-based tips
    if (profile?.experience === "beginner" && projectCount > 2) {
      tips.push({
        type: "tip",
        title: "Beginner polypreneur tip",
        description: "Start with 1-2 projects max. Building completion habits is more valuable than variety early on.",
        priority: "medium",
        actionable: true,
        context: "Experience level guidance",
        suggestedAction: "Focus on completing one project first"
      });
    }
    
    // Idea management tips
    if (ideaCount > 10) {
      tips.push({
        type: "tip",
        title: "Rich idea pipeline detected",
        description: "You're great at generating ideas! Consider setting up a weekly review to keep them organized.",
        priority: "low",
        actionable: true,
        context: "Idea management",
        suggestedAction: "Schedule weekly idea review sessions"
      });
    }
    
    return tips.slice(0, 2); // Limit to 2 tips
  }

  static getProjectNextAction(project: Project, userEnergy: string): string {
    const nextPhase = project.phases.find(phase => !phase.completed);
    if (!nextPhase) return "Project complete! Time to launch or iterate.";
    
    const energyMap = {
      high: {
        "Development": "Tackle the hardest technical challenges",
        "Launch": "Push for launch - handle marketing and distribution",
        "Validation": "Run user interviews and gather feedback",
        "Research": "Deep dive into competitive analysis",
        "Planning": "Finalize your roadmap and technical specs",
        "Design": "Create the full design system"
      },
      medium: {
        "Development": "Work on smaller features and bug fixes",
        "Launch": "Prepare launch materials and documentation",
        "Validation": "Plan validation experiments",
        "Research": "Organize research findings",
        "Planning": "Refine your project scope",
        "Design": "Create wireframes and user flows"
      },
      low: {
        "Development": "Review code and plan next sprint",
        "Launch": "Write copy and prepare assets",
        "Validation": "Design surveys and feedback forms",
        "Research": "Collect and bookmark resources",
        "Planning": "Brainstorm features and write ideas",
        "Design": "Create mood boards and inspiration"
      }
    };
    
    return energyMap[userEnergy as keyof typeof energyMap]?.[nextPhase.name] || 
           `Continue with ${nextPhase.name.toLowerCase()} tasks`;
  }
}