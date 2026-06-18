import React, { useState, useEffect } from 'react';
import { CheckSquare, EyeOff, MessageSquare, Gauge, Send, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { JumpScare, TestResult, IssueType, Severity, TestCheckItem } from '../types';
import { useApp } from '../store/AppContext';
import { SeverityBadge, IssueTypeBadge } from './Badges';

interface TestChecklistProps {
  jumpScares: JumpScare[];
}

const issueTypes: { id: IssueType; label: string; icon: string }[] = [
  { id: 'not_triggered', label: '未触发', icon: '❌' },
  { id: 'obscured', label: '被遮挡', icon: '🚫' },
  { id: 'distracted', label: '注意力分散', icon: '💬' },
  { id: 'low_fps', label: '低帧率', icon: '📉' },
  { id: 'timing', label: '时机问题', icon: '⏱️' },
  { id: 'other', label: '其他', icon: '❗' },
];

const severities: { id: Severity; label: string; icon: string }[] = [
  { id: 'critical', label: '严重', icon: '🔴' },
  { id: 'high', label: '高', icon: '🟠' },
  { id: 'medium', label: '中', icon: '🟡' },
  { id: 'low', label: '低', icon: '🔵' },
];

const checkItems = [
  {
    key: 'triggered' as const,
    label: '成功触发',
    icon: CheckSquare,
    color: 'text-green-400',
    description: '跳吓镜头是否按照预期成功触发',
  },
  {
    key: 'obscured' as const,
    label: '被家具遮挡',
    icon: EyeOff,
    color: 'text-purple-400',
    description: '怪物或关键画面是否被场景中的家具、道具遮挡',
  },
  {
    key: 'distracted' as const,
    label: '注意力分散',
    icon: MessageSquare,
    color: 'text-cyan-400',
    description: '是否有字幕、交互提示或其他UI元素分散了玩家注意力',
  },
  {
    key: 'lowFps' as const,
    label: '低帧率错过',
    icon: Gauge,
    color: 'text-pink-400',
    description: '是否因帧率过低而错过了关键帧或QTE',
  },
];

const TestChecklist: React.FC<TestChecklistProps> = ({ jumpScares }) => {
  const {
    activeJumpScareId,
    currentTestChecks,
    updateTestCheck,
    addTestResult,
    selectedRoute,
    selectedDifficulty,
    selectedSaveState,
    activeBatchId,
    batches,
    updateBatchItemStatus,
    testerId,
  } = useApp();

  const [showSuccess, setShowSuccess] = useState(false);
  const [quickResult, setQuickResult] = useState<'pass' | 'fail' | null>(null);

  const activeJumpScare = jumpScares.find((js) => js.id === activeJumpScareId);
  const checks = activeJumpScareId ? currentTestChecks[activeJumpScareId] : null;

  const activeBatch = batches.find((b) => b.id === activeBatchId);
  const batchStatus = activeJumpScareId && activeBatch
    ? activeBatch.statuses[activeJumpScareId]
    : undefined;

  useEffect(() => {
    if (activeJumpScareId) {
      setQuickResult(null);
    }
  }, [activeJumpScareId]);

  const handleCheckboxChange = (field: keyof TestCheckItem, value: boolean) => {
    if (!activeJumpScareId) return;
    updateTestCheck(activeJumpScareId, { [field]: value });
  };

  const handleQuickPass = () => {
    if (!activeJumpScareId) return;
    updateTestCheck(activeJumpScareId, {
      triggered: true,
      obscured: false,
      distracted: false,
      lowFps: false,
      notes: '',
    });
    setQuickResult('pass');
  };

  const handleQuickFail = () => {
    if (!activeJumpScareId) return;
    updateTestCheck(activeJumpScareId, {
      triggered: false,
      obscured: false,
      distracted: false,
      lowFps: false,
      notes: '',
    });
    setQuickResult('fail');
  };

  const handleIssueTypeChange = (issueType: IssueType | undefined) => {
    if (!activeJumpScareId) return;
    updateTestCheck(activeJumpScareId, { issueType });
  };

  const handleSeverityChange = (severity: Severity | undefined) => {
    if (!activeJumpScareId) return;
    updateTestCheck(activeJumpScareId, { severity });
  };

  const handleSubmit = () => {
    if (!activeJumpScareId || !checks || !selectedRoute || !selectedDifficulty || !selectedSaveState) return;

    const passed = checks.triggered && !checks.obscured && !checks.distracted && !checks.lowFps;

    const result: TestResult = {
      id: `result-${Date.now()}`,
      jumpScareId: activeJumpScareId,
      tester: testerId,
      timestamp: new Date(),
      route: selectedRoute,
      difficulty: selectedDifficulty,
      saveState: selectedSaveState,
      checks: {
        triggered: checks.triggered,
        obscured: checks.obscured,
        distracted: checks.distracted,
        lowFps: checks.lowFps,
        notes: checks.notes,
        issueType: checks.issueType,
        severity: checks.severity,
      },
      passed,
      batchId: activeBatchId || undefined,
    };

    addTestResult(result);

    if (activeBatchId) {
      const newStatus = passed ? 'passed' : 'needs_review';
      updateBatchItemStatus(activeBatchId, activeJumpScareId, newStatus);
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
    setQuickResult(null);
  };

  const canSubmit = checks !== null;

  const completedCount = jumpScares.filter((js) => {
    if (!activeBatch) return false;
    const s = activeBatch.statuses[js.id];
    return s === 'passed' || s === 'needs_review';
  }).length;
  const progressPercent = jumpScares.length > 0 ? (completedCount / jumpScares.length) * 100 : 0;

  return (
    <div className="bg-horror-panel rounded-xl border border-horror-border sticky top-24">
      <div className="p-4 border-b border-horror-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-horror-heading">测试勾选面板</h3>
          {activeBatch && (
            <span className="text-xs text-horror-accent2 bg-horror-accent2/10 px-2 py-0.5 rounded">
              批次: {activeBatch.name}
            </span>
          )}
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-horror-text/60">批次进度</span>
            <span className="text-horror-heading font-medium">
              {completedCount} / {jumpScares.length}
            </span>
          </div>
          <div className="h-2 bg-horror-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-horror-accent to-horror-accent2 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="absolute inset-0 bg-horror-panel/95 flex items-center justify-center z-10 animate-flicker rounded-xl">
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
            <p className="text-horror-heading font-medium">测试记录已提交</p>
          </div>
        </div>
      )}

      {!activeJumpScare ? (
        <div className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-horror-warning mx-auto mb-4 opacity-50" />
          <p className="text-horror-text/70">
            点击左侧跳吓卡片的"开始测试"按钮
            <br />
            开始逐项测试
          </p>
        </div>
      ) : batchStatus === 'passed' || batchStatus === 'needs_review' ? (
        <div className="p-8 text-center">
          {batchStatus === 'passed' ? (
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          )}
          <p className="text-horror-heading font-medium mb-2">
            {activeJumpScare.name}
          </p>
          <p className="text-horror-text/70 text-sm">
            {batchStatus === 'passed' ? '已通过测试' : '需复查'}
          </p>
          <p className="text-horror-text/50 text-xs mt-4">
            可点击"开始测试"重新测试此跳吓
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          <div className="bg-horror-bg/50 rounded-lg p-3 border border-horror-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-horror-text/50">{activeJumpScare.id}</span>
            </div>
            <h4 className="font-semibold text-horror-heading">{activeJumpScare.name}</h4>
            <p className="text-sm text-horror-text/70 mt-1">{activeJumpScare.description}</p>
          </div>

          {quickResult === null && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-horror-heading">快速判定</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleQuickPass}
                  className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/5 hover:bg-green-500/15 hover:border-green-500/50 transition-all text-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <span className="text-sm font-semibold text-green-400">成功触发</span>
                  <p className="text-xs text-horror-text/50 mt-1">跳吓正常触发，无遮挡/分散问题</p>
                </button>
                <button
                  onClick={handleQuickFail}
                  className="p-4 rounded-lg border-2 border-red-500/30 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/50 transition-all text-center"
                >
                  <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <span className="text-sm font-semibold text-red-400">存在问题</span>
                  <p className="text-xs text-horror-text/50 mt-1">未触发/遮挡/分散/低帧率</p>
                </button>
              </div>
            </div>
          )}

          {quickResult === 'pass' && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-sm text-green-400">
                ✓ 跳吓成功触发，无其他问题。可直接提交。
              </p>
            </div>
          )}

          {quickResult === 'fail' && (
            <div className="space-y-3">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400">
                  ✗ 检测到问题，请在下方勾选具体问题项
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-horror-heading">问题项</p>
                {checkItems.map((item) => {
                  const Icon = item.icon;
                  const isChecked = checks?.[item.key] || false;
                  if (item.key === 'triggered') {
                    return (
                      <label
                        key={item.key}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-green-500/50 bg-green-500/10'
                            : 'border-horror-border bg-horror-bg/30 hover:border-horror-border/80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(item.key, e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-horror-border text-horror-accent focus:ring-horror-accent focus:ring-offset-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${item.color}`} />
                            <span className={`font-medium ${isChecked ? 'text-horror-heading' : 'text-horror-text'}`}>
                              {item.label}
                            </span>
                          </div>
                          <p className="text-xs text-horror-text/50 mt-0.5">{item.description}</p>
                        </div>
                      </label>
                    );
                  }
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-horror-accent/50 bg-horror-accent/10'
                          : 'border-horror-border bg-horror-bg/30 hover:border-horror-border/80'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(item.key, e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-horror-border text-horror-accent focus:ring-horror-accent focus:ring-offset-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                          <span className={`font-medium ${isChecked ? 'text-horror-heading' : 'text-horror-text'}`}>
                            {item.label}
                          </span>
                        </div>
                        <p className="text-xs text-horror-text/50 mt-0.5">{item.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-horror-heading mb-2">问题类型</p>
                  <div className="grid grid-cols-2 gap-2">
                    {issueTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleIssueTypeChange(checks?.issueType === type.id ? undefined : type.id)}
                        className={`p-2 rounded-lg border text-xs text-left transition-all ${
                          checks?.issueType === type.id
                            ? 'border-horror-accent bg-horror-accent/20 text-horror-heading'
                            : 'border-horror-border bg-horror-bg/30 text-horror-text/70 hover:border-horror-border/80'
                        }`}
                      >
                        <span className="mr-1">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-horror-heading mb-2">严重程度</p>
                  <div className="grid grid-cols-4 gap-2">
                    {severities.map((sev) => (
                      <button
                        key={sev.id}
                        onClick={() => handleSeverityChange(checks?.severity === sev.id ? undefined : sev.id)}
                        className={`p-2 rounded-lg border text-xs text-center transition-all ${
                          checks?.severity === sev.id
                            ? 'border-horror-accent bg-horror-accent/20'
                            : 'border-horror-border bg-horror-bg/30 hover:border-horror-border/80'
                        }`}
                      >
                        <div className="text-lg">{sev.icon}</div>
                        <div className="mt-1">{sev.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-horror-heading mb-2 block">
                  测试备注（可选）
                </label>
                <textarea
                  value={checks?.notes || ''}
                  onChange={(e) => {
                    if (!activeJumpScareId) return;
                    updateTestCheck(activeJumpScareId, { notes: e.target.value });
                  }}
                  placeholder="补充描述发现的问题..."
                  className="w-full h-20 px-3 py-2 bg-horror-bg/50 border border-horror-border rounded-lg text-sm text-horror-text placeholder:text-horror-text/30 focus:outline-none focus:border-horror-accent/50 focus:ring-1 focus:ring-horror-accent/30 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                {checks?.issueType && <IssueTypeBadge type={checks.issueType} />}
                {checks?.severity && <SeverityBadge severity={checks.severity} />}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 px-4 bg-gradient-to-r from-horror-accent to-horror-accent/80 text-white font-medium rounded-lg transition-all hover:from-horror-accent/90 hover:to-horror-accent/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            提交测试结果
          </button>
        </div>
      )}
    </div>
  );
};

export default TestChecklist;
