import { useState, useEffect } from "react";
import { Plus, BarChart3 } from "lucide-react";
import { DashboardSummary } from "@/components/DashboardSummary";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { IdeaVaultGrid } from "@/components/IdeaVaultGrid";
import { IdeaVaultWizard } from "@/components/IdeaVaultWizard";
import { ProjectTemplateLibrary } from "@/components/ProjectTemplateLibrary";
import { FounderProfile } from "@/components/FounderProfile";
import { FocusMode } from "@/components/FocusMode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, IdeaData } from "@/types";

export default function Index() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [showIdeaWizard, setShowIdeaWizard] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);

  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }

    const storedIdeas = localStorage.getItem("ideas");
    if (storedIdeas) {
      setIdeas(JSON.parse(storedIdeas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("ideas", JSON.stringify(ideas));
  }, [ideas]);

  const saveIdea = (newIdea: IdeaData) => {
    setIdeas(prevIdeas => [...prevIdeas, newIdea]);
  };

  const updateIdea = (updatedIdea: IdeaData) => {
    setIdeas(prevIdeas =>
      prevIdeas.map(idea => (idea.id === updatedIdea.id ? updatedIdea : idea))
    );
  };

  const saveProject = (newProject: Project) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(project => (project.id === updatedProject.id ? updatedProject : project))
    );
  };

  const cloneProject = (projectId: string) => {
    const projectToClone = projects.find(project => project.id === projectId);
    if (projectToClone) {
      const clonedProject = {
        ...projectToClone,
        id: Date.now().toString(),
        title: `${projectToClone.title} (Clone)`,
        createdAt: new Date(),
      };
      saveProject(clonedProject);
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  };

  const convertIdeaToProject = (idea: IdeaData) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: idea.title,
      type: idea.category === "saas" ? "web-app" : "extension",
      status: "ideation",
      progress: 0,
      phases: [
        { id: "1", name: "Phase 1", completed: false, tasks: [], subtasks: [] },
        { id: "2", name: "Phase 2", completed: false, tasks: [], subtasks: [] },
        { id: "3", name: "Phase 3", completed: false, tasks: [], subtasks: [] }
      ],
      createdAt: new Date(),
      purpose: idea.description,
      keyTasks: [idea.problemItSolves],
      tags: [idea.category],
    };

    saveProject(newProject);
    setIdeas(prevIdeas => prevIdeas.filter(i => i.id !== idea.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Polypreneur OS</h1>
          <p className="text-gray-600">Your all-in-one platform for managing multiple ventures</p>
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="ideas">Idea Vault</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardSummary 
              projects={projects}
              ideas={ideas}
              onQuickAction={(action) => {
                if (action === "add-project") setShowTemplateLibrary(true);
                if (action === "add-idea") setShowIdeaWizard(true);
                if (action === "focus-mode") setShowFocusMode(true);
              }}
            />
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <ProjectsGrid
              projects={projects}
              onUpdate={updateProject}
              onClone={cloneProject}
              onDelete={deleteProject}
            />
          </TabsContent>

          <TabsContent value="ideas" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Idea Vault</h2>
              <Button onClick={() => setShowIdeaWizard(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Capture New Idea
              </Button>
            </div>
            <IdeaVaultGrid
              ideas={ideas}
              onConvertToProject={convertIdeaToProject}
              onUpdateIdea={updateIdea}
            />
          </TabsContent>

          <TabsContent value="strategy" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Strategic Planning</h2>
                <p className="text-gray-600">Access strategic frameworks and planning tools</p>
              </div>
              <Button onClick={() => window.location.href = "/strategy"}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Open Strategy Toolkit
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Strategic planning for {project.type} project
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => window.location.href = `/project/${project.id}`}
                      className="w-full"
                    >
                      Open Project Canvas
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <FounderProfile />
          </TabsContent>
        </Tabs>

        {/* Modals and Dialogs */}
        {showIdeaWizard && (
          <IdeaVaultWizard
            onSaveIdea={saveIdea}
            onClose={() => setShowIdeaWizard(false)}
          />
        )}

        {showTemplateLibrary && (
          <ProjectTemplateLibrary
            onSaveProject={saveProject}
            onClose={() => setShowTemplateLibrary(false)}
          />
        )}

        {showFocusMode && (
          <FocusMode
            projects={projects}
            onExit={() => setShowFocusMode(false)}
          />
        )}
      </div>
    </div>
  );
}
