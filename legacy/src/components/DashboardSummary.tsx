
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Project, IdeaData } from "@/types";
import { Lightbulb, Rocket, Target, TrendingUp, Clock, Zap } from "lucide-react";

interface DashboardSummaryProps {
  projects: Project[];
  ideas: IdeaData[];
  onQuickAction?: (action: string) => void;
}

export const DashboardSummary = ({ projects, ideas }: DashboardSummaryProps) => {
  const totalProjects = projects.length;
  const launchedProjects = projects.filter(p => p.status === "launched").length;
  const inProgressProjects = projects.filter(p => p.status === "in-progress").length;
  const averageProgress = projects.length > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects : 0;
  
  const totalIdeas = ideas.length;
  const highPriorityIdeas = ideas.filter(idea => idea.aiPriorityScore >= 8).length;
  const validatedIdeas = ideas.filter(idea => idea.status === "validated").length;
  const averageIdeaScore = ideas.length > 0 ? ideas.reduce((sum, idea) => sum + idea.aiPriorityScore, 0) / totalIdeas : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Ideas</p>
                <p className="text-2xl font-bold text-blue-800">{totalIdeas}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-green-800">{totalProjects}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Launched</p>
                <p className="text-2xl font-bold text-purple-800">{launchedProjects}</p>
              </div>
              <Rocket className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">High Priority</p>
                <p className="text-2xl font-bold text-orange-800">{highPriorityIdeas}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Project Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Progress</span>
              <span className="text-sm font-semibold">{Math.round(averageProgress)}%</span>
            </div>
            <Progress value={averageProgress} className="h-2" />
            
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {inProgressProjects} In Progress
              </Badge>
              <Badge variant="outline" className="text-xs">
                {projects.filter(p => p.status === "ideation").length} Ideation
              </Badge>
              <Badge variant="default" className="text-xs">
                {projects.filter(p => p.status === "ready-to-launch").length} Ready to Launch
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Idea Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Score</span>
              <span className="text-sm font-semibold">{averageIdeaScore.toFixed(1)}/10</span>
            </div>
            <Progress value={averageIdeaScore * 10} className="h-2" />
            
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {validatedIdeas} Validated
              </Badge>
              <Badge variant="outline" className="text-xs">
                {ideas.filter(i => i.status === "idea").length} New Ideas
              </Badge>
              <Badge variant="destructive" className="text-xs">
                {ideas.filter(i => i.status === "killed").length} Killed
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inProgressProjects > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Continue active projects</p>
                  <p className="text-sm text-blue-600">{inProgressProjects} projects need attention</p>
                </div>
              </div>
            )}
            
            {highPriorityIdeas > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">High-priority ideas ready</p>
                  <p className="text-sm text-green-600">{highPriorityIdeas} ideas scored 8+ points</p>
                </div>
              </div>
            )}
            
            {projects.filter(p => p.status === "ready-to-launch").length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Rocket className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">Ready to launch</p>
                  <p className="text-sm text-purple-600">{projects.filter(p => p.status === "ready-to-launch").length} projects ready for market</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
