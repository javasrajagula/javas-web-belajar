// Academy OS Ω TypeScript Types

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  streak: number;
  lastActive: string; // ISO String
  xp: number;
  level: number;
  studyTimeToday: number; // in minutes
  dailyGoalMinutes: number; // in minutes
  dailyGoalXp: number; // target XP today
  weeklyProgress: { day: string; minutes: number; xp: number }[];
  weakTopics: { topic: string; mastery: number }[]; // mastery from 0-100
  skills: {
    focus: number;
    logic: number;
    creativity: number;
    discipline: number;
  };
  achievements: Achievement[];
  dailyQuests: DailyQuest[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string; // ISO String if unlocked
  icon: string;
  category: 'focus' | 'logic' | 'creativity' | 'discipline' | 'general';
}

export interface DailyQuest {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
  target: number;
  current: number;
  type: 'study' | 'quiz' | 'chat' | 'planner';
}

export interface Material {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'image' | 'text';
  fileSize: string;
  uploadedAt: string; // ISO String
  content: string; // Raw extracted text
  summary: string; // Generated summary
  mindmap: MindMapNode[];
  timeline: TimelineEvent[];
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface MindMapNode {
  id: string;
  label: string;
  type?: string;
  data?: any;
  position: { x: number; y: number };
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  content: string;
  timestamp: string; // ISO String
}

export interface TutorSession {
  id: string;
  mode: 'simple' | 'teacher' | 'professor' | 'exam' | 'debate';
  messages: ChatMessage[];
}

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  duration: number; // study duration block in minutes
  completed: boolean;
  category: 'study' | 'revision' | 'exam' | 'exercise';
  topic: string;
}

export interface ExamSession {
  id: string;
  topics: string[];
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  questions: QuizQuestion[];
  answers: Record<string, number>; // questionId -> chosenIndex
  score: number;
  startedAt: string; // ISO String
  completedAt?: string; // ISO String
  durationSeconds: number;
  speedSecsPerQuestion: number;
  accuracy: number;
}
