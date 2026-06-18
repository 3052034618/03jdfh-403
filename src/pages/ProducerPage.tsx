import React, { useMemo, useState } from 'react';
import {
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { producerInsights } from '../data/insights';
import { characters } from '../data/characters';
import { difficultyLabels } from '../data/chapters';
import { useApp } from '../store/AppContext';
import { SeverityBadge } from '../components/Badges';

const ProducerPage: React.FC = () => {
  const { testResults } = useApp();
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const overallStats = useMemo(() => {
    const total = testResults.length;
    const passed = testResults.filter((r) => r.passed).length;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    const criticalCount = producerInsights.filter((i) => i.severity === 'critical').length;
    const highCount = producerInsights.filter((i) => i.severity === 'high').length;

    return {
      total,
      passed,
      passRate,
      criticalCount,
      highCount,
      totalInsights: producerInsights.length,
    };
  }, [testResults]);

  const filteredInsights = useMemo(() => {
    if (categoryFilter === 'all') return producerInsights;
    return producerInsights.filter((i) => i.category === categoryFilter);
  }, [categoryFilter]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; critical: number; high: number }> = {};
    producerInsights.forEach((insight) => {
      if (!stats[insight.category]) {
        stats[insight.category] = { count: 0, critical: 0, high: 0 };
      }
      stats[insight.category].count++;
      if (insight.severity === 'critical') stats[insight.category].critical++;
      if (insight.severity === 'high') stats[insight.category].high++;
    });
    return stats;
  }, []);

  const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
    pathing: { label: '路径问题', icon: '🗺️', color: 'text-blue-400' },
    timing: { label: '时机问题', icon: '⏱️', color: 'text-orange-400' },
    fatigue: { label: '情感疲劳', icon: '😫', color: 'text-purple-400' },
    visibility: { label: '可见性', icon: '👁️', color: 'text-cyan-400' },
    immersion: { label: '沉浸感', icon: '🎭', color: 'text-pink-400' },
  };

  const getHealthColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    if (rate >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthBg = (rate: number) => {
    if (rate >= 80) return 'from-green-500 to-green-400';
    if (rate >= 60) return 'from-yellow-500 to-yellow-400';
    if (rate >= 40) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-horror-accent2/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-horror-accent2" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-horror-heading">制作人视图</h2>
              <p className="text-horror-text/70 text-sm">
                数据驱动的体验诊断，助力上线前集中修正
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-horror-text/60">整体通过率</span>
              {overallStats.passRate >= 60 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${getHealthColor(overallStats.passRate)}`}>
                {overallStats.passRate.toFixed(0)}%
              </span>
              <span className="text-sm text-horror-text/50 mb-1">
                ({overallStats.passed}/{overallStats.total})
              </span>
            </div>
            <div className="mt-3 h-2 bg-horror-border/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getHealthBg(overallStats.passRate)}`}
                style={{ width: `${overallStats.passRate}%` }}
              />
            </div>
          </div>

          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-horror-text/60">严重问题</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-4xl font-bold text-red-400">{overallStats.criticalCount}</div>
            <p className="text-xs text-horror-text/50 mt-2">需要立即修复的阻断性问题</p>
          </div>

          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-horror-text/60">高优先级</span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-4xl font-bold text-orange-400">{overallStats.highCount}</div>
            <p className="text-xs text-horror-text/50 mt-2">建议本周内修复的问题</p>
          </div>

          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-horror-text/60">待处理洞察</span>
              <Lightbulb className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-4xl font-bold text-yellow-400">{overallStats.totalInsights}</div>
            <p className="text-xs text-horror-text/50 mt-2">已识别的体验优化点</p>
          </div>
        </div>

        <div className="bg-horror-panel rounded-xl border border-horror-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-horror-heading mb-4">问题分类概览</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`p-4 rounded-lg border text-left transition-all ${
                categoryFilter === 'all'
                  ? 'border-horror-accent bg-horror-accent/10'
                  : 'border-horror-border bg-horror-bg/30 hover:border-horror-border/80'
              }`}
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-horror-heading">全部</div>
              <div className="text-2xl font-bold text-horror-heading mt-1">{producerInsights.length}</div>
            </button>
            {Object.entries(categoryStats).map(([category, stats]) => {
              const config = categoryLabels[category];
              return (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    categoryFilter === category
                      ? 'border-horror-accent bg-horror-accent/10'
                      : 'border-horror-border bg-horror-bg/30 hover:border-horror-border/80'
                  }`}
                >
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <div className={`font-medium ${config.color}`}>{config.label}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-horror-heading">{stats.count}</span>
                    {stats.critical > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                        {stats.critical}严重
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {filteredInsights.map((insight) => {
            const isExpanded = expandedInsight === insight.id;
            const categoryConfig = categoryLabels[insight.category];
            const affectedCharNames = insight.affectedRoutes
              .map((r) => characters.find((c) => c.id === r)?.name)
              .filter(Boolean);
            const affectedDiffNames = insight.affectedDifficulties.map((d) => difficultyLabels[d]);

            return (
              <div
                key={insight.id}
                className={`bg-horror-panel rounded-xl border transition-all overflow-hidden ${
                  insight.severity === 'critical'
                    ? 'border-red-500/50 shadow-lg shadow-red-500/10'
                    : insight.severity === 'high'
                    ? 'border-orange-500/30'
                    : 'border-horror-border'
                }`}
              >
                <div
                  className="p-5 cursor-pointer hover:bg-horror-bg/20 transition-colors"
                  onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{categoryConfig.icon}</span>
                        <SeverityBadge severity={insight.severity} />
                        <span className={`text-sm ${categoryConfig.color}`}>{categoryConfig.label}</span>
                        <span className="text-xs text-horror-text/50">{insight.id}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-horror-heading mb-2">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-horror-text/70 line-clamp-2">{insight.description}</p>

                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-horror-text/50" />
                          <span className="text-horror-text/70">
                            影响: {affectedCharNames.join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-horror-text/50" />
                          <span className="text-horror-text/70">
                            难度: {affectedDiffNames.join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-horror-text/50" />
                          <span className="text-horror-text/70">
                            {insight.testCount} 次测试
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 font-medium ${
                            insight.failureRate > 60
                              ? 'text-red-400'
                              : insight.failureRate > 30
                              ? 'text-orange-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {insight.failureRate > 60 ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          失败率 {insight.failureRate}%
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-horror-border/30"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray={`${(insight.failureRate / 100) * 176} 176`}
                            className={
                              insight.failureRate > 60
                                ? 'text-red-500'
                                : insight.failureRate > 30
                                ? 'text-orange-500'
                                : 'text-yellow-500'
                            }
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-horror-heading">
                            {insight.failureRate}%
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-horror-text/50" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-horror-text/50" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-horror-border p-5 bg-horror-bg/30">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-semibold text-horror-heading mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400" />
                          问题详述
                        </h5>
                        <p className="text-sm text-horror-text/80 leading-relaxed">
                          {insight.description}
                        </p>

                        <div className="mt-4">
                          <h6 className="text-xs font-medium text-horror-text/60 mb-2">证据链</h6>
                          <div className="space-y-1.5">
                            {insight.evidence.map((ev, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-xs text-horror-text/70"
                              >
                                <span className="text-horror-accent">•</span>
                                <span>{ev}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-horror-heading mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          修复建议
                        </h5>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                          <p className="text-sm text-yellow-200/90 leading-relaxed">
                            {insight.recommendation}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <button className="flex-1 py-2 px-4 bg-horror-accent text-white text-sm font-medium rounded-lg hover:bg-horror-accent/90 transition-colors flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            标记为已处理
                          </button>
                          <button className="py-2 px-4 bg-horror-border/50 text-horror-text text-sm font-medium rounded-lg hover:bg-horror-border transition-colors flex items-center justify-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            查看详情
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-gradient-to-r from-horror-accent/20 to-horror-accent2/20 rounded-xl border border-horror-accent/30 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-horror-accent/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-horror-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-horror-heading mb-2">
                上线前修复优先级建议
              </h3>
              <div className="space-y-2 text-sm text-horror-text/80">
                <p className="flex items-start gap-2">
                  <span className="text-red-400 font-semibold">1.</span>
                  <span>
                    <strong className="text-red-400">紧急修复：</strong>
                    2个严重问题（二周目绕路穿模、低帧率QTE）需要在上线前2周完成修复和回归测试
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-orange-400 font-semibold">2.</span>
                  <span>
                    <strong className="text-orange-400">高优先级：</strong>
                    3个高优先级问题（追逐疲劳、字幕遮挡、触发范围）建议在上线前1周完成
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-yellow-400 font-semibold">3.</span>
                  <span>
                    <strong className="text-yellow-400">中优先级：</strong>
                    2个中优先级问题可以考虑在后续热修复中更新，或作为Day One补丁
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-400 font-semibold">4.</span>
                  <span>
                    <strong className="text-blue-400">低优先级：</strong>
                    1个低优先级问题（电量门槛）可作为次要优化项，或在DLC中改进
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerPage;
