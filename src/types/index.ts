
export interface Project {
  id: string;
  title: string;
  type: "web-app" | "extension" | "mobile";
  status: "ideation" | "in-progress" | "ready-to-launch" | "launched";
  progress: number;
  phases: Phase[];
  createdAt: Date;
  template?: string;
  purpose?: string;
  keyTasks?: string[];
  timeline?: string;
  tags?: string[];
  voiceNotes?: string;
}

export interface Phase {
  id: string;
  name: string;
  completed: boolean;
  tasks: string[];
  subtasks: string[];
  automationTrigger?: string;
  description?: string;
}
