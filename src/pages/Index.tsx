
import { useState } from "react";
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
import { Plus, Brain, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PHASES } from "@/constants/phases";
import { Project, IdeaData } from "@/types";

const Index = () => {
  const { toast } = useToast();
  const [focusMode, setFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showIdeaWizard, setShowIdeaWizard] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "AI Email Assistant",
      type: "web-app",
      status: "in-progress",
      progress: 54,
      phases: PHASES.map((phase, index) => ({
        id: `${index}`,
        name: phase.name,
        completed: index < 7,
        tasks: [`Complete ${phase.name.toLowerCase()} tasks`],
        subtasks: phase.subtasks,
        description: phase.description,
        automationTrigger: phase.automationTrigger
      })),
      createdAt: new Date(),
      template: "web-app-saas"
    },
    {
      id: "2", 
      title: "Chrome Productivity Extension",
      type: "extension",
      status: "ideation",
      progress: 23,
      phases: PHASES.map((phase, index) => ({
        id: `${index}`,
        name: phase.name,
        completed: index < 3,
        tasks: [`Complete ${phase.name.toLowerCase()} tasks`],
        subtasks: phase.subtasks,
        description: phase.description,
        automationTrigger: phase.automationTrigger
      })),
      createdAt: new Date(),
      template: "extension-template"
    }
  ]);

  const [ideas, setIdeas] = useState<IdeaData[]>([]);

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
    
    setProjects([...projects, newProject]);
    toast({
      title: "Project Created",
      description: "New project added to your dashboard"
    });
  };

  const addVoiceProject = (project: Project) => {
    setProjects([...projects, project]);
    toast({
      title: "Voice Project Created",
      description: `"${project.title}" added to your dashboard`
    });
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
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
      setProjects([...projects, clonedProject]);
      toast({
        title: "Project Cloned",
        description: "Project template copied successfully"
      });
    }
  };

  const addIdea = (idea: IdeaData) => {
    setIdeas([...ideas, idea]);
  };

  const updateIdea = (updatedIdea: IdeaData) => {
    setIdeas(ideas.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea));
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

    setProjects([...projects, newProject]);
    updateIdea({ ...idea, status: "converted" });
    
    toast({
      title: "Idea Converted!",
      description: `"${idea.title}" is now a project in your dashboard`
    });
  };

  if (focusMode) {
    return <FocusMode projects={projects} onExit={() => setFocusMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col gap-4 mb-4 md:flex-row md:justify-between md:items-center">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Polypreneur-OS</h1>
              <p className="text-base md:text-lg text-gray-600">Launch digital products with repeatable systems</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 items-stretch sm:items-center">
              <Button 
                onClick={() => setFocusMode(true)}
                variant="outline"
                className="flex items-center justify-center gap-2"
                size="sm"
              >
                <Brain className="w-4 h-4" />
                Focus Mode
              </Button>
              <VoiceProjectCreator onCreateProject={addVoiceProject} />
              <Button 
                onClick={() => addProject()}
                className="flex items-center justify-center gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>
          </div>

          <StatsCards projects={projects} />
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ideas">Idea Vault</TabsTrigger>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="templates">Template Library</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <ProjectsGrid 
              projects={projects}
              onUpdate={updateProject}
              onClone={cloneProject}
            />
          </TabsContent>

          <TabsContent value="ideas" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Idea Vault</h2>
                <p className="text-gray-600">Capture, score, and prioritize your ideas</p>
              </div>
              <Button onClick={() => setShowIdeaWizard(true)}>
                <Lightbulb className="w-4 h-4 mr-2" />
                New Idea
              </Button>
            </div>
            
            <IdeaVaultGrid 
              ideas={ideas}
              onConvertToProject={convertIdeaToProject}
              onUpdateIdea={updateIdea}
            />
          </TabsContent>
          
          <TabsContent value="kanban">
            <KanbanBoard 
              projects={projects} 
              onUpdateProject={updateProject}
              onCloneProject={cloneProject}
            />
          </TabsContent>
          
          <TabsContent value="templates">
            <TemplateLibrary onCreateProject={addProject} />
          </TabsContent>
        </Tabs>

        {/* Idea Wizard Modal */}
        {showIdeaWizard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <IdeaVaultWizard 
              onSaveIdea={addIdea}
              onClose={() => setShowIdeaWizard(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
