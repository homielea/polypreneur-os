
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Sparkles, Target, User, Heart, Zap } from "lucide-react";

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
  mission?: string;
  vision?: string;
  antiVision?: string;
  alignmentScores?: {
    clarity: number;
    energy: number;
    confidence: number;
  };
}

export const OnboardingWizard = ({ onComplete, onSkip }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    role: "",
    goals: [],
    experience: "beginner",
    interests: [],
    mission: "",
    vision: "",
    antiVision: "",
    alignmentScores: {
      clarity: 5,
      energy: 5,
      confidence: 5
    }
  });

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

  const updateAlignmentScore = (key: keyof typeof profile.alignmentScores, value: number[]) => {
    setProfile(prev => ({
      ...prev,
      alignmentScores: {
        ...prev.alignmentScores!,
        [key]: value[0]
      }
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
        <Heart className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-xl font-semibold">Your Foundation</h3>
        <p className="text-gray-600">Define your mission and vision to stay aligned</p>
      </div>

      <div>
        <Label htmlFor="mission">Mission: What drives you? (Optional)</Label>
        <Textarea
          id="mission"
          placeholder="e.g., Help creators build sustainable businesses through technology..."
          value={profile.mission}
          onChange={(e) => setProfile(prev => ({ ...prev, mission: e.target.value }))}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="vision">Vision: Where are you heading? (Optional)</Label>
        <Textarea
          id="vision"
          placeholder="e.g., A world where anyone can turn their skills into thriving digital products..."
          value={profile.vision}
          onChange={(e) => setProfile(prev => ({ ...prev, vision: e.target.value }))}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="antiVision">Anti-Vision: What do you want to avoid? (Optional)</Label>
        <Textarea
          id="antiVision"
          placeholder="e.g., Building products that don't solve real problems or creating burnout culture..."
          value={profile.antiVision}
          onChange={(e) => setProfile(prev => ({ ...prev, antiVision: e.target.value }))}
          className="mt-2"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Zap className="w-12 h-12 mx-auto mb-4 text-purple-500" />
        <h3 className="text-xl font-semibold">Final Details</h3>
        <p className="text-gray-600">Set your preferences and alignment scores</p>
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

      <div className="space-y-4">
        <Label className="text-base font-medium">Self-Assessment (1-10)</Label>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">Vision Clarity</Label>
            <span className="text-sm font-medium">{profile.alignmentScores?.clarity}/10</span>
          </div>
          <Slider
            value={[profile.alignmentScores?.clarity || 5]}
            onValueChange={(value) => updateAlignmentScore('clarity', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">Energy Level</Label>
            <span className="text-sm font-medium">{profile.alignmentScores?.energy}/10</span>
          </div>
          <Slider
            value={[profile.alignmentScores?.energy || 5]}
            onValueChange={(value) => updateAlignmentScore('energy', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">Confidence</Label>
            <span className="text-sm font-medium">{profile.alignmentScores?.confidence}/10</span>
          </div>
          <Slider
            value={[profile.alignmentScores?.confidence || 5]}
            onValueChange={(value) => updateAlignmentScore('confidence', value)}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Setup - Step {currentStep} of 4</span>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep < 4 ? (
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
