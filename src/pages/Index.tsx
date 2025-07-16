
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TemplateLibrary } from "@/components/TemplateLibrary";
import { FocusMode } from "@/components/FocusMode";
import { StatsCards } from "@/components/StatsCards";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { VoiceProjectCreator } from "@/components/VoiceProjectCreator";
import { IdeaVaultWizard } from "@/components/IdeaVaultWizard";
import { IdeaVaultGrid } from "@/components/IdeaVaultGrid";
import { DashboardSummary } from "@/components/DashboardSummary";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { EveningReflection } from "@/components/EveningReflection";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnhancedLoadingSpinner } from "@/components/EnhancedLoadingSpinner";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { TouchOptimizedButton } from "@/components/TouchOptimizedButton";
import { Plus, Brain, Lightbulb, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PHASES } from "@/constants/phases";
import { Project, IdeaData } from "@/types";
import { MoodProductivityAnalyzer } from "@/utils/moodProductivityAnalyzer";
import { SAMPLE_PROJECTS, SAMPLE_IDEAS, SAMPLE_DAILY_CHECKINS, SAMPLE_EVENING_REFLECTIONS } from "@/data/sampleData";

interface UserProfile {
  name: string;
  role: string;
  goals: string[];
  experience: "beginner" | "intermediate" | "advanced";
  interests: string[];
}

interface DailyCheckInData {
  date: string;
  mood: "high" | "medium" | "low";
  energy: "high" | "medium" | "low";
  focus: string;
  reflection: string;
  completed: boolean;
}

