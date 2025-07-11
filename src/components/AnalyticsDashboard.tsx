
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent 
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter
} from "recharts";
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Calendar,
  Activity,
  Zap,
  Award,
  BarChart3
} from "lucide-react";

interface DailyCheckInData {
  date: string;
  mood: "high" | "medium" | "low";
  energy: "high" | "medium" | "low";
  focus: string;
  reflection: string;
  completed: boolean;
}

interface EveningReflectionData {
  date: string;
  tasksCompleted: number;
  focusAchieved: number;
  energyUsed: number;
  accomplishments: string;
  challenges: string;
  tomorrowPriority: string;
  satisfactionLevel: number;
  completed: boolean;
}

interface AnalyticsDashboardProps {
  checkIns: DailyCheckInData[];
  reflections: EveningReflectionData[];
}

const chartConfig = {
  mood: {
    label: "Mood Score",
    color: "hsl(var(--primary))",
  },
  energy: {
    label: "Energy Score", 
    color: "hsl(var(--secondary))",
  },
  satisfaction: {
    label: "Satisfaction",
    color: "hsl(var(--accent))",
  },
  focus: {
    label: "Focus Achievement",
    color: "hsl(var(--muted-foreground))",
  }
};

export const AnalyticsDashboard = ({ checkIns, reflections }: AnalyticsDashboardProps) => {
  const analyticsData = useMemo(() => {
    const combinedData = checkIns.map(checkIn => {
      const reflection = reflections.find(r => r.date === checkIn.date);
      
      const moodScore = checkIn.mood === "high" ? 8 : checkIn.mood === "medium" ? 5 : 2;
      const energyScore = checkIn.energy === "high" ? 8 : checkIn.energy === "medium" ? 5 : 2;
      
      return {
        date: new Date(checkIn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        moodScore,
        energyScore,
        tasksCompleted: reflection?.tasksCompleted || 0,
        focusAchieved: reflection?.focusAchieved || 5,
        satisfactionLevel: reflection?.satisfactionLevel || 5,
        energyUsed: reflection?.energyUsed || 5
      };
    });

    return combinedData.slice(-14); // Last 14 days
  }, [checkIns, reflections]);

  const correlationData = useMemo(() => {
    return analyticsData.map(day => ({
      mood: day.moodScore,
      productivity: (day.tasksCompleted * 0.4) + (day.focusAchieved * 0.6),
      satisfaction: day.satisfactionLevel,
      energy: day.energyScore
    }));
  }, [analyticsData]);

  const averageStats = useMemo(() => {
    if (analyticsData.length === 0) return null;
    
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    return {
      avgMood: avg(analyticsData.map(d => d.moodScore)),
      avgEnergy: avg(analyticsData.map(d => d.energyScore)),
      avgSatisfaction: avg(analyticsData.map(d => d.satisfactionLevel)),
      avgTasks: avg(analyticsData.map(d => d.tasksCompleted)),
      avgFocus: avg(analyticsData.map(d => d.focusAchieved)),
      bestDay: analyticsData.reduce((best, current) => 
        current.satisfactionLevel > best.satisfactionLevel ? current : best, analyticsData[0])
    };
  }, [analyticsData]);

  if (!averageStats || analyticsData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Yet</h3>
              <p className="text-muted-foreground">
                Complete a few daily check-ins and evening reflections to see your productivity patterns.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Avg Mood</p>
                <p className="text-2xl font-bold text-blue-800">{averageStats.avgMood.toFixed(1)}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Avg Tasks</p>
                <p className="text-2xl font-bold text-green-800">{averageStats.avgTasks.toFixed(1)}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Focus</p>
                <p className="text-2xl font-bold text-purple-800">{averageStats.avgFocus.toFixed(1)}/10</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Satisfaction</p>
                <p className="text-2xl font-bold text-orange-800">{averageStats.avgSatisfaction.toFixed(1)}/10</p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Daily Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="moodScore" 
                  stroke="var(--color-mood)" 
                  strokeWidth={2}
                  name="Mood Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="satisfactionLevel" 
                  stroke="var(--color-satisfaction)" 
                  strokeWidth={2}
                  name="Satisfaction"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Productivity vs Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mood" name="Mood Score" />
                <YAxis dataKey="productivity" name="Productivity" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Scatter 
                  dataKey="productivity" 
                  fill="var(--color-mood)"
                  name="Productivity Score"
                />
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Award className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">Best Day</p>
              <p className="text-sm text-green-600">
                {averageStats.bestDay.date} - {averageStats.bestDay.satisfactionLevel}/10 satisfaction, 
                {averageStats.bestDay.tasksCompleted} tasks completed
              </p>
            </div>
          </div>

          {averageStats.avgMood > 6 && averageStats.avgTasks > 3 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Strong Performance</p>
                <p className="text-sm text-blue-600">
                  You're maintaining good mood and productivity levels. Keep it up!
                </p>
              </div>
            </div>
          )}

          {averageStats.avgFocus < 5 && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Target className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-800">Focus Opportunity</p>
                <p className="text-sm text-orange-600">
                  Your focus achievement is below average. Consider time-blocking or removing distractions.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
