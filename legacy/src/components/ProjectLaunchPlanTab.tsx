
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project } from "@/types";
import { Rocket, Plus } from "lucide-react";

interface ProjectLaunchPlanTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export const ProjectLaunchPlanTab = ({ project, onUpdate }: ProjectLaunchPlanTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Launch Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Rocket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Launch Planning Tools Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              Plan your launch strategy, marketing channels, and success metrics
            </p>
            <Button variant="outline" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Create Launch Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
