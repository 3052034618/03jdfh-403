import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Target, Clock, Move, Eye, CheckCircle2, Play, XCircle, HelpCircle } from 'lucide-react';
import type { JumpScare, TestItemStatus } from '../types';
import { CameraAngleBadge } from './Badges';
import { useApp } from '../store/AppContext';

interface JumpScarePreviewProps {
  jumpScare: JumpScare;
}

const statusConfig: Record<TestItemStatus, { icon: React.ReactNode; label: string; color: string; border: string }> = {
  pending: {
    icon: <HelpCircle className="w-4 h-4 text-horror-text/50 flex-shrink-0" />,
    label: '待测',
    color: 'text-horror-text/50',
    border: 'border-horror-border',
  },
  passed: {
    icon: <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />,
    label: '已通过',
    color: 'text-green-400',
    border: 'border-green-500/50',
  },
  needs_review: {
    icon: <XCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />,
    label: '需复查',
    color: 'text-yellow-400',
    border: 'border-yellow-500/50',
  },
};

const JumpScarePreview: React.FC<JumpScarePreviewProps> = ({ jumpScare }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { activeJumpScareId, setActiveJumpScareId, getBatchItemStatus, activeBatchId } = useApp();

  const isActive = activeJumpScareId === jumpScare.id;
  const batchStatus = activeBatchId ? getBatchItemStatus(jumpScare.id) : null;
  const status = batchStatus ? statusConfig[batchStatus] : null;

  const startPercent = (jumpScare.monsterWindow.start / 5) * 100;
  const durationPercent = (jumpScare.monsterWindow.duration / 5) * 100;

  const getChapterLabel = (chapter: string) => {
    const labels: Record<string, string> = {
      chapter1: '第一章：降临',
      chapter2: '第二章：真相',
      chapter3: '第三章：终结',
    };
    return labels[chapter] || chapter;
  };

  const borderColor = isActive
    ? 'border-horror-accent glow-red ring-1 ring-horror-accent/30'
    : status
    ? status.border
    : 'border-horror-border hover:border-horror-border/80';

  return (
    <div
      className={`bg-horror-panel rounded-xl border transition-all duration-300 overflow-hidden ${borderColor}`}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {status ? status.icon : <HelpCircle className="w-4 h-4 text-horror-text/50 flex-shrink-0" />}
              <h4 className="font-semibold text-horror-heading">{jumpScare.name}</h4>
              <span className="text-xs text-horror-text/50">{jumpScare.id}</span>
              {status && (
                <span className={`text-xs ${status.color} font-medium`}>{status.label}</span>
              )}
            </div>
            <p className="text-sm text-horror-text/70 ml-6 mb-2">{jumpScare.description}</p>
            <div className="flex items-center gap-2 ml-6 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded bg-horror-border/50 text-horror-text/70">
                {getChapterLabel(jumpScare.chapter)}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-horror-border/50 text-horror-text/70">
                {jumpScare.level}
              </span>
              <CameraAngleBadge angle={jumpScare.cameraAngle} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveJumpScareId(isActive ? null : jumpScare.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-horror-accent text-white'
                  : batchStatus === 'passed'
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : batchStatus === 'needs_review'
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-horror-border/50 text-horror-text hover:bg-horror-border hover:text-horror-heading'
              }`}
            >
              <Play className="w-3 h-3 inline mr-1" />
              {isActive ? '测试中' : batchStatus === 'passed' ? '已通过' : batchStatus === 'needs_review' ? '复查' : '开始测试'}
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-horror-text/50" />
            ) : (
              <ChevronDown className="w-5 h-5 text-horror-text/50" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-horror-border p-4 space-y-4 bg-horror-bg/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-horror-panel rounded-lg p-4 border border-horror-border">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-horror-accent" />
                <h5 className="font-medium text-horror-heading text-sm">触发前提</h5>
              </div>
              <p className="text-sm text-horror-text/80 mb-3">{jumpScare.triggerCondition}</p>
              <div className="space-y-1">
                <p className="text-xs text-horror-text/50 mb-1">前置条件：</p>
                {jumpScare.prerequisites.map((prereq, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-horror-text/70">
                    <span className="text-horror-accent mt-0.5">•</span>
                    <span>{prereq}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-horror-panel rounded-lg p-4 border border-horror-border">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-horror-accent2" />
                <h5 className="font-medium text-horror-heading text-sm">镜头朝向</h5>
              </div>
              <div className="mb-3">
                <CameraAngleBadge angle={jumpScare.cameraAngle} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-horror-text/50 mb-1">预期效果：</p>
                <p className="text-sm text-horror-text/80">{jumpScare.expectedResult}</p>
              </div>
            </div>

            <div className="bg-horror-panel rounded-lg p-4 border border-horror-border">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-horror-warning" />
                <h5 className="font-medium text-horror-heading text-sm">怪物出现窗口</h5>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-horror-text/60 mb-1">
                  <span>0s</span>
                  <span>5s</span>
                </div>
                <div className="relative h-6 bg-horror-border/30 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-horror-accent/30 rounded-full"
                    style={{
                      left: `${startPercent}%`,
                      width: `${durationPercent}%`,
                    }}
                  />
                  <div
                    className="absolute top-0 h-full w-1 bg-horror-accent rounded-full"
                    style={{ left: `${startPercent}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-1 bg-horror-accent rounded-full"
                    style={{ left: `${Math.min(startPercent + durationPercent, 100)}%` }}
                  />
                  {jumpScare.monsterWindow.criticalFrames.map((frame, idx) => {
                    const framePercent = ((jumpScare.monsterWindow.start + frame / 60) / 5) * 100;
                    return (
                      <div
                        key={idx}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                        style={{ left: `${framePercent}%` }}
                        title={`关键帧 ${frame}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-horror-text/60">
                    开始: <span className="text-horror-heading">{jumpScare.monsterWindow.start}s</span>
                  </span>
                  <span className="text-horror-text/60">
                    持续: <span className="text-horror-heading">{jumpScare.monsterWindow.duration}s</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-horror-text/70">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                  关键帧: {jumpScare.monsterWindow.criticalFrames.join(', ')}
                </span>
              </div>
            </div>

            <div className="bg-horror-panel rounded-lg p-4 border border-horror-border">
              <div className="flex items-center gap-2 mb-3">
                <Move className="w-4 h-4 text-horror-success" />
                <h5 className="font-medium text-horror-heading text-sm">允许的玩家偏离范围</h5>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-horror-text/60">位置偏移</span>
                    <span className="text-horror-heading">{jumpScare.allowedDeviation.position}m</span>
                  </div>
                  <div className="h-2 bg-horror-border/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                      style={{ width: `${Math.min(jumpScare.allowedDeviation.position * 50, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-horror-text/60">旋转偏移</span>
                    <span className="text-horror-heading">{jumpScare.allowedDeviation.rotation}°</span>
                  </div>
                  <div className="h-2 bg-horror-border/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                      style={{ width: `${Math.min((jumpScare.allowedDeviation.rotation / 90) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-horror-text/60">速度偏移</span>
                    <span className="text-horror-heading">{jumpScare.allowedDeviation.speed}m/s</span>
                  </div>
                  <div className="h-2 bg-horror-border/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                      style={{ width: `${Math.min(jumpScare.allowedDeviation.speed * 25, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {jumpScare.notes && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400/80">
                <span className="font-semibold">备注：</span>{jumpScare.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JumpScarePreview;
