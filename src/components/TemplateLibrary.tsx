
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Code, Smartphone, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  type: "web-app" | "extension" | "mobile";
  description: string;
  techStack: string[];
  sopItems: string[];
  automations: string[];
  created: Date;
}

interface TemplateLibraryProps {
  onCreateProject: (template?: string) => void;
}

export const TemplateLibrary = ({ onCreateProject }: TemplateLibraryProps) => {
  const { toast } = useToast();
  
  const [templates] = useState<Template[]>([
    {
      id: "web-app-saas",
      name: "Web App SaaS Template",
      type: "web-app",
      description: "Complete SaaS web application with user auth, payments, and dashboard",
      techStack: ["React", "TypeScript", "Tailwind", "Supabase", "Stripe"],
      sopItems: [
        "Market research & competitor analysis",
        "User persona definition",
        "MVP feature specification", 
        "Database schema design",
        "UI/UX wireframes",
        "Authentication setup",
        "Payment integration",
        "Beta testing plan"
      ],
      automations: [
        "Launch announcement sequence",
        "User onboarding emails",
        "Product Hunt submission",
        "Social media posts"
      ],
      created: new Date("2024-01-15")
    },
    {
      id: "extension-template",
      name: "Chrome Extension Template", 
      type: "extension",
      description: "Productivity Chrome extension with content scripts and popup interface",
      techStack: ["JavaScript", "Chrome APIs", "HTML/CSS", "Webpack"],
      sopItems: [
        "Extension concept validation",
        "Chrome Web Store guidelines review",
        "Manifest v3 configuration",
        "Content script development",
        "Popup interface design",
        "Chrome Web Store assets",
        "Beta testing with users",
        "Store submission process"
      ],
      automations: [
        "Chrome Web Store launch",
        "ProductHunt submission",
        "Twitter announcement thread",
        "Email to subscriber list"
      ],
      created: new Date("2024-01-20")
    },
    {
      id: "mobile-app-template",
      name: "Mobile App Template",
      type: "mobile", 
      description: "Cross-platform mobile app with native features and cloud backend",
      techStack: ["React Native", "Expo", "TypeScript", "Firebase", "Redux"],
      sopItems: [
        "Mobile market research",
        "App Store optimization plan",
        "Cross-platform compatibility testing",
        "Push notification setup",
        "App store assets creation",
        "iOS/Android store guidelines",
        "TestFlight/Play Console beta",
        "Store submission & review"
      ],
      automations: [
        "App store launch sequence",
        "Press release distribution", 
        "Influencer outreach campaign",
        "Social media announcement"
      ],
      created: new Date("2024-01-25")
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "web-app": return <FileText className="w-5 h-5" />;
      case "extension": return <Code className="w-5 h-5" />;
      case "mobile": return <Smartphone className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "web-app": return "bg-blue-100 text-blue-800";
      case "extension": return "bg-purple-100 text-purple-800";
      case "mobile": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const cloneTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast({
        title: "Template Cloned",
        description: `${template.name} copied to your templates`
      });
    }
  };

  const exportTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Simulate template export
      const templateData = JSON.stringify(template, null, 2);
      console.log("Exporting template:", templateData);
      
      toast({
        title: "Template Exported",
        description: "Template data copied to clipboard"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Template Library</h2>
          <p className="text-gray-600">Reusable SOPs, tech stacks, and automation templates</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getTypeIcon(template.type)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={getTypeColor(template.type)}>
                    {template.type.replace("-", " ")}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-1">
                  {template.techStack.map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">SOP Checklist ({template.sopItems.length} items)</h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {template.sopItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-gray-400">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                  {template.sopItems.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{template.sopItems.length - 3} more items...
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Automations</h4>
                <div className="space-y-1">
                  {template.automations.slice(0, 2).map((automation, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-orange-400">⚡</span>
                      <span>{automation}</span>
                    </div>
                  ))}
                  {template.automations.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{template.automations.length - 2} more automations...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onCreateProject(template.id)}
                >
                  Use Template
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => cloneTemplate(template.id)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => exportTemplate(template.id)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Templates */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => onCreateProject("web-app-saas")}
          >
            🌐
            <span className="font-medium">SaaS Web App</span>
            <span className="text-xs text-gray-600">Full-stack application</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => onCreateProject("extension-template")}
          >
            🔌
            <span className="font-medium">Browser Extension</span>
            <span className="text-xs text-gray-600">Chrome/Firefox extension</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => onCreateProject("mobile-app-template")}
          >
            📱
            <span className="font-medium">Mobile App</span>
            <span className="text-xs text-gray-600">Cross-platform mobile</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
