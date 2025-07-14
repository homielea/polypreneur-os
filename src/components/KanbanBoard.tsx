
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Copy, GripVertical } from "lucide-react";
import { Project } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface KanbanBoardProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onCloneProject: (projectId: string) => void;
}

export const KanbanBoard = ({ projects, onUpdateProject, onCloneProject }: KanbanBoardProps) => {
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

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

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", projectId);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("text/plain");
    const project = projects.find(p => p.id === projectId);
    
    if (project && project.status !== newStatus) {
      const updatedProject = {
        ...project,
        status: newStatus as Project["status"]
      };
      onUpdateProject(updatedProject);
    }
    
    setDraggedProject(null);
    setDragOverColumn(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <div 
          key={column.id} 
          className={cn(
            "space-y-4 min-h-[500px] transition-all duration-200",
            dragOverColumn === column.id && "ring-2 ring-blue-400 ring-offset-2"
          )}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className={cn(
            "rounded-lg p-4 transition-colors duration-200",
            column.color,
            dragOverColumn === column.id && "bg-opacity-80 border-2 border-blue-400 border-dashed"
          )}>
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="text-sm text-gray-600">
              {getProjectsByStatus(column.id).length} projects
            </span>
          </div>

          <div className="space-y-3">
            {getProjectsByStatus(column.id).map((project) => (
              <Card 
                key={project.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, project.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "hover:shadow-md transition-all duration-200 cursor-move select-none",
                  draggedProject === project.id && "opacity-50 rotate-2 scale-105 shadow-lg",
                  "group"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-1">
                        <GripVertical className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        <span className="text-lg">{getTypeIcon(project.type)}</span>
                      </div>
                      <CardTitle className="text-sm flex-1">{project.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloneProject(project.id);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                      {project.phases.filter(p => p.completed).length}/13 phases
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
              <div className={cn(
                "text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg transition-colors",
                dragOverColumn === column.id && "border-blue-400 bg-blue-50"
              )}>
                <div className="text-2xl mb-2">📭</div>
                <p className="text-sm">
                  {dragOverColumn === column.id ? "Drop project here" : `No projects in ${column.title.toLowerCase()}`}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
