import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  CharacterRoute,
  Difficulty,
  SaveState,
  TestResult,
  TestCheckItem,
  TestBatch,
  TestItemStatus,
} from '../types';
import { testResults as initialTestResults } from '../data/testResults';
import { jumpScares } from '../data/jumpScares';

interface AppState {
  selectedRoute: CharacterRoute | null;
  selectedDifficulty: Difficulty | null;
  selectedSaveState: SaveState | null;
  currentPage: 'tasks' | 'review' | 'producer';
  testResults: TestResult[];
  activeJumpScareId: string | null;
  currentTestChecks: Record<string, TestCheckItem>;
  batches: TestBatch[];
  activeBatchId: string | null;
  testerId: string;
}

interface AppContextType extends AppState {
  setSelectedRoute: (route: CharacterRoute | null) => void;
  setSelectedDifficulty: (difficulty: Difficulty | null) => void;
  setSelectedSaveState: (saveState: SaveState | null) => void;
  setCurrentPage: (page: 'tasks' | 'review' | 'producer') => void;
  addTestResult: (result: TestResult) => void;
  setActiveJumpScareId: (id: string | null) => void;
  updateTestCheck: (jumpScareId: string, checks: Partial<TestCheckItem>) => void;
  resetTestChecks: () => void;
  createBatch: (name: string) => void;
  setActiveBatchId: (id: string | null) => void;
  updateBatchItemStatus: (batchId: string, jumpScareId: string, status: TestItemStatus) => void;
  setTesterId: (id: string) => void;
  getBatchItemStatus: (jumpScareId: string) => TestItemStatus;
}

const defaultChecks: TestCheckItem = {
  triggered: false,
  obscured: false,
  distracted: false,
  lowFps: false,
  notes: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    selectedRoute: null,
    selectedDifficulty: null,
    selectedSaveState: null,
    currentPage: 'tasks',
    testResults: initialTestResults,
    activeJumpScareId: null,
    currentTestChecks: {},
    batches: [],
    activeBatchId: null,
    testerId: 'QA-001',
  });

  const setSelectedRoute = (route: CharacterRoute | null) => {
    setState(prev => ({ ...prev, selectedRoute: route }));
  };

  const setSelectedDifficulty = (difficulty: Difficulty | null) => {
    setState(prev => ({ ...prev, selectedDifficulty: difficulty }));
  };

  const setSelectedSaveState = (saveState: SaveState | null) => {
    setState(prev => ({ ...prev, selectedSaveState: saveState }));
  };

  const setCurrentPage = (page: 'tasks' | 'review' | 'producer') => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const addTestResult = (result: TestResult) => {
    setState(prev => ({
      ...prev,
      testResults: [result, ...prev.testResults],
    }));
  };

  const setActiveJumpScareId = (id: string | null) => {
    setState(prev => ({ ...prev, activeJumpScareId: id }));
  };

  const updateTestCheck = (jumpScareId: string, checks: Partial<TestCheckItem>) => {
    setState(prev => ({
      ...prev,
      currentTestChecks: {
        ...prev.currentTestChecks,
        [jumpScareId]: {
          ...(prev.currentTestChecks[jumpScareId] || defaultChecks),
          ...checks,
        },
      },
    }));
  };

  const resetTestChecks = () => {
    setState(prev => ({ ...prev, currentTestChecks: {} }));
  };

  const createBatch = useCallback((name: string) => {
    setState(prev => {
      if (!prev.selectedRoute || !prev.selectedDifficulty || !prev.selectedSaveState) return prev;

      const filteredIds = jumpScares
        .filter(
          js =>
            js.routes.includes(prev.selectedRoute!) &&
            js.difficulty.includes(prev.selectedDifficulty!) &&
            js.saveStates.includes(prev.selectedSaveState!)
        )
        .map(js => js.id);

      const statuses: Record<string, TestItemStatus> = {};
      filteredIds.forEach(id => {
        statuses[id] = 'pending';
      });

      const batch: TestBatch = {
        id: `batch-${Date.now()}`,
        name,
        route: prev.selectedRoute,
        difficulty: prev.selectedDifficulty,
        saveState: prev.selectedSaveState,
        jumpScareIds: filteredIds,
        statuses,
        createdAt: new Date(),
        tester: prev.testerId,
      };

      return {
        ...prev,
        batches: [batch, ...prev.batches],
        activeBatchId: batch.id,
      };
    });
  }, []);

  const setActiveBatchId = (id: string | null) => {
    setState(prev => ({ ...prev, activeBatchId: id }));
  };

  const updateBatchItemStatus = (batchId: string, jumpScareId: string, status: TestItemStatus) => {
    setState(prev => ({
      ...prev,
      batches: prev.batches.map(b =>
        b.id === batchId
          ? { ...b, statuses: { ...b.statuses, [jumpScareId]: status } }
          : b
      ),
    }));
  };

  const setTesterId = (id: string) => {
    setState(prev => ({ ...prev, testerId: id }));
  };

  const getBatchItemStatus = useCallback((jumpScareId: string): TestItemStatus => {
    if (!state.activeBatchId) return 'pending';
    const batch = state.batches.find(b => b.id === state.activeBatchId);
    if (!batch) return 'pending';
    return batch.statuses[jumpScareId] || 'pending';
  }, [state.activeBatchId, state.batches]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setSelectedRoute,
        setSelectedDifficulty,
        setSelectedSaveState,
        setCurrentPage,
        addTestResult,
        setActiveJumpScareId,
        updateTestCheck,
        resetTestChecks,
        createBatch,
        setActiveBatchId,
        updateBatchItemStatus,
        setTesterId,
        getBatchItemStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
