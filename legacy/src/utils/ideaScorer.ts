
import { IdeaData } from "@/types";

export interface IdeaScoreResult {
  pmfScore: number;
  portfolioFitScore: number;
  launchSpeedScore: number;
  energyLevel: "high" | "medium" | "low";
  aiPriorityScore: number;
  nextStep: string;
}

export const scoreIdea = async (ideaData: Partial<IdeaData>): Promise<IdeaScoreResult> => {
  // Mock AI scoring for now - can be replaced with real AI later
  const { title, description, category, targetAudience, problemItSolves } = ideaData;
  
  // Simple scoring algorithm based on content analysis
  let pmfScore = 5;
  let portfolioFitScore = 5;
  let launchSpeedScore = 5;
  let energyLevel: "high" | "medium" | "low" = "medium";

  // PMF Score - based on problem clarity and audience specificity
  if (problemItSolves && problemItSolves.length > 50) pmfScore += 2;
  if (targetAudience && targetAudience.length > 20) pmfScore += 1;
  if (description && description.includes("pain") || description.includes("problem")) pmfScore += 1;
  pmfScore = Math.min(10, pmfScore);

  // Portfolio Fit Score - based on category and complexity
  if (category === "saas") portfolioFitScore += 2;
  if (category === "content") portfolioFitScore += 3;
  if (title && title.length < 30) portfolioFitScore += 1; // Simple titles are better
  portfolioFitScore = Math.min(10, portfolioFitScore);

  // Launch Speed Score - based on category and description complexity
  if (category === "content" || category === "coaching") launchSpeedScore += 3;
  if (category === "saas") launchSpeedScore += 1;
  if (description && description.length < 100) launchSpeedScore += 2; // Simpler = faster
  launchSpeedScore = Math.min(10, launchSpeedScore);

  // Energy Level - based on word choices and enthusiasm markers
  const enthusiasmWords = ["excited", "passionate", "love", "amazing", "awesome"];
  const hasEnthusiasm = enthusiasmWords.some(word => 
    description?.toLowerCase().includes(word) || title?.toLowerCase().includes(word)
  );
  
  if (hasEnthusiasm) energyLevel = "high";
  else if (pmfScore > 7) energyLevel = "high";
  else if (pmfScore < 4) energyLevel = "low";

  const aiPriorityScore = Math.round((pmfScore + portfolioFitScore + launchSpeedScore) / 3 * 10) / 10;

  let nextStep = "Validate with potential users";
  if (aiPriorityScore >= 8) nextStep = "Write your Manifesto and start building";
  else if (aiPriorityScore >= 6) nextStep = "Do market research and validate assumptions";
  else if (aiPriorityScore < 4) nextStep = "Pivot or kill this idea";

  return {
    pmfScore,
    portfolioFitScore,
    launchSpeedScore,
    energyLevel,
    aiPriorityScore,
    nextStep
  };
};
