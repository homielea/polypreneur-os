
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, ChevronDown, ChevronUp, Zap, Rocket, ChevronRight } from "lucide-react";
import { Project, Phase } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onClone: (projectId: string) => void;
}

export const ProjectCard = ({ project, onUpdate, onClone }: ProjectCardProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<{ [key: string]: boolean }>({});

  const togglePhase = (phaseIndex: number) => {
    const updatedPhases = [...project.phases];
    const wasCompleted = updatedPhases[phaseIndex].completed;
    updatedPhases[phaseIndex].completed = !wasCompleted;
    
    // Calculate new progress
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

    // Trigger automations
    const phase = updatedPhases[phaseIndex];
    if (!wasCompleted && phase.completed && phase.automationTrigger) {
      triggerAutomation(phase.automationTrigger, phase.name);
    }
  };

  const togglePhaseExpansion = (phaseId: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const triggerAutomation = (trigger: string, phaseName: string) => {
    switch (trigger) {
      case "launch-announcement":
        toast({
          title: "🚀 Launch Automation Triggered!",
          description: "Sending announcements to X, email, and Notion..."
        });
        break;
      case "content-automation":
        toast({
          title: "📈 Marketing Automation Started!",
          description: "N8N flow triggered for content repurposing and email sequences..."
        });
        break;
    }
  };

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
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTypeIcon(project.type)}</span>
            <div>
              <CardTitle className="text-lg">{project.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn("text-xs", getStatusColor(project.status))}>
                  {project.status.replace("-", " ")}
                </Badge>
                <span className="text-xs text-gray-500">
                  {project.template}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClone(project.id)}
            className="flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            Clone
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2">
              <span className="text-sm">13-Phase Checklist</span>
              {isExpanded ? 
                <ChevronUp className="w-4 h-4" /> : 
                <ChevronDown className="w-4 h-4" />
              }
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2 mt-2">
            {project.phases.map((phase, index) => (
              <div
                key={phase.id}
                className={cn(
                  "rounded-lg border transition-colors",
                  phase.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                )}
              >
                <div className="flex items-center gap-3 p-3">
                  <Checkbox
                    checked={phase.completed}
                    onCheckedChange={() => togglePhase(index)}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        phase.completed ? "text-green-800 line-through" : "text-gray-900"
                      )}>
                        {phase.name}
                      </span>
                      {phase.description && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePhaseExpansion(phase.id)}
                          className="h-6 w-6 p-0"
                        >
                          <ChevronRight 
                            className={cn(
                              "w-3 h-3 transition-transform",
                              expandedPhases[phase.id] ? "rotate-90" : ""
                            )} 
                          />
                        </Button>
                      )}
                    </div>
                    {phase.automationTrigger && (
                      <div className="flex items-center gap-1 mt-1">
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-orange-600">Auto-trigger</span>
                      </div>
                    )}
                  </div>
                  {phase.completed && (
                    <div className="text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {expandedPhases[phase.id] && phase.subtasks && (
                  <div className="px-3 pb-3 ml-6">
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-600 mb-2 font-medium">{phase.description}</p>
                      <div className="space-y-1">
                        {phase.subtasks.map((subtask, subtaskIndex) => (
                          <div key={subtaskIndex} className="flex items-start gap-2">
                            <span className="text-xs text-gray-400 mt-0.5">•</span>
                            <span className="text-xs text-gray-700">{subtask}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {project.progress >= 85 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800">
              <Rocket className="w-4 h-4" />
              <span className="text-sm font-medium">Ready to Launch!</span>
            </div>
            <p className="text-xs text-orange-700 mt-1">
              Complete the remaining phases to trigger launch automations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
