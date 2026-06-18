export type Difficulty = 'easy' | 'normal' | 'hard' | 'nightmare';

export type CharacterRoute = 'alice' | 'john' | 'maria' | 'detective';

export type SaveState = 'chapter1_start' | 'chapter1_mid' | 'chapter1_end' | 'chapter2_start' | 'chapter2_mid' | 'chapter2_end' | 'chapter3_start' | 'chapter3_mid' | 'ending_a' | 'ending_b';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type IssueType = 'not_triggered' | 'obscured' | 'distracted' | 'low_fps' | 'timing' | 'other';

export type CameraAngle = 'first_person' | 'over_shoulder' | 'fixed' | 'cinematic';

export type TestItemStatus = 'pending' | 'passed' | 'needs_review';

export interface JumpScare {
  id: string;
  name: string;
  description: string;
  chapter: string;
  level: string;
  triggerCondition: string;
  cameraAngle: CameraAngle;
  monsterWindow: {
    start: number;
    duration: number;
    criticalFrames: number[];
  };
  allowedDeviation: {
    position: number;
    rotation: number;
    speed: number;
  };
  difficulty: Difficulty[];
  routes: CharacterRoute[];
  saveStates: SaveState[];
  prerequisites: string[];
  expectedResult: string;
  notes?: string;
}

export interface TestCheckItem {
  triggered: boolean;
  obscured: boolean;
  distracted: boolean;
  lowFps: boolean;
  notes: string;
  issueType?: IssueType;
  severity?: Severity;
}

export interface TestResult {
  id: string;
  jumpScareId: string;
  tester: string;
  timestamp: Date;
  route: CharacterRoute;
  difficulty: Difficulty;
  saveState: SaveState;
  checks: TestCheckItem;
  passed: boolean;
  batchId?: string;
}

export interface TestBatch {
  id: string;
  name: string;
  route: CharacterRoute;
  difficulty: Difficulty;
  saveState: SaveState;
  jumpScareIds: string[];
  statuses: Record<string, TestItemStatus>;
  createdAt: Date;
  tester: string;
}

export interface Character {
  id: CharacterRoute;
  name: string;
  description: string;
  avatar: string;
  color: string;
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  levels: string[];
}

export interface ProducerInsight {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: 'pathing' | 'timing' | 'fatigue' | 'visibility' | 'immersion';
  affectedRoutes: CharacterRoute[];
  affectedDifficulties: Difficulty[];
  testCount: number;
  failureRate: number;
  evidence: string[];
  recommendation: string;
}
