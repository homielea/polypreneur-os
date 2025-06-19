
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TemplateLibrary } from "@/components/TemplateLibrary";
import { FocusMode } from "@/components/FocusMode";
import { StatsCards } from "@/components/StatsCards";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { VoiceProjectCreator } from "@/components/VoiceProjectCreator";
import { Plus, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PHASES } from "@/constants/phases";
import { Project } from "@/types";

const Index = () => {
  const { toast } = useToast();
  const [focusMode, setFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
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

  if (focusMode) {
    return <FocusMode projects={projects} onExit={() => setFocusMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Polypreneur-OS</h1>
              <p className="text-lg text-gray-600">Launch digital products with repeatable systems</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setFocusMode(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Focus Mode
              </Button>
              <VoiceProjectCreator onCreateProject={addVoiceProject} />
              <Button 
                onClick={() => addProject()}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>
          </div>

          <StatsCards projects={projects} />
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
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
      </div>
    </div>
  );
};

export default Index;
