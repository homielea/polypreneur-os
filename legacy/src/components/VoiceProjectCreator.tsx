
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Mic, MicOff, Wand2, Edit3 } from "lucide-react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { parseVoiceInput, ParsedProject } from "@/utils/projectParser";
import { Project } from "@/types";
import { PHASES } from "@/constants/phases";

interface VoiceProjectCreatorProps {
  onCreateProject: (project: Project) => void;
}

export const VoiceProjectCreator = ({ onCreateProject }: VoiceProjectCreatorProps) => {
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useVoiceRecognition();
  const [parsedProject, setParsedProject] = useState<ParsedProject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProject, setEditableProject] = useState<ParsedProject | null>(null);

  const handleParseTranscript = () => {
    if (transcript.trim()) {
      const parsed = parseVoiceInput(transcript);
      setParsedProject(parsed);
      setEditableProject(parsed);
    }
  };

  const handleCreateProject = () => {
    if (!editableProject) return;

    const newProject: Project = {
      id: Date.now().toString(),
      title: editableProject.title,
      type: editableProject.type,
      status: editableProject.status,
      progress: editableProject.status === "in-progress" ? 15 : 0,
      phases: PHASES.map((phase, index) => ({
        id: `${index}`,
        name: phase.name,
        completed: false,
        tasks: editableProject.keyTasks.length > index ? [editableProject.keyTasks[index]] : [`Complete ${phase.name.toLowerCase()} tasks`],
        subtasks: phase.subtasks,
        description: phase.description,
        automationTrigger: phase.automationTrigger
      })),
      createdAt: new Date(),
      purpose: editableProject.purpose,
      keyTasks: editableProject.keyTasks,
      timeline: editableProject.timeline,
      tags: editableProject.tags,
      voiceNotes: transcript
    };

    onCreateProject(newProject);
    resetTranscript();
    setParsedProject(null);
    setEditableProject(null);
    setIsEditing(false);
  };

  const handleReset = () => {
    resetTranscript();
    setParsedProject(null);
    setEditableProject(null);
    setIsEditing(false);
  };

  if (!isSupported) {
    return (
      <Button variant="outline" disabled>
        🎤 Voice Create (Not Supported)
      </Button>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          🎤 Voice Create
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Create Project with Voice</DrawerTitle>
          <DrawerDescription>
            Speak naturally about your project idea and I'll help structure it
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-4 overflow-y-auto">
          {/* Voice Recording Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Record Your Idea</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isListening ? "Stop Recording" : "Start Recording"}
                </Button>
                
                {transcript && !isListening && (
                  <Button onClick={handleParseTranscript} className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Parse Project
                  </Button>
                )}
              </div>

              {isListening && (
                <div className="text-center py-4">
                  <div className="animate-pulse text-red-500 text-lg">🎤 Listening...</div>
                  <p className="text-sm text-gray-600 mt-2">Speak naturally about your project</p>
                </div>
              )}

              {transcript && (
                <div>
                  <Label>Transcript:</Label>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                    {transcript}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parsed Results Section */}
          {parsedProject && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Step 2: Review & Edit</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? "Preview" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing && editableProject ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Project Title</Label>
                      <Input
                        value={editableProject.title}
                        onChange={(e) => setEditableProject({...editableProject, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Purpose/Goal</Label>
                      <Textarea
                        value={editableProject.purpose}
                        onChange={(e) => setEditableProject({...editableProject, purpose: e.target.value})}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Key Tasks (one per line)</Label>
                      <Textarea
                        value={editableProject.keyTasks.join('\n')}
                        onChange={(e) => setEditableProject({...editableProject, keyTasks: e.target.value.split('\n').filter(t => t.trim())})}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Timeline (optional)</Label>
                      <Input
                        value={editableProject.timeline || ''}
                        onChange={(e) => setEditableProject({...editableProject, timeline: e.target.value})}
                        placeholder="e.g., 'in 2 weeks', 'by end of month'"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">🧩 {editableProject?.title}</h4>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">📍 Purpose:</h4>
                      <p className="text-sm text-gray-600">{editableProject?.purpose}</p>
                    </div>

                    <div>
                      <h4 className="font-medium">🛠️ Key Tasks:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {editableProject?.keyTasks.map((task, index) => (
                          <li key={index}>{task}</li>
                        ))}
                      </ul>
                    </div>

                    {editableProject?.timeline && (
                      <div>
                        <h4 className="font-medium">⏳ Timeline:</h4>
                        <p className="text-sm text-gray-600">{editableProject.timeline}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium">🧠 Tags:</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {editableProject?.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DrawerFooter>
          <div className="flex gap-2">
            {parsedProject && (
              <Button onClick={handleCreateProject} className="flex-1">
                Create Project
              </Button>
            )}
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
