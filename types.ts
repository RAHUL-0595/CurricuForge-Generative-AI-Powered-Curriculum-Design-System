
export interface LearningOutcome {
  id: string;
  description: string;
}

export interface Topic {
  id: string;
  title: string;
  duration: string;
  description: string;
  keyPoints: string[];
}

export interface Module {
  id: string;
  title: string;
  topics: Topic[];
  learningOutcomes: LearningOutcome[];
}

export interface Curriculum {
  title: string;
  description: string;
  targetAudience: string;
  totalDuration: string;
  modules: Module[];
  academicOptimizationTips: string[];
}

export interface GenerationParams {
  subject: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  industryAlignment: string;
  durationWeeks: number;
  additionalContext: string;
}
