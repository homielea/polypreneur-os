
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Heart, Target, Shield, Edit, Sparkles } from "lucide-react";

interface UserProfile {
  name: string;
  role: string;
  goals: string[];
  experience: "beginner" | "intermediate" | "advanced";
  interests: string[];
  mission?: string;
  vision?: string;
  antiVision?: string;
  alignmentScores?: {
    clarity: number;
    energy: number;
    confidence: number;
  };
}

interface FounderProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const FounderProfile = ({ profile, onUpdateProfile }: FounderProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    onUpdateProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const updateAlignmentScore = (key: keyof typeof profile.alignmentScores, value: number[]) => {
    setTempProfile(prev => ({
      ...prev,
      alignmentScores: {
        ...prev.alignmentScores!,
        [key]: value[0]
      }
    }));
  };

  const avgAlignment = profile.alignmentScores 
    ? Math.round((profile.alignmentScores.clarity + profile.alignmentScores.energy + profile.alignmentScores.confidence) / 3)
    : 5;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Founder Profile
        </CardTitle>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Founder Profile</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mission">Mission</Label>
                  <Textarea
                    id="mission"
                    placeholder="What drives you?"
                    value={tempProfile.mission || ""}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, mission: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="vision">Vision</Label>
                  <Textarea
                    id="vision"
                    placeholder="Where are you heading?"
                    value={tempProfile.vision || ""}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, vision: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="antiVision">Anti-Vision</Label>
                <Textarea
                  id="antiVision"
                  placeholder="What do you want to avoid?"
                  value={tempProfile.antiVision || ""}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, antiVision: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Alignment Scores (1-10)</Label>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">Vision Clarity</Label>
                    <span className="text-sm font-medium">{tempProfile.alignmentScores?.clarity}/10</span>
                  </div>
                  <Slider
                    value={[tempProfile.alignmentScores?.clarity || 5]}
                    onValueChange={(value) => updateAlignmentScore('clarity', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">Energy Level</Label>
                    <span className="text-sm font-medium">{tempProfile.alignmentScores?.energy}/10</span>
                  </div>
                  <Slider
                    value={[tempProfile.alignmentScores?.energy || 5]}
                    onValueChange={(value) => updateAlignmentScore('energy', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm">Confidence</Label>
                    <span className="text-sm font-medium">{tempProfile.alignmentScores?.confidence}/10</span>
                  </div>
                  <Slider
                    value={[tempProfile.alignmentScores?.confidence || 5]}
                    onValueChange={(value) => updateAlignmentScore('confidence', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            <p className="text-gray-600">{profile.role}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{avgAlignment}/10</div>
            <div className="text-xs text-gray-500">Alignment</div>
          </div>
        </div>

        {profile.mission && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-medium">Mission</span>
            </div>
            <p className="text-sm text-gray-700 pl-6">{profile.mission}</p>
          </div>
        )}

        {profile.vision && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="font-medium">Vision</span>
            </div>
            <p className="text-sm text-gray-700 pl-6">{profile.vision}</p>
          </div>
        )}

        {profile.antiVision && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              <span className="font-medium">Anti-Vision</span>
            </div>
            <p className="text-sm text-gray-700 pl-6">{profile.antiVision}</p>
          </div>
        )}

        {profile.alignmentScores && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Vision Clarity</span>
              <span>{profile.alignmentScores.clarity}/10</span>
            </div>
            <Progress value={profile.alignmentScores.clarity * 10} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span>Energy Level</span>
              <span>{profile.alignmentScores.energy}/10</span>
            </div>
            <Progress value={profile.alignmentScores.energy * 10} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span>Confidence</span>
              <span>{profile.alignmentScores.confidence}/10</span>
            </div>
            <Progress value={profile.alignmentScores.confidence * 10} className="h-2" />
          </div>
        )}

        <div className="space-y-2">
          <span className="font-medium text-sm">Focus Areas</span>
          <div className="flex flex-wrap gap-1">
            {profile.goals.slice(0, 3).map((goal) => (
              <Badge key={goal} variant="secondary" className="text-xs">
                {goal}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
