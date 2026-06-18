
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Moon, CheckCircle, Target, Clock, TrendingUp } from "lucide-react";

interface EveningReflectionProps {
  onComplete: (reflection: EveningReflectionData) => void;
  dailyFocus?: string;
}

interface EveningReflectionData {
  date: string;
  tasksCompleted: number;
  focusAchieved: number; // 1-10 scale
  energyUsed: number; // 1-10 scale
  accomplishments: string;
  challenges: string;
  tomorrowPriority: string;
  satisfactionLevel: number; // 1-10 scale
  completed: boolean;
}

export const EveningReflection = ({ onComplete, dailyFocus }: EveningReflectionProps) => {
  const { toast } = useToast();
  const [reflection, setReflection] = useState<EveningReflectionData>({
    date: new Date().toISOString().split('T')[0],
    tasksCompleted: 0,
    focusAchieved: 5,
    energyUsed: 5,
    accomplishments: "",
    challenges: "",
    tomorrowPriority: "",
    satisfactionLevel: 7,
    completed: false
  });

  const handleComplete = () => {
    if (!reflection.accomplishments.trim()) {
      toast({
        title: "Accomplishments Required",
        description: "Please note what you accomplished today.",
        variant: "destructive"
      });
      return;
    }

    const completedReflection = { ...reflection, completed: true };
    onComplete(completedReflection);
    
    toast({
      title: "Evening Reflection Complete!",
      description: "Great job reflecting on your day. See you tomorrow!",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Evening Reflection
        </CardTitle>
        <p className="text-sm text-gray-600">How did your day go?</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {dailyFocus && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Today's Focus</span>
            </div>
            <p className="text-sm text-blue-700">{dailyFocus}</p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Tasks completed today
          </label>
          <div className="flex items-center gap-3">
            <Slider
              value={[reflection.tasksCompleted]}
              onValueChange={(value) => setReflection(prev => ({ ...prev, tasksCompleted: value[0] }))}
              max={20}
              min={0}
              step={1}
              className="flex-1"
            />
            <Badge variant="outline">{reflection.tasksCompleted}</Badge>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">How well did you stick to your focus? (1-10)</label>
          <div className="flex items-center gap-3">
            <Slider
              value={[reflection.focusAchieved]}
              onValueChange={(value) => setReflection(prev => ({ ...prev, focusAchieved: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="flex-1"
            />
            <Badge variant="outline">{reflection.focusAchieved}/10</Badge>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Energy level used (1-10)</label>
          <div className="flex items-center gap-3">
            <Slider
              value={[reflection.energyUsed]}
              onValueChange={(value) => setReflection(prev => ({ ...prev, energyUsed: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="flex-1"
            />
            <Badge variant="outline">{reflection.energyUsed}/10</Badge>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">What did you accomplish?</label>
          <Textarea
            placeholder="List your key accomplishments, completed tasks, progress made..."
            value={reflection.accomplishments}
            onChange={(e) => setReflection(prev => ({ ...prev, accomplishments: e.target.value }))}
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Any challenges or learnings?</label>
          <Textarea
            placeholder="What got in the way? What did you learn? What would you do differently?"
            value={reflection.challenges}
            onChange={(e) => setReflection(prev => ({ ...prev, challenges: e.target.value }))}
            rows={2}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Top priority for tomorrow?</label>
          <Textarea
            placeholder="What's the most important thing to focus on tomorrow?"
            value={reflection.tomorrowPriority}
            onChange={(e) => setReflection(prev => ({ ...prev, tomorrowPriority: e.target.value }))}
            rows={2}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Overall satisfaction (1-10)</label>
          <div className="flex items-center gap-3">
            <Slider
              value={[reflection.satisfactionLevel]}
              onValueChange={(value) => setReflection(prev => ({ ...prev, satisfactionLevel: value[0] }))}
              max={10}
              min={1}
              step={1}
              className="flex-1"
            />
            <Badge variant="outline">{reflection.satisfactionLevel}/10</Badge>
          </div>
        </div>

        <Button onClick={handleComplete} className="w-full">
          <Moon className="w-4 h-4 mr-2" />
          Complete Evening Reflection
        </Button>
      </CardContent>
    </Card>
  );
};
