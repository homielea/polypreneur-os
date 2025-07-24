
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { BarChart3, Target, Users, Grid3X3, TrendingUp, Plus } from "lucide-react";
import { LeanCanvasBuilder } from "@/components/LeanCanvasBuilder";
import { SWOTAnalysisBuilder } from "@/components/SWOTAnalysisBuilder";
import { BusinessModelCanvasBuilder } from "@/components/BusinessModelCanvasBuilder";
import { PersonaBuilder } from "@/components/PersonaBuilder";
import { EffortImpactGrid } from "@/components/EffortImpactGrid";

interface ProjectStrategyTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

type FrameworkType = "lean-canvas" | "swot" | "bmc" | "persona" | "effort-impact" | null;

export const ProjectStrategyTab = ({ project, onUpdate }: ProjectStrategyTabProps) => {
  const [activeFramework, setActiveFramework] = useState<FrameworkType>(null);

  const frameworks = [
    {
      id: "lean-canvas",
      title: "Lean Canvas",
      icon: Grid3X3,
      hasData: !!project.strategy?.leanCanvas,
      description: "9-block strategic planning tool"
    },
    {
      id: "swot",
      title: "SWOT Analysis",
      icon: Target,
      hasData: !!project.strategy?.swotAnalysis,
      description: "Strengths, Weaknesses, Opportunities, Threats"
    },
    {
      id: "bmc",
      title: "Business Model Canvas",
      icon: BarChart3,
      hasData: !!project.strategy?.businessModel,
      description: "Complete business model visualization"
    },
    {
      id: "persona",
      title: "Customer Personas",
      icon: Users,
      hasData: !!project.strategy?.personas?.length,
      description: "Detailed customer persona profiles"
    },
    {
      id: "effort-impact",
      title: "Effort-Impact Grid",
      icon: TrendingUp,
      hasData: !!project.strategy?.effortImpactGrid?.length,
      description: "Feature and task prioritization"
    }
  ];

  const handleFrameworkSave = (frameworkData: any, frameworkType: string) => {
    const updatedStrategy = {
      ...project.strategy,
      [frameworkType]: frameworkData
    };

    const updatedProject = {
      ...project,
      strategy: updatedStrategy
    };

    onUpdate(updatedProject);
    setActiveFramework(null);
  };

  const renderFramework = () => {
    switch (activeFramework) {
      case "lean-canvas":
        return (
          <LeanCanvasBuilder 
            initialData={project.strategy?.leanCanvas}
            onSave={(data) => handleFrameworkSave(data, 'leanCanvas')}
            onClose={() => setActiveFramework(null)} 
          />
        );
      case "swot":
        return (
          <SWOTAnalysisBuilder 
            initialData={project.strategy?.swotAnalysis}
            onSave={(data) => handleFrameworkSave(data, 'swotAnalysis')}
            onClose={() => setActiveFramework(null)} 
          />
        );
      case "bmc":
        return (
          <BusinessModelCanvasBuilder 
            initialData={project.strategy?.businessModel}
            onSave={(data) => handleFrameworkSave(data, 'businessModel')}
            onClose={() => setActiveFramework(null)} 
          />
        );
      case "persona":
        return (
          <PersonaBuilder 
            initialData={project.strategy?.personas}
            onSave={(data) => handleFrameworkSave(data, 'personas')}
            onClose={() => setActiveFramework(null)} 
          />
        );
      case "effort-impact":
        return (
          <EffortImpactGrid 
            initialData={project.strategy?.effortImpactGrid}
            onSave={(data) => handleFrameworkSave(data, 'effortImpactGrid')}
            onClose={() => setActiveFramework(null)} 
          />
        );
      default:
        return null;
    }
  };

  if (activeFramework) {
    return renderFramework();
  }

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Planning Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Use these strategic frameworks to analyze and plan your project systematically.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frameworks.map((framework) => {
              const IconComponent = framework.icon;
              return (
                <Card 
                  key={framework.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveFramework(framework.id as FrameworkType)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                      {framework.hasData && (
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium mb-1">{framework.title}</h3>
                    <p className="text-sm text-gray-600">{framework.description}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-3 justify-start"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {framework.hasData ? 'Edit' : 'Create'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completed Frameworks Summary */}
      {project.strategy && Object.keys(project.strategy).some(key => project.strategy![key as keyof typeof project.strategy]) && (
        <Card>
          <CardHeader>
            <CardTitle>Strategy Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.strategy.leanCanvas && (
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">Lean Canvas</h4>
                <p className="text-sm text-gray-600">
                  Value Proposition: {project.strategy.leanCanvas.valueProposition}
                </p>
              </div>
            )}
            
            {project.strategy.personas && project.strategy.personas.length > 0 && (
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">Customer Personas</h4>
                <p className="text-sm text-gray-600">
                  {project.strategy.personas.length} persona(s) defined
                </p>
              </div>
            )}
            
            {project.strategy.swotAnalysis && (
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium">SWOT Analysis</h4>
                <p className="text-sm text-gray-600">
                  Strengths, weaknesses, opportunities, and threats analyzed
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
