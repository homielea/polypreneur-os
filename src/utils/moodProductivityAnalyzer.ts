interface DailyCheckInData {
  date: string;
  mood: "high" | "medium" | "low";
  energy: "high" | "medium" | "low";
  focus: string;
  reflection: string;
  completed: boolean;
}

interface EveningReflectionData {
  date: string;
  tasksCompleted: number;
  focusAchieved: number;
  energyUsed: number;
  accomplishments: string;
  challenges: string;
  tomorrowPriority: string;
  satisfactionLevel: number;
  completed: boolean;
}

export interface ProductivityPattern {
  bestMoodForProductivity: "high" | "medium" | "low";
  bestEnergyForFocus: "high" | "medium" | "low";
  averageTasksOnHighMood: number;
  averageTasksOnLowMood: number;
  focusCorrelation: number;
  productivityTrend: "improving" | "declining" | "stable";
  // Additional properties needed by AnalyticsDashboard
  bestMoodDay: string;
  averageMoodScore: number;
  highEnergyDays: number;
  averageProductivity: number;
}

export class MoodProductivityAnalyzer {
  static analyzePatterns(
    checkIns: DailyCheckInData[],
    reflections: EveningReflectionData[]
  ): ProductivityPattern {
    if (checkIns.length < 3) {
      return this.getDefaultPattern();
    }

    // Combine check-ins with reflections
    const combinedData = checkIns.map(checkIn => {
      const reflection = reflections.find(r => r.date === checkIn.date);
      return {
        ...checkIn,
        tasksCompleted: reflection?.tasksCompleted || 0,
        focusAchieved: reflection?.focusAchieved || 5,
        satisfactionLevel: reflection?.satisfactionLevel || 5
      };
    }).filter(d => d.tasksCompleted > 0); // Only include days with data

    if (combinedData.length === 0) {
      return this.getDefaultPattern();
    }

    // Analyze mood vs productivity
    const moodProductivity = {
      high: combinedData.filter(d => d.mood === "high").map(d => d.tasksCompleted),
      medium: combinedData.filter(d => d.mood === "medium").map(d => d.tasksCompleted),
      low: combinedData.filter(d => d.mood === "low").map(d => d.tasksCompleted)
    };

    const avgTasks = {
      high: this.average(moodProductivity.high),
      medium: this.average(moodProductivity.medium),
      low: this.average(moodProductivity.low)
    };

    // Find best mood for productivity
    const bestMoodForProductivity = Object.entries(avgTasks)
      .sort(([,a], [,b]) => b - a)[0][0] as "high" | "medium" | "low";

    // Analyze energy vs focus
    const energyFocus = {
      high: combinedData.filter(d => d.energy === "high").map(d => d.focusAchieved),
      medium: combinedData.filter(d => d.energy === "medium").map(d => d.focusAchieved),
      low: combinedData.filter(d => d.energy === "low").map(d => d.focusAchieved)
    };

    const avgFocus = {
      high: this.average(energyFocus.high),
      medium: this.average(energyFocus.medium),
      low: this.average(energyFocus.low)
    };

    const bestEnergyForFocus = Object.entries(avgFocus)
      .sort(([,a], [,b]) => b - a)[0][0] as "high" | "medium" | "low";

    // Calculate focus correlation (mood + energy vs focus achievement)
    const focusCorrelation = this.calculateFocusCorrelation(combinedData);

    // Analyze productivity trend
    const recentData = combinedData.slice(-7); // Last 7 days
    const olderData = combinedData.slice(-14, -7); // Previous 7 days
    
    let productivityTrend: "improving" | "declining" | "stable" = "stable";
    if (recentData.length >= 3 && olderData.length >= 3) {
      const recentAvg = this.average(recentData.map(d => d.tasksCompleted));
      const olderAvg = this.average(olderData.map(d => d.tasksCompleted));
      
      if (recentAvg > olderAvg * 1.2) {
        productivityTrend = "improving";
      } else if (recentAvg < olderAvg * 0.8) {
        productivityTrend = "declining";
      }
    }

    // Calculate additional properties for dashboard
    const averageMoodScore = this.average(combinedData.map(d => 
      d.mood === "high" ? 3 : d.mood === "medium" ? 2 : 1
    ));

    const highEnergyDays = combinedData.filter(d => d.energy === "high").length;

    const averageProductivity = this.average(combinedData.map(d => d.satisfactionLevel));

    // Find the best day of the week for mood
    const dayMoodMap = combinedData.reduce((acc, d) => {
      const dayOfWeek = new Date(d.date).toLocaleDateString('en-US', { weekday: 'long' });
      const moodScore = d.mood === "high" ? 3 : d.mood === "medium" ? 2 : 1;
      
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = [];
      }
      acc[dayOfWeek].push(moodScore);
      return acc;
    }, {} as Record<string, number[]>);

