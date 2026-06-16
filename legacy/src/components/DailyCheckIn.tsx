
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, Target, Lightbulb } from "lucide-react";

interface DailyCheckInProps {
  onComplete: (checkIn: DailyCheckInData) => void;
}

interface DailyCheckInData {
  date: string;
  mood: "high" | "medium" | "low";
  energy: "high" | "medium" | "low"; 
  focus: string;
  reflection: string;
  completed: boolean;
}

export const DailyCheckIn = ({ onComplete }: DailyCheckInProps) => {
  const { toast } = useToast();
  const [checkIn, setCheckIn] = useState<DailyCheckInData>({
    date: new Date().toISOString().split('T')[0],
    mood: "medium",
    energy: "medium",
    focus: "",
    reflection: "",
    completed: false
  });

  const handleComplete = () => {
    if (!checkIn.focus.trim()) {
      toast({
        title: "Focus Required",
        description: "Please set your main focus for today.",
        variant: "destructive"
      });
      return;
    }

    const completedCheckIn = { ...checkIn, completed: true };
    onComplete(completedCheckIn);
    
    toast({
      title: "Daily Check-in Complete!",
      description: "Your ritual is logged. Stay focused on your goal.",
    });
  };

  const MoodButton = ({ mood, label }: { mood: "high" | "medium" | "low"; label: string }) => (
    <Button
      variant={checkIn.mood === mood ? "default" : "outline"}
      size="sm"
      onClick={() => setCheckIn(prev => ({ ...prev, mood }))}
      className="flex-1"
    >
      {label}
    </Button>
  );

  const EnergyButton = ({ energy, label }: { energy: "high" | "medium" | "low"; label: string }) => (
    <Button
      variant={checkIn.energy === energy ? "default" : "outline"}
      size="sm"
      onClick={() => setCheckIn(prev => ({ ...prev, energy }))}
      className="flex-1"
    >
      {label}
    </Button>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Daily Check-in
        </CardTitle>
        <p className="text-sm text-gray-600">Start your day with intention</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">How's your mood?</label>
          <div className="flex gap-2">
            <MoodButton mood="high" label="🚀 Great" />
            <MoodButton mood="medium" label="😊 Good" />
            <MoodButton mood="low" label="😐 Meh" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Energy level?</label>
          <div className="flex gap-2">
            <EnergyButton energy="high" label="⚡ High" />
            <EnergyButton energy="medium" label="🔋 Medium" />
            <EnergyButton energy="low" label="🪫 Low" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Target className="w-4 h-4" />
            What's your main focus today?
          </label>
          <Textarea
            placeholder="e.g., Complete user research for SaaS idea, Write 3 blog posts, Fix bugs in web app..."
            value={checkIn.focus}
            onChange={(e) => setCheckIn(prev => ({ ...prev, focus: e.target.value }))}
            rows={2}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Any insights or thoughts?
          </label>
          <Textarea
            placeholder="Optional: What's on your mind? Any new ideas or reflections?"
            value={checkIn.reflection}
            onChange={(e) => setCheckIn(prev => ({ ...prev, reflection: e.target.value }))}
            rows={2}
          />
        </div>

        <Button onClick={handleComplete} className="w-full">
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete Check-in
        </Button>
      </CardContent>
    </Card>
  );
};
