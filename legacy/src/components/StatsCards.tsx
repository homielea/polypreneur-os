
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Rocket } from "lucide-react";
import { Project } from "@/types";

interface StatsCardsProps {
  projects: Project[];
}

export const StatsCards = ({ projects }: StatsCardsProps) => {
  const totalProjects = projects.length;
  const launchedProjects = projects.filter(p => p.status === "launched").length;
  const averageProgress = projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
          <p className="text-xs text-muted-foreground">Active in pipeline</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Launched</CardTitle>
          <Rocket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{launchedProjects}</div>
          <p className="text-xs text-muted-foreground">Products in market</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
          <div className="h-4 w-4 rounded-full bg-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(averageProgress)}%</div>
          <Progress value={averageProgress} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};
