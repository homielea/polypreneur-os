
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, BarChart3, Rocket, CheckSquare } from "lucide-react";
import { Project } from "@/types";
import { ProjectOverviewTab } from "@/components/ProjectOverviewTab";
import { ProjectStrategyTab } from "@/components/ProjectStrategyTab";
import { ProjectLaunchPlanTab } from "@/components/ProjectLaunchPlanTab";
import { ProjectValidationTab } from "@/components/ProjectValidationTab";

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const foundProject = projects.find((p: Project) => p.id === id);
    setProject(foundProject || null);
  }, [id]);

  const updateProject = (updatedProject: Project) => {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const updatedProjects = projects.map((p: Project) => 
      p.id === updatedProject.id ? updatedProject : p
    );
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setProject(updatedProject);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ideation": return "bg-gray-100 text-gray-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "ready-to-launch": return "bg-orange-100 text-orange-800";
      case "launched": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "web-app": return "🌐";
      case "extension": return "🔌";
      case "mobile": return "📱";
      default: return "💻";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getTypeIcon(project.type)}</span>
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace("-", " ")}
                </Badge>
                <span className="text-sm text-gray-500">{project.template}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Project Progress</h2>
              <span className="text-2xl font-bold text-blue-600">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
            <div className="mt-2 text-sm text-gray-600">
              {project.phases.filter(p => p.completed).length} of {project.phases.length} phases completed
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Strategy
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="launch" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Launch Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ProjectOverviewTab project={project} onUpdate={updateProject} />
          </TabsContent>

          <TabsContent value="strategy" className="mt-6">
            <ProjectStrategyTab project={project} onUpdate={updateProject} />
          </TabsContent>

          <TabsContent value="validation" className="mt-6">
            <ProjectValidationTab project={project} onUpdate={updateProject} />
          </TabsContent>

          <TabsContent value="launch" className="mt-6">
            <ProjectLaunchPlanTab project={project} onUpdate={updateProject} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
