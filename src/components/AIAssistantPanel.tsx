import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Clock
} from "lucide-react";
import { AIAssistant, SmartSuggestions, UserContext } from "@/utils/aiAssistant";
import { Project, IdeaData } from "@/types";

interface AIAssistantPanelProps {
  projects: Project[];
  ideas: IdeaData[];
  userContext: UserContext;
  className?: string;
}

export const AIAssistantPanel = ({ 
  projects, 
  ideas, 
  userContext, 
  className = "" 
}: AIAssistantPanelProps) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestions | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const generateSuggestions = () => {
      const newSuggestions = AIAssistant.generateDailyRecommendations(
        projects,
        ideas,
        userContext
      );
      setSuggestions(newSuggestions);
      setLastUpdate(new Date());
    };

    generateSuggestions();
    
    // Refresh suggestions every 30 minutes
    const interval = setInterval(generateSuggestions, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [projects, ideas, userContext]);

  if (!suggestions) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case "focus": return Target;
      case "project": return TrendingUp;
      case "idea": return Lightbulb;
      case "tip": return Brain;
      default: return Sparkles;
    }
  };

  return (
    <Card className={`border-l-4 border-l-primary ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            AI Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Primary Focus */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Primary Focus</h4>
            </div>
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h5 className="font-medium text-sm">{suggestions.primaryFocus.title}</h5>
                <Badge variant={getPriorityColor(suggestions.primaryFocus.priority)} className="text-xs">
                  {suggestions.primaryFocus.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {suggestions.primaryFocus.description}
              </p>
              {suggestions.primaryFocus.suggestedAction && (
                <div className="text-xs bg-background/50 p-2 rounded border">
                  <strong>Action:</strong> {suggestions.primaryFocus.suggestedAction}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Secondary Actions */}
          {suggestions.secondaryActions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Quick Wins</h4>
              </div>
              <div className="space-y-2">
                {suggestions.secondaryActions.map((action, index) => {
                  const Icon = getPriorityIcon(action.type);
                  return (
                    <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                      <Icon className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium truncate">{action.title}</span>
                          <Badge variant={getPriorityColor(action.priority)} className="text-xs">
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insights */}
          {suggestions.insights.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h4 className="font-semibold text-sm">Insights</h4>
                </div>
                <div className="space-y-2">
                  {suggestions.insights.map((insight, index) => (
                    <div key={index} className="text-xs p-2 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                      <div className="font-medium mb-1">{insight.title}</div>
                      <div className="text-muted-foreground">{insight.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tips */}
          {suggestions.tips.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-semibold text-sm">Tips</h4>
                </div>
                <div className="space-y-2">
                  {suggestions.tips.map((tip, index) => (
                    <div key={index} className="text-xs p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <div className="font-medium mb-1">{tip.title}</div>
                      <div className="text-muted-foreground">{tip.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Context Info */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Mood:</span>
                <Badge variant="outline" className="text-xs">
                  {userContext.mood}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span>Energy:</span>
                <Badge variant="outline" className="text-xs">
                  {userContext.energy}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};