interface EveningReflectionData {
  date: string;
  tasksCompleted: number;
  focusAchieved: number;
  energyUsed: number;
  accomplishments: string;
  challenges: string;
  tomorrowPriority: string;
  satisfactionLevel: number;
  completed: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showIdeaWizard, setShowIdeaWizard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyCheckIn, setDailyCheckIn] = useState<DailyCheckInData | null>(null);
  
  // Initialize projects with sample data if no existing projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  
  const [showEveningReflection, setShowEveningReflection] = useState(false);
  const [eveningReflections, setEveningReflections] = useState<EveningReflectionData[]>([]);

  // Load data with sample fallbacks
  useEffect(() => {
    try {
      setLoading(true);
      
      // Load projects
      const savedProjects = localStorage.getItem('polypreneur-projects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      } else {
        // Use sample data for new users
        setProjects(SAMPLE_PROJECTS);
        localStorage.setItem('polypreneur-projects', JSON.stringify(SAMPLE_PROJECTS));
      }

      // Load ideas
      const savedIdeas = localStorage.getItem('polypreneur-ideas');
      if (savedIdeas) {
        setIdeas(JSON.parse(savedIdeas));
      } else {
        // Use sample data for new users
        setIdeas(SAMPLE_IDEAS);
        localStorage.setItem('polypreneur-ideas', JSON.stringify(SAMPLE_IDEAS));
      }

      // Load evening reflections
      const savedReflections = localStorage.getItem('evening-reflections');
      if (savedReflections) {
        setEveningReflections(JSON.parse(savedReflections));
      } else {
        // Use sample data for new users
        setEveningReflections(SAMPLE_EVENING_REFLECTIONS);
        localStorage.setItem('evening-reflections', JSON.stringify(SAMPLE_EVENING_REFLECTIONS));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "Some data couldn't be loaded. Using default values.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Check if user should see onboarding or daily check-in
  useEffect(() => {
    const savedProfile = localStorage.getItem('polypreneur-profile');
    const todayCheckIn = localStorage.getItem(`checkin-${new Date().toISOString().split('T')[0]}`);
    
    if (!savedProfile) {
      setShowOnboarding(true);
    } else {
      setUserProfile(JSON.parse(savedProfile));
      if (!todayCheckIn) {
        setShowDailyCheckIn(true);
      } else {
        setDailyCheckIn(JSON.parse(todayCheckIn));
      }
    }
  }, []);

  // Check if evening reflection is needed
  useEffect(() => {
    if (dailyCheckIn) {
      const today = new Date().toISOString().split('T')[0];
      const todayReflection = eveningReflections.find(r => r.date === today);
      const currentHour = new Date().getHours();
      
      // Show evening reflection after 6 PM if not completed
      if (currentHour >= 18 && !todayReflection) {
        setShowEveningReflection(true);
      }
    }
  }, [dailyCheckIn, eveningReflections]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('polypreneur-profile', JSON.stringify(profile));
    setShowOnboarding(false);
    setShowDailyCheckIn(true);
    
    toast({
      title: `Welcome, ${profile.name}!`,
      description: "Your Polypreneur journey begins now."
    });
  };

  const handleDailyCheckInComplete = (checkIn: DailyCheckInData) => {
    setDailyCheckIn(checkIn);
    localStorage.setItem(`checkin-${checkIn.date}`, JSON.stringify(checkIn));
    setShowDailyCheckIn(false);
  };

  // Update project saving
  const updateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    try {
      localStorage.setItem('polypreneur-projects', JSON.stringify(newProjects));
    } catch (error) {
      console.error('Error saving projects:', error);
      toast({
        title: "Save Error",
        description: "Couldn't save project changes",
        variant: "destructive"
      });
    }
  };

  const addProject = (template?: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "New Project",
      type: "web-app",
      status: "ideation", 
      progress: 0,
      phases: PHASES.map((phase, index) => ({
        id: `${index}`,
        name: phase.name,
        completed: false,
        tasks: [`Complete ${phase.name.toLowerCase()} tasks`],
        subtasks: phase.subtasks,
        description: phase.description,
        automationTrigger: phase.automationTrigger
      })),
      createdAt: new Date(),
      template
    };
    
    updateProjects([...projects, newProject]);
    toast({
      title: "Project Created",
      description: "New project added to your dashboard"
    });
  };

  const addVoiceProject = (project: Project) => {
    updateProjects([...projects, project]);
    toast({
      title: "Voice Project Created",
      description: `"${project.title}" added to your dashboard`
    });
  };

  const updateProject = (updatedProject: Project) => {
    updateProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const cloneProject = (projectId: string) => {
    const projectToClone = projects.find(p => p.id === projectId);
    if (projectToClone) {
      const clonedProject: Project = {
        ...projectToClone,
        id: Date.now().toString(),
        title: `${projectToClone.title} (Copy)`,
        progress: 0,
        phases: projectToClone.phases.map(phase => ({
          ...phase,
          completed: false
        })),
        createdAt: new Date()
      };
      updateProjects([...projects, clonedProject]);
      toast({
        title: "Project Cloned",
        description: "Project template copied successfully"
      });
    }
  };

  // Update idea saving
  const updateIdeas = (newIdeas: IdeaData[]) => {
    setIdeas(newIdeas);
    try {
      localStorage.setItem('polypreneur-ideas', JSON.stringify(newIdeas));
    } catch (error) {
      console.error('Error saving ideas:', error);
      toast({
        title: "Save Error",
        description: "Couldn't save idea changes",
        variant: "destructive"
      });
    }
  };

  const addIdea = (idea: IdeaData) => {
    updateIdeas([...ideas, idea]);
  };

  const updateIdea = (updatedIdea: IdeaData) => {
    updateIdeas(ideas.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea));
  };

  const convertIdeaToProject = (idea: IdeaData) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: idea.title,
      type: "web-app", // Default, can be customized
      status: "ideation",
      progress: 0,
      phases: PHASES.map((phase, index) => ({
        id: `${index}`,
        name: phase.name,
        completed: false,
        tasks: [`Complete ${phase.name.toLowerCase()} tasks`],
        subtasks: phase.subtasks,
        description: phase.description,
        automationTrigger: phase.automationTrigger
      })),
      createdAt: new Date(),
      purpose: idea.problemItSolves,
      keyTasks: [idea.nextStep],
      tags: [idea.category]
    };

    updateProjects([...projects, newProject]);
    updateIdea({ ...idea, status: "converted" });
    
    toast({
      title: "Idea Converted!",
      description: `"${idea.title}" is now a project in your dashboard`
    });
  };

  const handleEveningReflectionComplete = (reflection: EveningReflectionData) => {
    const updatedReflections = [...eveningReflections, reflection];
    setEveningReflections(updatedReflections);
    localStorage.setItem('evening-reflections', JSON.stringify(updatedReflections));
    setShowEveningReflection(false);
    
    toast({
      title: "Evening reflection saved!",
      description: "Great job wrapping up your day thoughtfully."
    });
  };

  // Enhanced user context with productivity patterns
  const enhancedUserContext = useMemo(() => {
    if (!dailyCheckIn) return null;

    const checkIns = dailyCheckIn ? [dailyCheckIn] : []; // This would be an array in real implementation
    const productivityPattern = eveningReflections.length > 2 ? 
      MoodProductivityAnalyzer.analyzePatterns(checkIns, eveningReflections) : undefined;

    return {
      mood: dailyCheckIn.mood,
      energy: dailyCheckIn.energy,
      focus: dailyCheckIn.focus,
      profile: userProfile ? {
        experience: userProfile.experience,
        goals: userProfile.goals,
        interests: userProfile.interests
      } : undefined,
      productivityPattern
    };
  }, [dailyCheckIn, userProfile, eveningReflections]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <EnhancedLoadingSpinner size="xl" text="Loading your dashboard..." variant="dots" />
      </div>
    );
  }

  if (focusMode) {
    return (
      <ErrorBoundary>
        <FocusMode projects={projects} onExit={() => setFocusMode(false)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <KeyboardShortcuts
        onNewProject={() => addProject()}
        onNewIdea={() => setShowIdeaWizard(true)}
        onFocusMode={() => setFocusMode(true)}
        onSearch={() => toast({ title: "Search", description: "Search functionality coming soon!" })}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-3 sm:gap-4 mb-4 md:flex-row md:justify-between md:items-center">
              <div className="text-center md:text-left">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 animate-slide-up">
                  Polypreneur OS
                  {userProfile && (
                    <span className="block sm:inline text-sm sm:text-lg md:text-xl font-normal text-gray-600 sm:ml-2 mt-1 sm:mt-0">
                      - Welcome back, {userProfile.name}!
                    </span>
                  )}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  Launch digital products with repeatable systems
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 items-stretch sm:items-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                {!dailyCheckIn && (
                  <TouchOptimizedButton 
                    onClick={() => setShowDailyCheckIn(true)}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    size="sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Daily Check-in</span>
                    <span className="sm:hidden">Check-in</span>
                  </TouchOptimizedButton>
                )}
                <TouchOptimizedButton 
                  onClick={() => setFocusMode(true)}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                  size="sm"
                >
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Focus Mode</span>
                  <span className="sm:hidden">Focus</span>
                </TouchOptimizedButton>
                <VoiceProjectCreator onCreateProject={addVoiceProject} />
                <TouchOptimizedButton 
                  onClick={() => addProject()}
                  className="flex items-center justify-center gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Project</span>
                  <span className="sm:hidden">New</span>
                </TouchOptimizedButton>
              </div>
            </div>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm transition-all duration-200 hover:bg-accent/50">Dashboard</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm transition-all duration-200 hover:bg-accent/50">Analytics</TabsTrigger>
              <TabsTrigger value="ideas" className="text-xs sm:text-sm transition-all duration-200 hover:bg-accent/50">Ideas</TabsTrigger>
              <TabsTrigger value="kanban" className="text-xs sm:text-sm transition-all duration-200 hover:bg-accent/50">Kanban</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs sm:text-sm transition-all duration-200 hover:bg-accent/50">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <DashboardSummary projects={projects} ideas={ideas} />
                  <ProjectsGrid 
                    projects={projects}
                    onUpdate={updateProject}
                    onClone={cloneProject}
                  />
                </div>
                
                {/* AI Assistant Panel */}
                {dailyCheckIn && enhancedUserContext && (
                  <div className="lg:col-span-1">
                    <AIAssistantPanel
                      projects={projects}
                      ideas={ideas}
                      userContext={enhancedUserContext}
                      className="sticky top-4 animate-fade-in"
                      style={{ animationDelay: '0.6s' }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 animate-fade-in">
              <div className="animate-slide-up">
                <h2 className="text-2xl font-bold">Analytics & Insights</h2>
                <p className="text-gray-600">Track your mood, energy, and productivity patterns</p>
              </div>
              
              <AnalyticsDashboard 
                checkIns={dailyCheckIn ? [dailyCheckIn] : []}
                reflections={eveningReflections}
              />
            </TabsContent>

            <TabsContent value="ideas" className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center animate-slide-up">
                <div>
                  <h2 className="text-2xl font-bold">Idea Vault</h2>
                  <p className="text-gray-600">Capture, score, and prioritize your ideas</p>
                </div>
                <TouchOptimizedButton onClick={() => setShowIdeaWizard(true)}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  New Idea
                </TouchOptimizedButton>
              </div>
              
              <IdeaVaultGrid 
                ideas={ideas}
                onConvertToProject={convertIdeaToProject}
                onUpdateIdea={updateIdea}
              />
            </TabsContent>
            
            <TabsContent value="kanban" className="animate-fade-in">
              <KanbanBoard 
                projects={projects} 
                onUpdateProject={updateProject}
                onCloneProject={cloneProject}
              />
            </TabsContent>
            
            <TabsContent value="templates" className="animate-fade-in">
              <TemplateLibrary onCreateProject={addProject} />
            </TabsContent>
          </Tabs>

          {/* Modals with enhanced animations */}
          {showOnboarding && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="animate-scale-in">
                <OnboardingWizard 
                  onComplete={handleOnboardingComplete}
                  onSkip={() => setShowOnboarding(false)}
                />
              </div>
            </div>
          )}

          {showDailyCheckIn && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="animate-scale-in">
                <DailyCheckIn 
                  onComplete={handleDailyCheckInComplete}
                />
              </div>
            </div>
          )}

          {showIdeaWizard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="animate-scale-in">
                <IdeaVaultWizard 
                  onSaveIdea={addIdea}
                  onClose={() => setShowIdeaWizard(false)}
                />
              </div>
            </div>
          )}
          
          {showEveningReflection && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="animate-scale-in">
                <EveningReflection 
                  onComplete={handleEveningReflectionComplete}
                  dailyFocus={dailyCheckIn?.focus}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
