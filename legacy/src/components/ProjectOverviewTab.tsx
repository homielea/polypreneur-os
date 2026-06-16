
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "@/types";
import { Calendar, Target, Clock, Users } from "lucide-react";
import { format } from "date-fns";

interface ProjectOverviewTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export const ProjectOverviewTab = ({ project, onUpdate }: ProjectOverviewTabProps) => {
  const togglePhase = (phaseIndex: number) => {
    const updatedPhases = [...project.phases];
    updatedPhases[phaseIndex].completed = !updatedPhases[phaseIndex].completed;
    
    const completedCount = updatedPhases.filter(phase => phase.completed).length;
    const newProgress = Math.round((completedCount / updatedPhases.length) * 100);
    
    const updatedProject = {
      ...project,
      phases: updatedPhases,
      progress: newProgress,
      status: newProgress === 100 ? "launched" as const : 
              newProgress >= 85 ? "ready-to-launch" as const :
              newProgress > 0 ? "in-progress" as const : "ideation" as const
    };

    onUpdate(updatedProject);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Project Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.purpose && (
              <div>
                <h4 className="font-medium mb-2">Purpose</h4>
                <p className="text-gray-600">{project.purpose}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Type</h4>
                <Badge variant="secondary">{project.type}</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-1">Created</h4>
                <p className="text-sm text-gray-600">
                  {format(new Date(project.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            {project.timeline && (
              <div>
                <h4 className="font-medium mb-2">Timeline</h4>
                <p className="text-gray-600">{project.timeline}</p>
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Tasks */}
        {project.keyTasks && project.keyTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Key Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {project.keyTasks.map((task, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{task}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600">{project.progress}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
            <Progress value={project.progress} className="h-3 mb-4" />
            <div className="text-sm text-gray-600">
              {project.phases.filter(p => p.completed).length} of {project.phases.length} phases done
            </div>
          </CardContent>
        </Card>

        {/* Phase Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Phase Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.phases.slice(0, 5).map((phase, index) => (
              <div key={phase.id} className="flex items-center gap-3">
                <Checkbox
                  checked={phase.completed}
                  onCheckedChange={() => togglePhase(index)}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <span className={`text-sm ${phase.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {phase.name}
                </span>
              </div>
            ))}
            {project.phases.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                +{project.phases.length - 5} more phases
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Phases</span>
              <span className="font-medium">{project.phases.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-medium">{project.phases.filter(p => p.completed).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="font-medium">{project.phases.filter(p => !p.completed).length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
