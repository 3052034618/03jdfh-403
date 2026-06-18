import React, { useMemo, useState } from 'react';
import { User, Gamepad2, Save, ChevronRight, AlertTriangle, Plus, Layers, Clock } from 'lucide-react';
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
    batches,
    activeBatchId,
    createBatch,
    setActiveBatchId,
    testerId,
    setTesterId,
  } = useApp();

  const [batchName, setBatchName] = useState('');
  const [showBatchForm, setShowBatchForm] = useState(false);

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

  const activeBatch = batches.find((b) => b.id === activeBatchId);

  const handleCreateBatch = () => {
    if (!batchName.trim()) {
      const now = new Date();
      const autoName = `批次-${now.getMonth() + 1}${now.getDate()}-${now.getHours()}${String(now.getMinutes()).padStart(2, '0')}`;
      createBatch(autoName);
    } else {
      createBatch(batchName.trim());
    }
    setBatchName('');
    setShowBatchForm(false);
  };

  const batchProgress = activeBatch
    ? {
        total: activeBatch.jumpScareIds.length,
        pending: activeBatch.jumpScareIds.filter((id) => activeBatch.statuses[id] === 'pending').length,
        passed: activeBatch.jumpScareIds.filter((id) => activeBatch.statuses[id] === 'passed').length,
        needsReview: activeBatch.jumpScareIds.filter((id) => activeBatch.statuses[id] === 'needs_review').length,
      }
    : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-horror-heading mb-2">测试任务</h2>
          <p className="text-horror-text/70">
            选择测试参数后创建测试批次，逐项验证跳吓镜头
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
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
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2">
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

          <div className="bg-horror-panel rounded-xl border border-horror-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-horror-accent" />
              <h3 className="text-lg font-semibold text-horror-heading">批次与测试员</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-horror-text/60 mb-1.5 block">测试员编号</label>
                <input
                  type="text"
                  value={testerId}
                  onChange={(e) => setTesterId(e.target.value)}
                  className="w-full px-3 py-2 bg-horror-bg/50 border border-horror-border rounded-lg text-sm text-horror-text focus:outline-none focus:border-horror-accent/50"
                  placeholder="QA-001"
                />
              </div>

              {allSelected && !activeBatchId && (
                <button
                  onClick={() => setShowBatchForm(true)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-horror-accent to-horror-accent/80 text-white font-medium rounded-lg transition-all hover:from-horror-accent/90 hover:to-horror-accent/70 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  创建测试批次
                </button>
              )}

              {showBatchForm && allSelected && (
                <div className="space-y-3 p-3 bg-horror-bg/50 rounded-lg border border-horror-border">
                  <div>
                    <label className="text-xs text-horror-text/60 mb-1.5 block">批次名称</label>
                    <input
                      type="text"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      className="w-full px-3 py-2 bg-horror-bg border border-horror-border rounded-lg text-sm text-horror-text focus:outline-none focus:border-horror-accent/50"
                      placeholder="留空将自动生成名称"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateBatch();
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateBatch}
                      className="flex-1 py-2 px-3 bg-horror-accent text-white text-sm font-medium rounded-lg hover:bg-horror-accent/90 transition-colors"
                    >
                      确认创建
                    </button>
                    <button
                      onClick={() => setShowBatchForm(false)}
                      className="py-2 px-3 bg-horror-border/50 text-horror-text text-sm rounded-lg hover:bg-horror-border transition-colors"
                    >
                      取消
                    </button>
                  </div>
                  <p className="text-xs text-horror-text/50">
                    将创建包含 {filteredJumpScares.length} 个跳吓镜头的测试批次
                  </p>
                </div>
              )}

              {activeBatch && (
                <div className="p-3 bg-horror-accent/10 border border-horror-accent/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-horror-heading">
                      {activeBatch.name}
                    </span>
                    <button
                      onClick={() => setActiveBatchId(null)}
                      className="text-xs text-horror-text/50 hover:text-horror-accent"
                    >
                      关闭批次
                    </button>
                  </div>
                  {batchProgress && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-1.5 bg-horror-bg/50 rounded">
                        <div className="text-horror-text/60">待测</div>
                        <div className="text-lg font-bold text-horror-text">{batchProgress.pending}</div>
                      </div>
                      <div className="text-center p-1.5 bg-green-500/10 rounded">
                        <div className="text-green-400/60">通过</div>
                        <div className="text-lg font-bold text-green-400">{batchProgress.passed}</div>
                      </div>
                      <div className="text-center p-1.5 bg-yellow-500/10 rounded">
                        <div className="text-yellow-400/60">需复查</div>
                        <div className="text-lg font-bold text-yellow-400">{batchProgress.needsReview}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {batches.length > 0 && (
                <div>
                  <label className="text-xs text-horror-text/60 mb-1.5 block">历史批次</label>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                    {batches.map((batch) => {
                      const isActive = activeBatchId === batch.id;
                      const completed = batch.jumpScareIds.filter(
                        (id) => batch.statuses[id] !== 'pending'
                      ).length;
                      return (
                        <button
                          key={batch.id}
                          onClick={() => setActiveBatchId(isActive ? null : batch.id)}
                          className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                            isActive
                              ? 'border-horror-accent bg-horror-accent/10'
                              : 'border-horror-border bg-horror-bg/30 hover:border-horror-border/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-horror-heading font-medium">{batch.name}</span>
                            <span className="text-horror-text/50">{completed}/{batch.jumpScareIds.length}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-horror-text/40">
                            <Clock className="w-3 h-3" />
                            {new Date(batch.createdAt).toLocaleDateString('zh-CN')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
              选择角色路线、难度和存档状态后，创建测试批次开始测试
            </p>
          </div>
        )}

        {allSelected && !activeBatchId && (
          <div className="bg-horror-panel/50 rounded-xl border border-horror-border border-dashed p-8 text-center">
            <Layers className="w-12 h-12 text-horror-accent mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-horror-heading mb-2">
              参数已选择，请创建测试批次
            </h3>
            <p className="text-horror-text/60 mb-4">
              共筛选出 <span className="text-horror-accent font-semibold">{filteredJumpScares.length}</span> 个跳吓镜头，点击右侧面板"创建测试批次"开始
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-horror-text/70">
              <span>角色: <strong className="text-horror-heading">{characters.find((c) => c.id === selectedRoute)?.name}</strong></span>
              <span className="text-horror-border">|</span>
              <span>难度: <strong className="text-horror-heading">{difficultyLabels[selectedDifficulty!]}</strong></span>
              <span className="text-horror-border">|</span>
              <span>存档: <strong className="text-horror-heading">{saveStateLabels[selectedSaveState!]}</strong></span>
            </div>
          </div>
        )}

        {allSelected && activeBatchId && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-horror-heading">
                  跳吓预演清单
                </h3>
                <p className="text-horror-text/60 mt-1">
                  共筛选出 <span className="text-horror-accent font-semibold">{filteredJumpScares.length}</span> 个跳吓镜头
                  {activeBatch && (
                    <span className="ml-2">
                      · 待测 <span className="text-horror-text">{batchProgress?.pending}</span>
                      · 通过 <span className="text-green-400">{batchProgress?.passed}</span>
                      · 需复查 <span className="text-yellow-400">{batchProgress?.needsReview}</span>
                    </span>
                  )}
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
