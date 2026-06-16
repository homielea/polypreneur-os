
export interface ParsedProject {
  title: string;
  type: "web-app" | "extension" | "mobile";
  purpose: string;
  keyTasks: string[];
  timeline?: string;
  tags: string[];
  status: "ideation" | "in-progress" | "ready-to-launch" | "launched";
}

export const parseVoiceInput = (transcript: string): ParsedProject => {
  const text = transcript.toLowerCase();
  
  // Determine project type based on keywords
  let type: "web-app" | "extension" | "mobile" = "web-app";
  if (text.includes("extension") || text.includes("chrome") || text.includes("browser")) {
    type = "extension";
  } else if (text.includes("mobile") || text.includes("app") || text.includes("ios") || text.includes("android")) {
    type = "mobile";
  }

  // Extract title (first sentence or key phrase)
  const sentences = transcript.split(/[.!?]+/);
  let title = sentences[0]?.trim() || "Voice Created Project";
  if (title.length > 50) {
    title = title.substring(0, 47) + "...";
  }

  // Extract purpose/goal
  const purposeKeywords = ["goal", "purpose", "want to", "need to", "trying to", "building", "creating"];
  let purpose = "";
  for (const keyword of purposeKeywords) {
    const index = text.indexOf(keyword);
    if (index !== -1) {
      const sentence = sentences.find(s => s.toLowerCase().includes(keyword));
      if (sentence) {
        purpose = sentence.trim();
        break;
      }
    }
  }
  if (!purpose) {
    purpose = transcript.split('.')[0] || "Voice-created project";
  }

  // Extract key tasks
  const taskKeywords = ["task", "todo", "need to", "should", "must", "will", "plan to"];
  const keyTasks: string[] = [];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    taskKeywords.forEach(keyword => {
      if (lowerSentence.includes(keyword) && !keyTasks.includes(sentence.trim())) {
        const cleanTask = sentence.trim().replace(/^(and |then |also |next )/i, '');
        if (cleanTask.length > 5) {
          keyTasks.push(cleanTask);
        }
      }
    });
  });

  // If no tasks found, create some basic ones
  if (keyTasks.length === 0) {
    keyTasks.push("Research and plan the project");
    keyTasks.push("Create initial design and wireframes");
    keyTasks.push("Start development");
  }

  // Extract timeline
  const timelineRegex = /(in \d+ \w+|by \w+|next \w+|this \w+|deadline|due)/i;
  const timelineMatch = transcript.match(timelineRegex);
  const timeline = timelineMatch ? timelineMatch[0] : undefined;

  // Extract tags
  const commonTags = ["saas", "ai", "productivity", "social", "ecommerce", "content", "marketing", "tool", "app", "web"];
  const tags: string[] = [];
  commonTags.forEach(tag => {
    if (text.includes(tag)) {
      tags.push(tag);
    }
  });

  // Add type as tag
  tags.push(type.replace("-", " "));

  // Determine initial status
  let status: "ideation" | "in-progress" | "ready-to-launch" | "launched" = "ideation";
  if (text.includes("started") || text.includes("working on") || text.includes("building")) {
    status = "in-progress";
  }

  return {
    title,
    type,
    purpose,
    keyTasks: keyTasks.slice(0, 4), // Limit to 4 tasks
    timeline,
    tags,
    status
  };
};
