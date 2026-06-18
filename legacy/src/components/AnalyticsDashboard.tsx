
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, TrendingDown, Brain, Zap, Target } from "lucide-react";
import { MoodProductivityAnalyzer } from "@/utils/moodProductivityAnalyzer";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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

export const AnalyticsDashboard = ({ checkIns, reflections }: AnalyticsDashboardProps) => {
  const analytics = useMemo(() => {
    if (checkIns.length === 0 && reflections.length === 0) {
      return null;
    }
    
    return MoodProductivityAnalyzer.analyzePatterns(checkIns, reflections);
  }, [checkIns, reflections]);

  const chartData = useMemo(() => {
    return reflections.map((reflection, index) => ({
      date: new Date(reflection.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      satisfaction: reflection.satisfactionLevel,
      tasksCompleted: reflection.tasksCompleted,
      focusAchieved: reflection.focusAchieved,
      mood: checkIns[index]?.mood === "high" ? 3 : checkIns[index]?.mood === "medium" ? 2 : 1,
      energy: checkIns[index]?.energy === "high" ? 3 : checkIns[index]?.energy === "medium" ? 2 : 1
    })).slice(-7); // Last 7 days
  }, [checkIns, reflections]);

  const moodDistribution = useMemo(() => {
    const distribution = checkIns.reduce((acc, checkIn) => {
      acc[checkIn.mood] = (acc[checkIn.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'High', value: distribution.high || 0, color: '#22c55e' },
      { name: 'Medium', value: distribution.medium || 0, color: '#f59e0b' },
      { name: 'Low', value: distribution.low || 0, color: '#ef4444' }
    ];
  }, [checkIns]);

  if (!analytics && chartData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Complete a few daily check-ins and evening reflections to see your productivity patterns and insights.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Mood Day</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{analytics.bestMoodDay}</div>
              <Badge variant="secondary" className="mt-1">
                {analytics.averageMoodScore.toFixed(1)}/3 avg mood
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Energy</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{analytics.highEnergyDays}</div>
              <Badge variant="secondary" className="mt-1">
                Days this week
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageProductivity.toFixed(1)}/10</div>
              <Badge 
                variant={analytics.averageProductivity >= 7 ? "default" : "secondary"}
                className="mt-1"
              >
                {analytics.averageProductivity >= 7 ? "Great!" : "Room to grow"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Productivity Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="satisfaction" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Satisfaction"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tasksCompleted" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Tasks Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mood Distribution */}
        {moodDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moodDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    >
                      {moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Patterns */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Productivity Pattern</p>
                  <p className="text-sm text-muted-foreground">
                    Your {analytics.bestMoodDay}s tend to be your most productive days. 
                    Consider scheduling important tasks on these days.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">Energy Optimization</p>
                  <p className="text-sm text-muted-foreground">
                    You've had {analytics.highEnergyDays} high-energy days recently. 
                    Try to tackle complex projects during these periods.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