    const bestMoodDay = Object.entries(dayMoodMap)
      .map(([day, scores]) => ({ day, avgScore: this.average(scores) }))
      .sort((a, b) => b.avgScore - a.avgScore)[0]?.day || "Monday";

    return {
      bestMoodForProductivity,
      bestEnergyForFocus,
      averageTasksOnHighMood: avgTasks.high,
      averageTasksOnLowMood: avgTasks.low,
      focusCorrelation,
      productivityTrend,
      bestMoodDay,
      averageMoodScore,
      highEnergyDays,
      averageProductivity
    };
  }

  private static average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private static calculateFocusCorrelation(data: any[]): number {
    // Simple correlation between (mood + energy) and focus achievement
    const moodEnergyScores = data.map(d => {
      const moodScore = d.mood === "high" ? 3 : d.mood === "medium" ? 2 : 1;
      const energyScore = d.energy === "high" ? 3 : d.energy === "medium" ? 2 : 1;
      return moodScore + energyScore;
    });

    const focusScores = data.map(d => d.focusAchieved);

    // Simple correlation coefficient
    const n = data.length;
    const sumXY = moodEnergyScores.reduce((sum, x, i) => sum + x * focusScores[i], 0);
    const sumX = moodEnergyScores.reduce((sum, x) => sum + x, 0);
    const sumY = focusScores.reduce((sum, y) => sum + y, 0);
    const sumX2 = moodEnergyScores.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = focusScores.reduce((sum, y) => sum + y * y, 0);

    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return isNaN(correlation) ? 0 : correlation;
  }

  private static getDefaultPattern(): ProductivityPattern {
    return {
      bestMoodForProductivity: "high",
      bestEnergyForFocus: "high",
      averageTasksOnHighMood: 0,
      averageTasksOnLowMood: 0,
      focusCorrelation: 0,
      productivityTrend: "stable",
      bestMoodDay: "Monday",
      averageMoodScore: 2,
      highEnergyDays: 0,
      averageProductivity: 5
    };
  }

  static getProductivityRecommendations(
    currentMood: "high" | "medium" | "low",
    currentEnergy: "high" | "medium" | "low",
    pattern: ProductivityPattern
  ): string[] {
    const recommendations: string[] = [];

    // Mood-based recommendations
    if (currentMood === pattern.bestMoodForProductivity) {
      recommendations.push("You're in your most productive mood state - tackle challenging tasks!");
    } else if (currentMood === "low" && pattern.bestMoodForProductivity === "high") {
      recommendations.push("Low mood detected. Consider lighter tasks or creative work instead of heavy execution.");
    }

    // Energy-based recommendations
    if (currentEnergy === pattern.bestEnergyForFocus) {
      recommendations.push("Your energy level is optimal for focused work - minimize distractions.");
    } else if (currentEnergy === "low") {
      recommendations.push("Low energy - perfect time for planning, organizing, or idea capture.");
    }

    // Correlation insights
    if (pattern.focusCorrelation > 0.5) {
      recommendations.push("Your mood and energy strongly predict focus - prioritize self-care for better outcomes.");
    }

    // Trend insights
    if (pattern.productivityTrend === "improving") {
      recommendations.push("You're on an upward trend! Keep up the momentum.");
    } else if (pattern.productivityTrend === "declining") {
      recommendations.push("Productivity has been declining. Consider adjusting your approach or taking a break.");
    }

    return recommendations;
  }
}
