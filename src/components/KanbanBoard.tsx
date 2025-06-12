
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Project } from "@/pages/Index";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onCloneProject: (projectId: string) => void;
}

export const KanbanBoard = ({ projects, onUpdateProject, onCloneProject }: KanbanBoardProps) => {
  const columns = [
    { id: "ideation", title: "Ideation", color: "bg-gray-100" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-100" },
    { id: "ready-to-launch", title: "Ready to Launch", color: "bg-orange-100" },
    { id: "launched", title: "Launched", color: "bg-green-100" }
  ];

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <div key={column.id} className="space-y-4">
          <div className={cn("rounded-lg p-4", column.color)}>
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="text-sm text-gray-600">
              {getProjectsByStatus(column.id).length} projects
            </span>
          </div>

          <div className="space-y-3">
            {getProjectsByStatus(column.id).map((project) => (
              <Card 
                key={project.id} 
                className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(project.type)}</span>
                      <CardTitle className="text-sm">{project.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCloneProject(project.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-xs">
                      {project.type.replace("-", " ")}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {project.phases.filter(p => p.completed).length}/10 phases
                    </span>
                  </div>

                  {project.template && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                      Template: {project.template}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {getProjectsByStatus(column.id).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-2xl mb-2">📭</div>
                <p className="text-sm">No projects in {column.title.toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
