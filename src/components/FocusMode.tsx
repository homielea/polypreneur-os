
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Target, Clock, Zap } from "lucide-react";
import { Project } from "@/types";

interface FocusModeProps {
  projects: Project[];
  onExit: () => void;
}

export const FocusMode = ({ projects, onExit }: FocusModeProps) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    projects.find(p => p.status === "in-progress" || p.progress > 0) || projects[0] || null
  );

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button onClick={onExit} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Exit Focus Mode
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Focus Mode</h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg text-gray-600">No projects available. Create a project first!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentPhase = selectedProject.phases.find(p => !p.completed) || selectedProject.phases[0];
  const nextPhases = selectedProject.phases.filter(p => !p.completed).slice(1, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={onExit} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Exit Focus Mode
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Focus Mode</h1>
        </div>

        {/* Project Selection */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {projects.map((project) => (
              <Button
                key={project.id}
                variant={selectedProject.id === project.id ? "default" : "outline"}
                onClick={() => setSelectedProject(project)}
                className="flex items-center gap-2"
              >
                <span className="text-lg">
                  {project.type === "web-app" ? "🌐" : 
                   project.type === "extension" ? "🔌" : 
                   project.type === "mobile" ? "📱" : "💻"}
                </span>
                {project.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Phase */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Current Focus: {currentPhase.name}
                  </CardTitle>
                  <Badge variant="secondary">{selectedProject.progress}% Complete</Badge>
                </div>
                <Progress value={selectedProject.progress} className="h-2" />
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{currentPhase.description}</p>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Action Items:</h4>
                  {currentPhase.subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox className="mt-0.5" />
                      <span className="text-sm text-gray-700">{subtask}</span>
                    </div>
                  ))}
                </div>

                {currentPhase.automationTrigger && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">Automation Ready</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      Completing this phase will trigger automated workflows.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Next Up */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Coming Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nextPhases.map((phase, index) => (
                  <div key={phase.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 text-sm">{phase.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{phase.description}</p>
                  </div>
                ))}
                
                {nextPhases.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-2xl mb-2">🎉</div>
                    <p className="text-sm text-gray-600">All phases complete!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
