
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TemplateLibrary } from "@/components/TemplateLibrary";
import { FocusMode } from "@/components/FocusMode";
import { ProjectCard } from "@/components/ProjectCard";
import { Plus, Target, Rocket, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  title: string;
  type: "web-app" | "extension" | "mobile";
  status: "ideation" | "in-progress" | "ready-to-launch" | "launched";
  progress: number;
  phases: Phase[];
  createdAt: Date;
  template?: string;
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

const PHASES = [
  {
    name: "Ideation",
    description: "Generate and refine product concepts",
    subtasks: [
      "Brainstorm product ideas based on personal pain points",
      "Research existing solutions and identify gaps",
      "Define core problem statement",
      "Validate idea with target audience feedback"
    ]
  },
  {
    name: "Problem & User Discovery",
    description: "Deep dive into user problems and market research",
    subtasks: [
      "Conduct user interviews (5-10 potential users)",
      "Create user personas and journey maps",
      "Analyze competitor landscape and positioning",
      "Document pain points and user stories"
    ]
  },
  {
    name: "Validation & Positioning",
    description: "Validate market demand and positioning strategy",
    subtasks: [
      "Create landing page or MVP concept",
      "Run validation experiments (surveys, pre-sales)",
      "Define unique value proposition",
      "Test messaging with target audience"
    ]
  },
  {
    name: "Product Strategy",
    description: "Define product roadmap and business model",
    subtasks: [
      "Define MVP feature set and scope",
      "Create product roadmap for 6 months",
      "Determine pricing and business model",
      "Set success metrics and KPIs"
    ]
  },
  {
    name: "Design & UX",
    description: "Create user interface and experience design",
    subtasks: [
      "Create wireframes and user flow diagrams",
      "Design UI mockups and prototypes",
      "Conduct usability testing sessions",
      "Finalize design system and components"
    ]
  },
  {
    name: "Build & Integrate",
    description: "Develop the product and integrate systems",
    subtasks: [
      "Set up development environment and tools",
      "Build core functionality and features",
      "Integrate third-party services and APIs",
      "Implement analytics and tracking"
    ]
  },
  {
    name: "Final QA + Founder Review",
    description: "Quality assurance and final review process",
    subtasks: [
      "Conduct comprehensive testing (functionality, UX, performance)",
      "Fix critical bugs and polish user experience",
      "Founder final review and approval",
      "Prepare launch assets and documentation"
    ]
  },
  {
    name: "Launch Setup & Execution",
    description: "Execute product launch strategy",
    subtasks: [
      "Set up analytics and monitoring tools",
      "Create launch announcement content",
      "Submit to relevant platforms (App Store, Chrome Web Store, etc.)",
      "Execute launch day communications"
    ],
    automationTrigger: "launch-announcement"
  },
  {
    name: "Automated Marketing & Sales",
    description: "Implement marketing automation and sales processes",
    subtasks: [
      "Set up email marketing sequences",
      "Create social media content calendar",
      "Implement conversion tracking and optimization",
      "Launch paid acquisition campaigns"
    ],
    automationTrigger: "content-automation"
  },
  {
    name: "SOP Creation + Systemization",
    description: "Document processes and create standard operating procedures",
    subtasks: [
      "Document all processes and workflows",
      "Create templates for future products",
      "Set up delegation frameworks",
      "Build knowledge base and documentation"
    ]
  },
  {
    name: "Post-Launch Feedback Loop",
    description: "Analyze usage, testimonials, and support tickets",
    subtasks: [
      "Collect and analyze user feedback",
      "Monitor usage analytics and user behavior",
      "Review support tickets and common issues",
      "Plan improvements for version 2"
    ]
  },
  {
    name: "Growth Experiments",
    description: "Run weekly growth sprints (SEO, affiliates, collaborations)",
    subtasks: [
      "Implement SEO optimization strategies",
      "Set up affiliate and referral programs",
      "Execute partnership and collaboration outreach",
      "Run conversion rate optimization experiments"
    ]
  },
  {
    name: "Founder Reflection & Energy Reset",
    description: "Track mood, burnout, energy. Celebrate wins.",
    subtasks: [
      "Conduct founder energy and burnout assessment",
      "Celebrate wins and document lessons learned",
      "Plan next product or improvement cycle",
      "Reset and prepare for next iteration"
    ]
  }
];

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

  const totalProjects = projects.length;
  const launchedProjects = projects.filter(p => p.status === "launched").length;
  const averageProgress = projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects;

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
              <Button 
                onClick={() => addProject()}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">Active in pipeline</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Launched</CardTitle>
                <Rocket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{launchedProjects}</div>
                <p className="text-xs text-muted-foreground">Products in market</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                <div className="h-4 w-4 rounded-full bg-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(averageProgress)}%</div>
                <Progress value={averageProgress} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="templates">Template Library</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onUpdate={updateProject}
                  onClone={cloneProject}
                />
              ))}
            </div>
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
