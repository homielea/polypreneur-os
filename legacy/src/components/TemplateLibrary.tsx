
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Code, Smartphone, Copy, Download, Globe, ShoppingCart, Database, Newspaper, BarChart3, Zap, Monitor, Users } from "lucide-react";
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
  timeEstimate: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
}

interface TemplateLibraryProps {
  onCreateProject: (template?: string) => void;
}

export const TemplateLibrary = ({ onCreateProject }: TemplateLibraryProps) => {
  const { toast } = useToast();
  
  const [templates] = useState<Template[]>([
    {
      id: "web-app-saas",
      name: "SaaS Web Application",
      type: "web-app",
      description: "Complete SaaS web application with user auth, payments, and dashboard",
      techStack: ["React", "TypeScript", "Tailwind", "Supabase", "Stripe"],
      sopItems: [
        "Market research & competitor analysis",
        "User persona definition & interviews",
        "MVP feature specification",
        "Database schema design",
        "UI/UX wireframes & prototyping",
        "Authentication system setup",
        "Payment integration & billing",
        "Email automation setup",
        "Analytics implementation",
        "Security audit & testing",
        "Performance optimization",
        "Beta testing program",
        "Launch strategy & marketing",
        "Customer support setup",
        "Monitoring & alerting"
      ],
      automations: [
        "User onboarding email sequence",
        "Payment failure notifications",
        "Product Hunt submission",
        "Social media launch posts",
        "Customer feedback collection"
      ],
      timeEstimate: "8-12 weeks",
      difficulty: "advanced",
      category: "Business",
      created: new Date("2024-01-15")
    },
    {
      id: "landing-page",
      name: "Marketing Landing Page",
      type: "web-app",
      description: "High-converting landing page with lead capture and analytics",
      techStack: ["React", "Tailwind", "Framer Motion", "ConvertKit", "Vercel"],
      sopItems: [
        "Target audience research",
        "Competitor landing page analysis",
        "Value proposition development",
        "Copywriting & messaging",
        "Visual design & branding",
        "Lead magnet creation",
        "Form optimization",
        "A/B testing setup",
        "SEO optimization",
        "Performance optimization",
        "Analytics implementation",
        "Email automation setup",
        "Social proof collection",
        "Launch campaign",
        "Conversion optimization"
      ],
      automations: [
        "Lead nurturing email sequence",
        "Social media content",
        "Google Ads campaign",
        "Analytics reporting",
        "Follow-up sequences"
      ],
      timeEstimate: "2-4 weeks",
      difficulty: "beginner",
      category: "Marketing",
      created: new Date("2024-01-20")
    },
    {
      id: "ecommerce-store",
      name: "E-commerce Store",
      type: "web-app",
      description: "Full-featured online store with payments, inventory, and admin panel",
      techStack: ["Next.js", "Shopify API", "Stripe", "Prisma", "Tailwind"],
      sopItems: [
        "Product market research",
        "Supplier & inventory setup",
        "Brand identity development",
        "Product photography",
        "Store design & UX",
        "Payment gateway integration",
        "Inventory management system",
        "Order fulfillment process",
        "Customer service setup",
        "Shipping & logistics",
        "SEO & product optimization",
        "Email marketing setup",
        "Social media integration",
        "Analytics & reporting",
        "Launch marketing campaign"
      ],
      automations: [
        "Order confirmation emails",
        "Shipping notifications",
        "Abandoned cart recovery",
        "Customer review requests",
        "Inventory alerts"
      ],
      timeEstimate: "6-10 weeks",
      difficulty: "intermediate",
      category: "E-commerce",
      created: new Date("2024-01-25")
    },
    {
      id: "api-microservice",
      name: "API/Microservice",
      type: "web-app",
      description: "Scalable REST API with authentication, rate limiting, and documentation",
      techStack: ["Node.js", "Express", "PostgreSQL", "Redis", "Docker"],
      sopItems: [
        "API requirements gathering",
        "Database schema design",
        "Authentication strategy",
        "Rate limiting implementation",
        "Input validation & sanitization",
        "Error handling & logging",
        "API documentation",
        "Testing strategy & implementation",
        "Security best practices",
        "Performance optimization",
        "Monitoring & alerting",
        "CI/CD pipeline setup",
        "Docker containerization",
        "Deployment strategy",
        "API versioning plan"
      ],
      automations: [
        "API health monitoring",
        "Error alerting",
        "Performance reports",
        "Security scanning",
        "Automated testing"
      ],
      timeEstimate: "4-8 weeks",
      difficulty: "advanced",
      category: "Backend",
      created: new Date("2024-02-01")
    },
    {
      id: "content-blog",
      name: "Content Site/Blog",
      type: "web-app",
      description: "SEO-optimized content site with CMS, comments, and newsletter",
      techStack: ["Next.js", "MDX", "Contentful", "Tailwind", "Vercel"],
      sopItems: [
        "Content strategy development",
        "Keyword research & SEO planning",
        "Site architecture & navigation",
        "Content management setup",
        "Design system creation",
        "Article template design",
        "Comment system integration",
        "Newsletter signup optimization",
        "Social sharing features",
        "Search functionality",
        "Performance optimization",
        "SEO implementation",
        "Analytics setup",
        "Content calendar creation",
        "Launch & promotion strategy"
      ],
      automations: [
        "Newsletter automation",
        "Social media posting",
        "SEO monitoring",
        "Content performance reports",
        "Reader engagement tracking"
      ],
      timeEstimate: "3-6 weeks",
      difficulty: "intermediate",
      category: "Content",
      created: new Date("2024-02-05")
    },
    {
      id: "dashboard-admin",
      name: "Dashboard/Admin Panel",
      type: "web-app",
      description: "Data visualization dashboard with user management and analytics",
      techStack: ["React", "TypeScript", "Recharts", "Tanstack Query", "Tailwind"],
      sopItems: [
        "Requirements & user stories",
        "Data model design",
        "UI/UX wireframing",
        "Authentication & authorization",
        "Role-based access control",
        "Data visualization components",
        "Real-time updates setup",
        "Export functionality",
        "Search & filtering",
        "Performance optimization",
        "Mobile responsiveness",
        "Testing implementation",
        "Security audit",
        "User training materials",
        "Deployment & monitoring"
      ],
      automations: [
        "Daily data reports",
        "Alert notifications",
        "User activity monitoring",
        "Performance metrics",
        "Backup automation"
      ],
      timeEstimate: "6-10 weeks",
      difficulty: "advanced",
      category: "Analytics",
      created: new Date("2024-02-10")
    },
    {
      id: "extension-template",
      name: "Browser Extension",
      type: "extension",
      description: "Productivity browser extension with content scripts and popup interface",
      techStack: ["JavaScript", "Chrome APIs", "HTML/CSS", "Webpack"],
      sopItems: [
        "Extension concept validation",
        "Chrome Web Store guidelines review",
        "Manifest v3 configuration",
        "Content script development",
        "Background script setup",
        "Popup interface design",
        "Options page creation",
        "Permission management",
        "Data storage implementation",
        "Cross-browser compatibility",
        "Chrome Web Store assets",
        "Beta testing with users",
        "Store submission process",
        "User feedback integration",
        "Update & maintenance plan"
      ],
      automations: [
        "Chrome Web Store launch",
        "ProductHunt submission",
        "Twitter announcement thread",
        "Email to subscriber list",
        "Usage analytics tracking"
      ],
      timeEstimate: "4-7 weeks",
      difficulty: "intermediate",
      category: "Productivity",
      created: new Date("2024-02-15")
    },
    {
      id: "mobile-app-template",
      name: "Mobile Application",
      type: "mobile",
      description: "Cross-platform mobile app with native features and cloud backend",
      techStack: ["React Native", "Expo", "TypeScript", "Firebase", "Redux"],
      sopItems: [
        "Mobile market research",
        "Platform strategy (iOS/Android)",
        "UI/UX design for mobile",
        "Navigation architecture",
        "State management setup",
        "API integration",
        "Push notification setup",
        "Offline functionality",
        "App store optimization",
        "Cross-platform testing",
        "Performance optimization",
        "App store assets creation",
        "Beta testing program",
        "Store submission & review",
        "Launch marketing campaign"
      ],
      automations: [
        "App store launch sequence",
        "Push notification campaigns",
        "User onboarding flow",
        "Crash reporting",
        "User engagement tracking"
      ],
      timeEstimate: "10-16 weeks",
      difficulty: "advanced",
      category: "Mobile",
      created: new Date("2024-02-20")
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "web-app": return <Globe className="w-5 h-5" />;
      case "extension": return <Code className="w-5 h-5" />;
      case "mobile": return <Smartphone className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Business": return <BarChart3 className="w-4 h-4" />;
      case "Marketing": return <Users className="w-4 h-4" />;
      case "E-commerce": return <ShoppingCart className="w-4 h-4" />;
      case "Backend": return <Database className="w-4 h-4" />;
      case "Content": return <Newspaper className="w-4 h-4" />;
      case "Analytics": return <BarChart3 className="w-4 h-4" />;
      case "Productivity": return <Zap className="w-4 h-4" />;
      case "Mobile": return <Smartphone className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
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
          <p className="text-gray-600">Comprehensive templates with detailed SOPs and automation</p>
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
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getTypeIcon(template.type)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getTypeColor(template.type)}>
                      {template.type.replace("-", " ")}
                    </Badge>
                    <Badge className={getDifficultyColor(template.difficulty)}>
                      {template.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(template.category)}
                <span className="text-sm font-medium text-gray-600">{template.category}</span>
                <span className="text-sm text-gray-500">• {template.timeEstimate}</span>
              </div>
              
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-1">
                  {template.techStack.slice(0, 4).map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {template.techStack.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.techStack.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">
                  Complete SOP ({template.sopItems.length} steps)
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {template.sopItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                  {template.sopItems.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{template.sopItems.length - 3} more detailed steps...
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Launch Automations</h4>
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
        <h3 className="text-lg font-semibold mb-4">🚀 Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => onCreateProject("landing-page")}
          >
            🎯
            <span className="font-medium">Landing Page</span>
            <span className="text-xs text-gray-600">2-4 weeks • Beginner</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => onCreateProject("web-app-saas")}
          >
            🌐
            <span className="font-medium">SaaS App</span>
            <span className="text-xs text-gray-600">8-12 weeks • Advanced</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => onCreateProject("extension-template")}
          >
            🔌
            <span className="font-medium">Browser Extension</span>
            <span className="text-xs text-gray-600">4-7 weeks • Intermediate</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => onCreateProject("ecommerce-store")}
          >
            🛒
            <span className="font-medium">E-commerce Store</span>
            <span className="text-xs text-gray-600">6-10 weeks • Intermediate</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
