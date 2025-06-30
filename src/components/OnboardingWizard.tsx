
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Sparkles, Target, User } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

interface UserProfile {
  name: string;
  role: string;
  goals: string[];
  experience: "beginner" | "intermediate" | "advanced";
  interests: string[];
}

export const OnboardingWizard = ({ onComplete, onSkip }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    role: "",
    goals: [],
    experience: "beginner",
    interests: []
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(profile);
  };

  const toggleGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <User className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <h3 className="text-xl font-semibold">Welcome to Polypreneur OS!</h3>
        <p className="text-gray-600">Let's get to know you better</p>
      </div>
      
      <div>
        <Label htmlFor="name">What's your name?</Label>
        <Input
          id="name"
          placeholder="Your name"
          value={profile.name}
          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>
      
      <div>
        <Label htmlFor="role">What do you do?</Label>
        <Input
          id="role"
          placeholder="e.g., Solo founder, Designer, Developer, Creator..."
          value={profile.role}
          onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold">What are your goals?</h3>
        <p className="text-gray-600">Select all that apply</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[
          "Launch my first digital product",
          "Scale my existing business",
          "Build a portfolio of products",
          "Validate more ideas faster",
          "Improve my productivity",
          "Learn new skills",
          "Generate passive income",
          "Build an audience"
        ].map((goal) => (
          <Button
            key={goal}
            variant={profile.goals.includes(goal) ? "default" : "outline"}
            onClick={() => toggleGoal(goal)}
            className="justify-start h-auto p-4 text-left"
          >
            {goal}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
        <h3 className="text-xl font-semibold">Almost done!</h3>
        <p className="text-gray-600">A few more details to personalize your experience</p>
      </div>

      <div>
        <Label className="text-base font-medium">Experience Level</Label>
        <div className="flex gap-2 mt-2">
          {[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" }
          ].map(({ value, label }) => (
            <Button
              key={value}
              variant={profile.experience === value ? "default" : "outline"}
              onClick={() => setProfile(prev => ({ ...prev, experience: value as any }))}
              className="flex-1"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Interests</Label>
        <p className="text-sm text-gray-600 mb-3">What types of products interest you?</p>
        <div className="flex flex-wrap gap-2">
          {[
            "SaaS", "Mobile Apps", "E-commerce", "Content", "Coaching", 
            "Physical Products", "Services", "AI/ML", "Web3", "Design"
          ].map((interest) => (
            <Badge
              key={interest}
              variant={profile.interests.includes(interest) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Setup - Step {currentStep} of 3</span>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={currentStep === 1 && !profile.name.trim()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
