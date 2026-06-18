
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, TrendingUp, Users, Grid3X3, BarChart3 } from "lucide-react";
import { LeanCanvasBuilder } from "@/components/LeanCanvasBuilder";
import { SWOTAnalysisBuilder } from "@/components/SWOTAnalysisBuilder";
import { BusinessModelCanvasBuilder } from "@/components/BusinessModelCanvasBuilder";
import { PersonaBuilder } from "@/components/PersonaBuilder";
import { EffortImpactGrid } from "@/components/EffortImpactGrid";

type FrameworkType = "lean-canvas" | "swot" | "bmc" | "persona" | "effort-impact" | null;

export default function StrategyLibrary() {
  const navigate = useNavigate();
  const [activeFramework, setActiveFramework] = useState<FrameworkType>(null);

  const frameworks = [
    {
      id: "lean-canvas",
      title: "Lean Canvas",
      description: "9-block strategic planning tool for lean startups",
      icon: Grid3X3,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
    },
    {
      id: "swot",
      title: "SWOT Analysis", 
      description: "Analyze Strengths, Weaknesses, Opportunities, Threats",
      icon: Target,
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    {
      id: "bmc",
      title: "Business Model Canvas",
      description: "Complete business model visualization tool",
      icon: BarChart3,
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
    },
    {
      id: "persona",
      title: "Customer Personas",
      description: "Build detailed customer persona profiles",
      icon: Users,
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100"
    },
    {
      id: "effort-impact",
      title: "Effort-Impact Grid",
      description: "Prioritize features and tasks by effort vs impact",
      icon: TrendingUp,
      color: "bg-red-50 border-red-200 hover:bg-red-100"
    }
  ];

  const renderFramework = () => {
    switch (activeFramework) {
      case "lean-canvas":
        return <LeanCanvasBuilder onClose={() => setActiveFramework(null)} />;
      case "swot":
        return <SWOTAnalysisBuilder onClose={() => setActiveFramework(null)} />;
      case "bmc":
        return <BusinessModelCanvasBuilder onClose={() => setActiveFramework(null)} />;
      case "persona":
        return <PersonaBuilder onClose={() => setActiveFramework(null)} />;
      case "effort-impact":
        return <EffortImpactGrid onClose={() => setActiveFramework(null)} />;
      default:
        return null;
    }
  };

  if (activeFramework) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {renderFramework()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Strategy Toolkit</h1>
            <p className="text-gray-600">Choose a strategic framework to get started</p>
          </div>
        </div>

        {/* Framework Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map((framework) => {
            const IconComponent = framework.icon;
            return (
              <Card 
                key={framework.id}
                className={`cursor-pointer transition-all duration-200 ${framework.color}`}
                onClick={() => setActiveFramework(framework.id as FrameworkType)}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-3">
                    <IconComponent className="w-12 h-12 text-gray-700" />
                  </div>
                  <CardTitle className="text-lg">{framework.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    {framework.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use Strategic Frameworks</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Getting Started</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Choose a framework that fits your current needs</li>
                <li>• Work through each section systematically</li>
                <li>• Save frequently to preserve your progress</li>
                <li>• Return anytime to update your analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Be honest and realistic in your assessments</li>
                <li>• Update frameworks as your project evolves</li>
                <li>• Use multiple frameworks for comprehensive planning</li>
                <li>• Review regularly to stay aligned with goals</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
