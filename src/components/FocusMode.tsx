
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, X, Brain, Target } from "lucide-react";
import { Project } from "@/pages/Index";
import { cn } from "@/lib/utils";

interface FocusModeProps {
  projects: Project[];
  onExit: () => void;
}

export const FocusMode = ({ projects, onExit }: FocusModeProps) => {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  const currentProject = projects[currentProjectIndex];
  const currentPhase = currentProject?.phases[currentPhaseIndex];

  const nextIncompletePhase = () => {
    if (!currentProject) return;
    
    // Find next incomplete phase in current project
    for (let i = currentPhaseIndex + 1; i < currentProject.phases.length; i++) {
      if (!currentProject.phases[i].completed) {
        setCurrentPhaseIndex(i);
        return;
      }
    }
    
    // If no incomplete phases in current project, move to next project
    for (let projectIdx = currentProjectIndex + 1; projectIdx < projects.length; projectIdx++) {
      const project = projects[projectIdx];
      for (let phaseIdx = 0; phaseIdx < project.phases.length; phaseIdx++) {
        if (!project.phases[phaseIdx].completed) {
          setCurrentProjectIndex(projectIdx);
          setCurrentPhaseIndex(phaseIdx);
          return;
        }
      }
    }
  };

  const previousPhase = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhaseIndex(currentPhaseIndex - 1);
    } else if (currentProjectIndex > 0) {
      setCurrentProjectIndex(currentProjectIndex - 1);
      setCurrentPhaseIndex(projects[currentProjectIndex - 1].phases.length - 1);
    }
  };

  const nextPhase = () => {
    if (currentPhaseIndex < currentProject.phases.length - 1) {
      setCurrentPhaseIndex(currentPhaseIndex + 1);
    } else if (currentProjectIndex < projects.length - 1) {
      setCurrentProjectIndex(currentProjectIndex + 1);
      setCurrentPhaseIndex(0);
    }
  };

  const getPhaseProgress = () => {
    if (!currentProject) return 0;
    return Math.round(((currentPhaseIndex + 1) / currentProject.phases.length) * 100);
  };

  if (!currentProject || !currentPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No projects found</h2>
            <p className="text-gray-600 mb-4">Create a project to use Focus Mode</p>
            <Button onClick={onExit}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onExit} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Exit Focus
              </Button>
              <Badge className="bg-purple-100 text-purple-800">
                <Brain className="w-3 h-3 mr-1" />
                Focus Mode
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Project {currentProjectIndex + 1} of {projects.length}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={nextIncompletePhase}
                className="flex items-center gap-1"
              >
                <Target className="w-3 h-3" />
                Next Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Phase Focus */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentPhase.name}</CardTitle>
                    <p className="opacity-90">Phase {currentPhaseIndex + 1} of {currentProject.phases.length}</p>
                  </div>
                  <div className="text-3xl">
                    {currentPhaseIndex === 0 ? "💡" :
                     currentPhaseIndex === 1 ? "🔍" :
                     currentPhaseIndex === 2 ? "📋" :
                     currentPhaseIndex === 3 ? "🛠️" :
                     currentPhaseIndex === 4 ? "🎨" :
                     currentPhaseIndex === 5 ? "⚒️" :
                     currentPhaseIndex === 6 ? "🧪" :
                     currentPhaseIndex === 7 ? "🚀" :
                     currentPhaseIndex === 8 ? "📈" : "📚"}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                <div>
                  <Progress value={getPhaseProgress()} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">
                    Phase progress: {getPhaseProgress()}%
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Focus on this phase:</h3>
                  <div className="space-y-3">
                    {currentPhase.tasks.map((task, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Checkbox className="mt-1" />
                        <span className="text-gray-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentPhase.automationTrigger && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-800 mb-2">
                      <span>⚡</span>
                      <span className="font-medium">Automation Ready</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Completing this phase will trigger: {currentPhase.automationTrigger}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={previousPhase}
                    disabled={currentProjectIndex === 0 && currentPhaseIndex === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={nextPhase}
                    disabled={currentProjectIndex === projects.length - 1 && 
                             currentPhaseIndex === currentProject.phases.length - 1}
                    className="flex items-center gap-2 flex-1"
                  >
                    Next Phase
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Overview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentProject.title}</CardTitle>
                <Badge className={cn(
                  "w-fit",
                  currentProject.status === "launched" ? "bg-green-100 text-green-800" :
                  currentProject.status === "ready-to-launch" ? "bg-orange-100 text-orange-800" :
                  currentProject.status === "in-progress" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                )}>
                  {currentProject.status.replace("-", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm">{currentProject.progress}%</span>
                  </div>
                  <Progress value={currentProject.progress} />
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Type: {currentProject.type.replace("-", " ")}</p>
                  <p>Template: {currentProject.template}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Phases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentProject.phases.map((phase, index) => (
                    <div
                      key={phase.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                        index === currentPhaseIndex ? "bg-purple-100 border-2 border-purple-300" :
                        phase.completed ? "bg-green-50" : "bg-gray-50"
                      )}
                      onClick={() => setCurrentPhaseIndex(index)}
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        index === currentPhaseIndex ? "bg-purple-500" :
                        phase.completed ? "bg-green-500" : "bg-gray-300"
                      )} />
                      <span className={cn(
                        "text-sm",
                        index === currentPhaseIndex ? "font-medium" : "",
                        phase.completed ? "text-green-700" : "text-gray-700"
                      )}>
                        {phase.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
