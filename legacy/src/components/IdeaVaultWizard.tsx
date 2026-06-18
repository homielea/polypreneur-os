import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { IdeaData } from "@/types";
import { scoreIdea } from "@/utils/ideaScorer";
import { useToast } from "@/hooks/use-toast";

interface IdeaVaultWizardProps {
  onSaveIdea: (idea: IdeaData) => void;
  onClose: () => void;
}

export const IdeaVaultWizard = ({ onSaveIdea, onClose }: IdeaVaultWizardProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isScoring, setIsScoring] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as "saas" | "coaching" | "content" | "physical" | "service" | "",
    targetAudience: "",
    problemItSolves: ""
  });

  const [scores, setScores] = useState<any>(null);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleScoreIdea = async () => {
    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a category before scoring your idea.",
        variant: "destructive"
      });
      return;
    }

    setIsScoring(true);
    try {
      const result = await scoreIdea({
        ...formData,
        category: formData.category as "saas" | "coaching" | "content" | "physical" | "service"
      });
      setScores(result);
      setCurrentStep(4);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to score idea. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScoring(false);
    }
  };

  const handleSaveIdea = () => {
    if (!scores || !formData.category) return;

    const newIdea: IdeaData = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category as "saas" | "coaching" | "content" | "physical" | "service",
      targetAudience: formData.targetAudience,
      problemItSolves: formData.problemItSolves,
      pmfScore: scores.pmfScore,
      portfolioFitScore: scores.portfolioFitScore,
      launchSpeedScore: scores.launchSpeedScore,
      energyLevel: scores.energyLevel,
      aiPriorityScore: scores.aiPriorityScore,
      status: "idea",
      nextStep: scores.nextStep,
      createdAt: new Date()
    };

    onSaveIdea(newIdea);
    toast({
      title: "Idea Saved!",
      description: "Your idea has been added to the vault"
    });
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">What's your idea?</Label>
        <Input
          id="title"
          placeholder="e.g., Surfboard Rental SaaS"
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="description">Describe it briefly</Label>
        <Textarea
          id="description"
          placeholder="What does it do? How does it work?"
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="audience">Who is it for?</Label>
        <Input
          id="audience"
          placeholder="e.g., Remote freelancers, Small business owners"
          value={formData.targetAudience}
          onChange={(e) => updateFormData("targetAudience", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="problem">What pain does it solve?</Label>
        <Textarea
          id="problem"
          placeholder="What specific problem or frustration does this address?"
          value={formData.problemItSolves}
          onChange={(e) => updateFormData("problemItSolves", e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">How would you categorize it?</Label>
        <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="saas">SaaS/Web App</SelectItem>
            <SelectItem value="coaching">Coaching/Consulting</SelectItem>
            <SelectItem value="content">Content/Creator</SelectItem>
            <SelectItem value="physical">Physical Product</SelectItem>
            <SelectItem value="service">Service Business</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="text-center">
        <Button 
          onClick={handleScoreIdea} 
          disabled={isScoring || !formData.category}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isScoring ? "Scoring..." : "Score My Idea"}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">AI Idea Analysis</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {scores?.aiPriorityScore}/10
        </div>
        <p className="text-gray-600">Priority Score</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-lg font-semibold">{scores?.pmfScore}/10</div>
          <div className="text-sm text-gray-600">PMF Potential</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-lg font-semibold">{scores?.portfolioFitScore}/10</div>
          <div className="text-sm text-gray-600">Portfolio Fit</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-lg font-semibold">{scores?.launchSpeedScore}/10</div>
          <div className="text-sm text-gray-600">Launch Speed</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-lg font-semibold capitalize">{scores?.energyLevel}</div>
          <div className="text-sm text-gray-600">Energy Level</div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Next Step:</h4>
        <p className="text-sm">{scores?.nextStep}</p>
      </div>

      <Button onClick={handleSaveIdea} className="w-full">
        Save to Idea Vault
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Idea Vault - Step {currentStep} of 4</span>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {currentStep < 3 && (
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!formData.title || !formData.description)) ||
                (currentStep === 2 && (!formData.targetAudience || !formData.problemItSolves))
              }
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
