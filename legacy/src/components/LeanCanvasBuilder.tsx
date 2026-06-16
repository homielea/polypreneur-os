
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface LeanCanvasBuilderProps {
  initialData?: any;
  onSave?: (data: any) => void;
  onClose: () => void;
}

export const LeanCanvasBuilder = ({ onClose }: LeanCanvasBuilderProps) => {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Lean Canvas Builder</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lean Canvas - Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Interactive 9-block lean canvas builder will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
