
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project } from "@/types";
import { CheckSquare, Plus } from "lucide-react";

interface ProjectValidationTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export const ProjectValidationTab = ({ project, onUpdate }: ProjectValidationTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Validation & Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Validation Tools Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              Track assumptions, run experiments, and collect customer feedback
            </p>
            <Button variant="outline" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Add Validation Experiment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
