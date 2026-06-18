import React from 'react';
import type { Severity, IssueType, CameraAngle } from '../types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const configs = {
    critical: {
      bg: 'bg-red-900/40',
      border: 'border-red-500/50',
      text: 'text-red-400',
      label: '严重',
      dot: 'bg-red-500',
    },
    high: {
      bg: 'bg-orange-900/40',
      border: 'border-orange-500/50',
      text: 'text-orange-400',
      label: '高',
      dot: 'bg-orange-500',
    },
    medium: {
      bg: 'bg-yellow-900/40',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      label: '中',
      dot: 'bg-yellow-500',
    },
    low: {
      bg: 'bg-blue-900/40',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      label: '低',
      dot: 'bg-blue-500',
    },
  };

  const config = configs[severity];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-md ${config.bg} ${config.border} border ${config.text} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
};

interface IssueTypeBadgeProps {
  type: IssueType;
}

export const IssueTypeBadge: React.FC<IssueTypeBadgeProps> = ({ type }) => {
  const configs: Record<IssueType, { label: string; className: string }> = {
    not_triggered: {
      label: '未触发',
      className: 'bg-gray-800/60 text-gray-300 border-gray-600/50',
    },
    obscured: {
      label: '被遮挡',
      className: 'bg-purple-900/40 text-purple-300 border-purple-500/50',
    },
    distracted: {
      label: '注意力分散',
      className: 'bg-cyan-900/40 text-cyan-300 border-cyan-500/50',
    },
    low_fps: {
      label: '低帧率',
      className: 'bg-pink-900/40 text-pink-300 border-pink-500/50',
    },
    timing: {
      label: '时机问题',
      className: 'bg-amber-900/40 text-amber-300 border-amber-500/50',
    },
    other: {
      label: '其他',
      className: 'bg-slate-800/60 text-slate-300 border-slate-600/50',
    },
  };

  const config = configs[type];

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs rounded-md border font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

interface CameraAngleBadgeProps {
  angle: CameraAngle;
}

export const CameraAngleBadge: React.FC<CameraAngleBadgeProps> = ({ angle }) => {
  const configs: Record<CameraAngle, { label: string; icon: string }> = {
    first_person: { label: '第一人称', icon: '👁️' },
    over_shoulder: { label: '越肩视角', icon: '🎥' },
    fixed: { label: '固定镜头', icon: '📹' },
    cinematic: { label: '电影镜头', icon: '🎬' },
  };

  const config = configs[angle];

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-horror-border/50 text-horror-text border border-horror-border">
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

interface StatusBadgeProps {
  passed: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ passed }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium ${
      passed
        ? 'bg-green-900/40 text-green-400 border border-green-500/50'
        : 'bg-red-900/40 text-red-400 border border-red-500/50'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`} />
      {passed ? '通过' : '失败'}
    </span>
  );
};
