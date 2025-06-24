
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, TrendingUp, Clock, Zap, ArrowRight } from "lucide-react";
import { IdeaData } from "@/types";

interface IdeaVaultGridProps {
  ideas: IdeaData[];
  onConvertToProject: (idea: IdeaData) => void;
  onUpdateIdea: (idea: IdeaData) => void;
}

export const IdeaVaultGrid = ({ ideas, onConvertToProject, onUpdateIdea }: IdeaVaultGridProps) => {
  const [sortBy, setSortBy] = useState("priority");
  const [filterBy, setFilterBy] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idea": return "bg-gray-100 text-gray-800";
      case "validated": return "bg-green-100 text-green-800";
      case "killed": return "bg-red-100 text-red-800";
      case "converted": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case "high": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const filteredAndSortedIdeas = ideas
    .filter(idea => filterBy === "all" || idea.status === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return b.aiPriorityScore - a.aiPriorityScore;
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "pmf":
          return b.pmfScore - a.pmfScore;
        default:
          return 0;
      }
    });

  if (ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold mb-2">No ideas yet</h3>
        <p className="text-gray-600">Start capturing your ideas to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Sort by Priority Score</SelectItem>
              <SelectItem value="recent">Sort by Most Recent</SelectItem>
              <SelectItem value="pmf">Sort by PMF Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ideas</SelectItem>
              <SelectItem value="idea">Ideas</SelectItem>
              <SelectItem value="validated">Validated</SelectItem>
              <SelectItem value="killed">Killed</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAndSortedIdeas.map((idea) => (
          <Card key={idea.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{idea.title}</CardTitle>
                <Badge className={getStatusColor(idea.status)}>
                  {idea.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{idea.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Priority Score */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {idea.aiPriorityScore}/10
                </div>
                <div className="text-xs text-gray-500">Priority Score</div>
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-600" />
                  <div className="text-sm font-semibold">{idea.pmfScore}</div>
                  <div className="text-xs text-gray-500">PMF</div>
                </div>
                <div>
                  <div className="w-4 h-4 mx-auto mb-1 bg-blue-600 rounded-full"></div>
                  <div className="text-sm font-semibold">{idea.portfolioFitScore}</div>
                  <div className="text-xs text-gray-500">Fit</div>
                </div>
                <div>
                  <Clock className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                  <div className="text-sm font-semibold">{idea.launchSpeedScore}</div>
                  <div className="text-xs text-gray-500">Speed</div>
                </div>
                <div>
                  <Zap className={`w-4 h-4 mx-auto mb-1 ${getEnergyColor(idea.energyLevel)}`} />
                  <div className="text-sm font-semibold capitalize">{idea.energyLevel}</div>
                  <div className="text-xs text-gray-500">Energy</div>
                </div>
              </div>

              {/* Next Step */}
              <div className="bg-gray-50 p-3 rounded text-sm">
                <strong>Next:</strong> {idea.nextStep}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onUpdateIdea({ ...idea, status: "validated" })}
                  disabled={idea.status !== "idea"}
                >
                  Validate
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onConvertToProject(idea)}
                  disabled={idea.status === "converted"}
                  className="flex-1"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Convert to Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
