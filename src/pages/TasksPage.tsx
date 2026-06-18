import React, { useMemo } from 'react';
import { User, Gamepad2, Save, ChevronRight, AlertTriangle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { characters } from '../data/characters';
import { difficultyLabels, saveStateLabels } from '../data/chapters';
import { jumpScares } from '../data/jumpScares';
import type { CharacterRoute, Difficulty, SaveState } from '../types';
import JumpScarePreview from '../components/JumpScarePreview';
import TestChecklist from '../components/TestChecklist';

const TasksPage: React.FC = () => {
  const {
    selectedRoute,
    selectedDifficulty,
    selectedSaveState,
    setSelectedRoute,
    setSelectedDifficulty,
    setSelectedSaveState,
  } = useApp();

  const difficulties: { id: Difficulty; label: string; icon: string; color: string }[] = [
    { id: 'easy', label: '简单', icon: '🌱', color: 'text-green-400' },
    { id: 'normal', label: '普通', icon: '⚔️', color: 'text-yellow-400' },
    { id: 'hard', label: '困难', icon: '💀', color: 'text-orange-400' },
    { id: 'nightmare', label: '噩梦', icon: '👹', color: 'text-red-400' },
  ];

  const saveStates: { id: SaveState; label: string }[] = Object.entries(saveStateLabels).map(
    ([id, label]) => ({ id: id as SaveState, label })
  );

  const filteredJumpScares = useMemo(() => {
    if (!selectedRoute || !selectedDifficulty || !selectedSaveState) {
      return [];
    }
    return jumpScares.filter(
      (js) =>
        js.routes.includes(selectedRoute) &&
        js.difficulty.includes(selectedDifficulty) &&
        js.saveStates.includes(selectedSaveState)
    );
  }, [selectedRoute, selectedDifficulty, selectedSaveState]);

  const allSelected = selectedRoute && selectedDifficulty && selectedSaveState;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-horror-heading mb-2">测试任务</h2>
          <p className="text-horror-text/70">
            选择测试参数后，系统将展示该路线下应出现的所有跳吓镜头清单
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-horror-panel rounded-xl border border-horror-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-horror-accent2" />
              <h3 className="text-lg font-semibold text-horror-heading">选择角色路线</h3>
            </div>
            <div className="space-y-3">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedRoute(char.id as CharacterRoute)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 card-hover ${
                    selectedRoute === char.id
                      ? 'border-horror-accent2 bg-horror-accent2/10 glow-purple'
                      : 'border-horror-border bg-horror-bg/50 hover:border-horror-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-2xl"
                      style={{ filter: selectedRoute === char.id ? 'none' : 'grayscale(0.5)' }}
                    >
                      {char.avatar}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-horror-heading">{char.name}</div>
                      <div className="text-xs text-horror-text/60 mt-0.5">{char.description}</div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        selectedRoute === char.id ? 'text-horror-accent2 translate-x-0' : 'text-horror-text/30 -translate-x-1'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-horror-panel rounded-xl border border-horror-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5 text-horror-warning" />
              <h3 className="text-lg font-semibold text-horror-heading">选择难度</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`p-4 rounded-lg border transition-all duration-200 text-center card-hover ${
                    selectedDifficulty === diff.id
                      ? 'border-horror-warning bg-horror-warning/10'
                      : 'border-horror-border bg-horror-bg/50 hover:border-horror-border/80'
                  }`}
                >
                  <div className="text-2xl mb-2">{diff.icon}</div>
                  <div className={`font-medium ${diff.color}`}>{diff.label}</div>
                  <div className="text-xs text-horror-text/50 mt-1">
                    {difficultyLabels[diff.id]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-horror-panel rounded-xl border border-horror-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Save className="w-5 h-5 text-horror-success" />
              <h3 className="text-lg font-semibold text-horror-heading">选择存档状态</h3>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {saveStates.map((state) => (
                <button
                  key={state.id}
                  onClick={() => setSelectedSaveState(state.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 card-hover ${
                    selectedSaveState === state.id
                      ? 'border-horror-success bg-horror-success/10'
                      : 'border-horror-border bg-horror-bg/50 hover:border-horror-border/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        selectedSaveState === state.id ? 'bg-horror-success' : 'bg-horror-text/30'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        selectedSaveState === state.id ? 'text-horror-heading' : 'text-horror-text'
                      }`}
                    >
                      {state.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {!allSelected && (
          <div className="bg-horror-panel/50 rounded-xl border border-horror-border border-dashed p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-horror-warning mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-horror-heading mb-2">
              请先选择测试参数
            </h3>
            <p className="text-horror-text/60">
              选择角色路线、难度和存档状态后，系统将自动筛选出对应的跳吓镜头清单
            </p>
          </div>
        )}

        {allSelected && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-horror-heading">
                  跳吓预演清单
                </h3>
                <p className="text-horror-text/60 mt-1">
                  共筛选出 <span className="text-horror-accent font-semibold">{filteredJumpScares.length}</span> 个跳吓镜头
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-horror-text/60">角色:</span>
                  <span className="text-horror-heading font-medium">
                    {characters.find((c) => c.id === selectedRoute)?.name}
                  </span>
                </div>
                <div className="w-px h-4 bg-horror-border" />
                <div className="flex items-center gap-2">
                  <span className="text-horror-text/60">难度:</span>
                  <span className="text-horror-heading font-medium">
                    {difficultyLabels[selectedDifficulty!]}
                  </span>
                </div>
                <div className="w-px h-4 bg-horror-border" />
                <div className="flex items-center gap-2">
                  <span className="text-horror-text/60">存档:</span>
                  <span className="text-horror-heading font-medium">
                    {saveStateLabels[selectedSaveState!]}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-4">
                {filteredJumpScares.map((jumpScare) => (
                  <JumpScarePreview key={jumpScare.id} jumpScare={jumpScare} />
                ))}
              </div>
              <div>
                <TestChecklist jumpScares={filteredJumpScares} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
