// Academy OS Ω TypeScript Type Definitions

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'school';
export type SchoolType = 'sma' | 'smk';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  schoolType: SchoolType;
  grade: number; // 10, 11, 12
  selectedPathway: string; // e.g. 'IPA', 'IPS', 'RPL', 'TKJ', 'DKV'
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
  goals: string[];
  portfolio: PortfolioProject[];
  pklLog: PKLJournalEntry[];
  guildId?: string | null;
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

// --- CURRICULUM ARCHITECTURE (JSON-first) ---

export interface CapaianPembelajaran {
  id: string;
  code: string;
  statement: string;
}

export interface TujuanPembelajaran {
  id: string;
  code: string;
  description: string;
}

export interface Subject {
  id: string;
  title: string;
  phase: 'E' | 'F';
  schoolType: SchoolType;
  grade: number;
  cpStatement: string;
  isDigitalSkill?: boolean;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  explanation: string; // Markdown text
  visualExample: string; // Tables, code snippets, visual representations
  summary: string;
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
  hotsQuestions: QuizQuestion[];
  practiceBank: PracticeBankItem[];
  podcastScript?: PodcastScriptLine[];
}

export interface PracticeBankItem {
  question: string;
  answer: string;
}

export interface PodcastScriptLine {
  role: 'budi' | 'siska';
  text: string;
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
  mastered?: boolean;
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

// --- SMK specific fields ---

export interface PKLJournalEntry {
  id: string;
  date: string;
  companyName: string;
  mentorName: string;
  activityDescription: string;
  hoursWorked: number;
  approved: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  projectUrl?: string;
  repositoryUrl?: string;
  skillsUsed: string[];
  gradeScore?: number;
  createdAt: string;
}

// --- Curriculum Versioning ---

export interface CurriculumVersion {
  id: string;
  version: string;
  effectiveDate: string;
  status: 'active' | 'deprecated';
  createdAt: string;
}

// --- Second Brain / MindMap / Materials ---

export interface MindMapNode {
  id: string;
  label: string;
  position: { x: number; y: number };
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface Material {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedAt: string;
  content: string;
  summary: string;
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
  mindmap: MindMapNode[];
  timeline: TimelineEvent[];
}

