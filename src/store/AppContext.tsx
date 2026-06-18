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

export interface ReviewFilterState {
  severity?: string;
  route?: string;
  batchId?: string | 'none';
  tester?: string;
  jumpScareId?: string;
  compareMode?: boolean;
  trendLabel?: string;
}

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
  reviewFilters: ReviewFilterState | null;
  batchLocked: boolean;
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
  createRegressionBatch: (parentBatchId: string, jumpScareIds: string[], reason: string) => void;
  setActiveBatchId: (id: string | null) => void;
  updateBatchItemStatus: (batchId: string, jumpScareId: string, status: TestItemStatus) => void;
  setTesterId: (id: string) => void;
  getBatchItemStatus: (jumpScareId: string) => TestItemStatus;
  resetBatchItemsToPending: (batchId: string) => void;
  navigateToReview: (filters: ReviewFilterState) => void;
  clearReviewFilters: () => void;
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
    reviewFilters: null,
    batchLocked: false,
  });

  const setSelectedRoute = (route: CharacterRoute | null) => {
    setState(prev => {
      if (prev.activeBatchId && prev.batchLocked) return prev;
      return { ...prev, selectedRoute: route };
    });
  };

  const setSelectedDifficulty = (difficulty: Difficulty | null) => {
    setState(prev => {
      if (prev.activeBatchId && prev.batchLocked) return prev;
      return { ...prev, selectedDifficulty: difficulty };
    });
  };

  const setSelectedSaveState = (saveState: SaveState | null) => {
    setState(prev => {
      if (prev.activeBatchId && prev.batchLocked) return prev;
      return { ...prev, selectedSaveState: saveState };
    });
  };

  const setCurrentPage = (page: 'tasks' | 'review' | 'producer') => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const addTestResult = (result: TestResult) => {
    setState(prev => {
      const newResults = [result, ...prev.testResults];
      let newBatches = prev.batches;

      if (result.batchId && result.isRegression && result.passed && result.parentBatchId) {
        newBatches = prev.batches.map(batch => {
          if (batch.id === result.parentBatchId) {
            return {
              ...batch,
              statuses: {
                ...batch.statuses,
                [result.jumpScareId]: 'passed' as TestItemStatus,
              },
              regressionResultIds: {
                ...(batch.regressionResultIds || {}),
                [result.jumpScareId]: result.id,
              },
            };
          }
          return batch;
        });
      }

      return {
        ...prev,
        testResults: newResults,
        batches: newBatches,
      };
    });
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
        batchLocked: true,
      };
    });
  }, []);

  const createRegressionBatch = useCallback((parentBatchId: string, jumpScareIds: string[], reason: string) => {
    setState(prev => {
      const parentBatch = prev.batches.find(b => b.id === parentBatchId);
      if (!parentBatch || jumpScareIds.length === 0) return prev;

      const statuses: Record<string, TestItemStatus> = {};
      jumpScareIds.forEach(id => {
        statuses[id] = 'pending';
      });

      const now = new Date();
      const timeStr = `${now.getMonth() + 1}${now.getDate()}-${now.getHours()}${String(now.getMinutes()).padStart(2, '0')}`;

      const batch: TestBatch = {
        id: `batch-reg-${Date.now()}`,
        name: `回归-${parentBatch.name}-${timeStr}`,
        route: parentBatch.route,
        difficulty: parentBatch.difficulty,
        saveState: parentBatch.saveState,
        jumpScareIds,
        statuses,
        createdAt: now,
        tester: prev.testerId,
        parentBatchId,
        regressionReason: reason,
        regressionJumpScareIds: jumpScareIds,
      };

      return {
        ...prev,
        batches: [batch, ...prev.batches],
        activeBatchId: batch.id,
        batchLocked: true,
        selectedRoute: parentBatch.route,
        selectedDifficulty: parentBatch.difficulty,
        selectedSaveState: parentBatch.saveState,
      };
    });
  }, []);

  const setActiveBatchId = useCallback((id: string | null) => {
    setState(prev => {
      if (id) {
        const batch = prev.batches.find(b => b.id === id);
        if (batch) {
          return {
            ...prev,
            activeBatchId: id,
            batchLocked: true,
            selectedRoute: batch.route,
            selectedDifficulty: batch.difficulty,
            selectedSaveState: batch.saveState,
          };
        }
      }
      return {
        ...prev,
        activeBatchId: null,
        batchLocked: false,
      };
    });
  }, []);

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

  const resetBatchItemsToPending = (batchId: string) => {
    setState(prev => ({
      ...prev,
      batches: prev.batches.map(b => {
        if (b.id !== batchId) return b;
        const newStatuses: Record<string, TestItemStatus> = {};
        for (const [jsId, status] of Object.entries(b.statuses)) {
          newStatuses[jsId] = status === 'needs_review' ? 'pending' : status;
        }
        return { ...b, statuses: newStatuses };
      }),
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

  const navigateToReview = useCallback((filters: ReviewFilterState) => {
    setState(prev => ({
      ...prev,
      reviewFilters: filters,
      currentPage: 'review' as const,
    }));
  }, []);

  const clearReviewFilters = () => {
    setState(prev => ({ ...prev, reviewFilters: null }));
  };

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
        createRegressionBatch,
        setActiveBatchId,
        updateBatchItemStatus,
        setTesterId,
        getBatchItemStatus,
        resetBatchItemsToPending,
        navigateToReview,
        clearReviewFilters,
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
