import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CharacterRoute, Difficulty, SaveState, TestResult, TestCheckItem } from '../types';
import { testResults as initialTestResults } from '../data/testResults';

interface AppState {
  selectedRoute: CharacterRoute | null;
  selectedDifficulty: Difficulty | null;
  selectedSaveState: SaveState | null;
  currentPage: 'tasks' | 'review' | 'producer';
  testResults: TestResult[];
  activeJumpScareId: string | null;
  currentTestChecks: Record<string, TestCheckItem>;
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
