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
  Skull,
  Zap,
  BarChart3,
  ShieldAlert,
  Layers,
  Activity,
  Target,
  AlertOctagon,
} from 'lucide-react';
import { producerInsights } from '../data/insights';
import { characters } from '../data/characters';
import { difficultyLabels, saveStateLabels } from '../data/chapters';
import { useApp } from '../store/AppContext';
import type { ReviewFilterState } from '../store/AppContext';
import { jumpScares } from '../data/jumpScares';
import { SeverityBadge } from '../components/Badges';
import type { Severity, IssueType } from '../types';

const ProducerPage: React.FC = () => {
  const { testResults, batches, navigateToReview } = useApp();
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const overallStats = useMemo(() => {
    const total = testResults.length;
    const passed = testResults.filter((r) => r.passed).length;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    return { total, passed, passRate };
  }, [testResults]);

  const failureRateByJumpScare = useMemo(() => {
    const byId: Record<string, { name: string; total: number; failed: number; rate: number }> = {};
    testResults.forEach((r) => {
      if (!byId[r.jumpScareId]) {
        const js = jumpScares.find((j) => j.id === r.jumpScareId);
        byId[r.jumpScareId] = { name: js?.name || r.jumpScareId, total: 0, failed: 0, rate: 0 };
      }
      byId[r.jumpScareId].total++;
      if (!r.passed) byId[r.jumpScareId].failed++;
    });
    Object.values(byId).forEach((v) => {
      v.rate = v.total > 0 ? Math.round((v.failed / v.total) * 100) : 0;
    });
    return Object.entries(byId)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.rate - a.rate);
  }, [testResults]);

  const issueTypeDistribution = useMemo(() => {
    const dist: Record<IssueType, number> = {
      not_triggered: 0, obscured: 0, distracted: 0, low_fps: 0, timing: 0, other: 0,
    };
    testResults.forEach((r) => {
      if (r.checks.issueType) dist[r.checks.issueType]++;
    });
    return Object.entries(dist)
      .map(([type, count]) => ({ type: type as IssueType, count }))
      .sort((a, b) => b.count - a.count);
  }, [testResults]);

  const severityDistribution = useMemo(() => {
    const dist: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    testResults.forEach((r) => {
      if (r.checks.severity) dist[r.checks.severity]++;
    });
    return dist;
  }, [testResults]);

  const dynamicPriorityList = useMemo(() => {
    const priorities: {
      jumpScareId: string;
      name: string;
      failureRate: number;
      topIssue: IssueType | null;
      topSeverity: Severity | null;
      totalTests: number;
      rank: number;
    }[] = [];

    failureRateByJumpScare.forEach((item, idx) => {
      if (item.failed === 0) return;
      const relatedResults = testResults.filter((r) => r.jumpScareId === item.id);
      const issueCounts: Record<string, number> = {};
      let topSeverity: Severity | null = null;
      let sevPriority: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
      relatedResults.forEach((r) => {
        if (r.checks.issueType) issueCounts[r.checks.issueType] = (issueCounts[r.checks.issueType] || 0) + 1;
        if (r.checks.severity) sevPriority[r.checks.severity]++;
      });
      const topIssue = Object.entries(issueCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as IssueType | null;
      for (const [sev, count] of Object.entries(sevPriority)) {
        if (count > 0 && (!topSeverity || sevPriority[sev as Severity] > sevPriority[topSeverity])) {
          topSeverity = sev as Severity;
        }
      }
      priorities.push({
        jumpScareId: item.id,
        name: item.name,
        failureRate: item.rate,
        topIssue,
        topSeverity,
        totalTests: item.total,
        rank: idx + 1,
      });
    });

    return priorities;
  }, [testResults, failureRateByJumpScare]);

  const batchCompletionCards = useMemo(() => {
    return batches.map(batch => {
      const total = batch.jumpScareIds.length;
      const passed = batch.jumpScareIds.filter(id => batch.statuses[id] === 'passed').length;
      const needsReview = batch.jumpScareIds.filter(id => batch.statuses[id] === 'needs_review').length;
      const pending = batch.jumpScareIds.filter(id => batch.statuses[id] === 'pending').length;
      const completionRate = total > 0 ? Math.round(((passed + needsReview) / total) * 100) : 0;
      const passRate = (passed + needsReview) > 0 ? Math.round((passed / (passed + needsReview)) * 100) : 0;
      const batchResults = testResults.filter(r => r.batchId === batch.id);
      const criticalCount = batchResults.filter(r => r.checks.severity === 'critical').length;
      const highCount = batchResults.filter(r => r.checks.severity === 'high').length;
      return {
        id: batch.id,
        name: batch.name,
        route: characters.find(c => c.id === batch.route)?.name || batch.route,
        difficulty: difficultyLabels[batch.difficulty],
        saveState: saveStateLabels[batch.saveState],
        createdAt: batch.createdAt,
        tester: batch.tester,
        total,
        passed,
        needsReview,
        pending,
        completionRate,
        passRate,
        criticalCount,
        highCount,
        severeIssueCount: criticalCount + highCount,
      };
    });
  }, [batches, testResults]);

  const severityTrend = useMemo(() => {
    const sortedBatches = [...batches].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    if (sortedBatches.length === 0 && testResults.length === 0) return [];
    const trend: { label: string; critical: number; high: number; medium: number; low: number; total: number }[] = [];
    if (sortedBatches.length > 0) {
      sortedBatches.forEach(batch => {
        const batchResults = testResults.filter(r => r.batchId === batch.id);
        trend.push({
          label: batch.name,
          critical: batchResults.filter(r => r.checks.severity === 'critical').length,
          high: batchResults.filter(r => r.checks.severity === 'high').length,
          medium: batchResults.filter(r => r.checks.severity === 'medium').length,
          low: batchResults.filter(r => r.checks.severity === 'low').length,
          total: batchResults.length,
        });
      });
    }
    const noBatchResults = testResults.filter(r => !r.batchId);
    if (noBatchResults.length > 0) {
      trend.push({
        label: '无批次记录',
        critical: noBatchResults.filter(r => r.checks.severity === 'critical').length,
        high: noBatchResults.filter(r => r.checks.severity === 'high').length,
        medium: noBatchResults.filter(r => r.checks.severity === 'medium').length,
        low: noBatchResults.filter(r => r.checks.severity === 'low').length,
        total: noBatchResults.length,
      });
    }
    return trend;
  }, [batches, testResults]);

  const consecutiveFailureCards = useMemo(() => {
    const jsIds = [...new Set(testResults.map(r => r.jumpScareId))];
    return jsIds
      .map(jsId => {
        const jsResults = testResults
          .filter(r => r.jumpScareId === jsId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        let consecutiveFails = 0;
        for (const r of jsResults) {
          if (!r.passed) consecutiveFails++;
          else break;
        }
        const js = jumpScares.find(j => j.id === jsId);
        const totalFailures = jsResults.filter(r => !r.passed).length;
        const topIssue = (() => {
          const counts: Record<string, number> = {};
          jsResults.filter(r => !r.passed && r.checks.issueType).forEach(r => {
            counts[r.checks.issueType!] = (counts[r.checks.issueType!] || 0) + 1;
          });
          return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;
        })();
        return {
          jumpScareId: jsId,
          name: js?.name || jsId,
          consecutiveFails,
          totalFailures,
          totalTests: jsResults.length,
          topIssue: topIssue as IssueType | null,
          routes: [...new Set(jsResults.filter(r => !r.passed).map(r => r.route))],
        };
      })
      .filter(item => item.consecutiveFails >= 2)
      .sort((a, b) => b.consecutiveFails - a.consecutiveFails);
  }, [testResults]);

  const filteredInsights = useMemo(() => {
    if (categoryFilter === 'all') return producerInsights;
    return producerInsights.filter((i) => i.category === categoryFilter);
  }, [categoryFilter]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; critical: number; high: number }> = {};
    producerInsights.forEach((insight) => {
      if (!stats[insight.category]) stats[insight.category] = { count: 0, critical: 0, high: 0 };
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

  const issueTypeLabels: Record<IssueType, { label: string; icon: string; color: string }> = {
    not_triggered: { label: '未触发', icon: '❌', color: 'text-gray-300' },
    obscured: { label: '被遮挡', icon: '🚫', color: 'text-purple-300' },
    distracted: { label: '注意力分散', icon: '💬', color: 'text-cyan-300' },
    low_fps: { label: '低帧率', icon: '📉', color: 'text-pink-300' },
    timing: { label: '时机问题', icon: '⏱️', color: 'text-amber-300' },
    other: { label: '其他', icon: '❗', color: 'text-slate-300' },
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

  const handleNavigateToReview = (filters: ReviewFilterState) => {
    navigateToReview(filters);
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
              <p className="text-horror-text/70 text-sm">数据驱动的体验诊断，助力上线前集中修正</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-horror-text/60">整体通过率</span>
              {overallStats.passRate >= 60 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${getHealthColor(overallStats.passRate)}`}>{overallStats.passRate.toFixed(0)}%</span>
              <span className="text-sm text-horror-text/50 mb-1">({overallStats.passed}/{overallStats.total})</span>
            </div>
            <div className="mt-3 h-2 bg-horror-border/30 rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${getHealthBg(overallStats.passRate)}`} style={{ width: `${overallStats.passRate}%` }} />
            </div>
          </div>
          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-horror-text/60">严重问题</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-4xl font-bold text-red-400">{severityDistribution.critical}</div>
            <p className="text-xs text-horror-text/50 mt-2">需要立即修复的阻断性问题</p>
          </div>
          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-horror-text/60">高优先级</span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-4xl font-bold text-orange-400">{severityDistribution.high}</div>
            <p className="text-xs text-horror-text/50 mt-2">建议本周内修复的问题</p>
          </div>
          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-horror-text/60">待处理洞察</span>
              <Lightbulb className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-4xl font-bold text-yellow-400">{producerInsights.length + dynamicPriorityList.length}</div>
            <p className="text-xs text-horror-text/50 mt-2">预置 + 动态汇总</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-bold text-horror-heading">上线风险看板</h3>
          </div>
          <p className="text-sm text-horror-text/60 mb-4">实时监控批次进度、问题趋势和连续失败，点击卡片跳转复盘页查看详情</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-horror-accent" />
                <h4 className="text-sm font-semibold text-horror-heading">批次完成度</h4>
              </div>
              {batchCompletionCards.length === 0 ? (
                <p className="text-sm text-horror-text/50 text-center py-6">暂无批次数据</p>
              ) : (
                <div className="space-y-3">
                  {batchCompletionCards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => handleNavigateToReview({ batchId: card.id })}
                      className="w-full text-left p-3 bg-horror-bg/50 rounded-lg border border-horror-border/50 hover:border-horror-accent/50 hover:bg-horror-accent/5 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-horror-heading">{card.name}</span>
                        <span className={`text-xs font-bold ${card.completionRate === 100 ? 'text-green-400' : card.completionRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {card.completionRate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-horror-border/30 rounded-full overflow-hidden mb-2">
                        <div className="flex h-full">
                          <div className="bg-green-500 h-full" style={{ width: `${(card.passed / card.total) * 100}%` }} />
                          <div className="bg-yellow-500 h-full" style={{ width: `${(card.needsReview / card.total) * 100}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-horror-text/50">
                        <span>{card.route} · {card.difficulty}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">{card.passed}通过</span>
                          <span className="text-yellow-400">{card.needsReview}复查</span>
                          <span>{card.pending}待测</span>
                        </div>
                      </div>
                      {card.severeIssueCount > 0 && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                          <AlertOctagon className="w-3 h-3" />
                          {card.severeIssueCount} 个严重/高优先级问题
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-400" />
                <h4 className="text-sm font-semibold text-horror-heading">严重问题趋势</h4>
              </div>
              {severityTrend.length === 0 ? (
                <p className="text-sm text-horror-text/50 text-center py-6">暂无趋势数据</p>
              ) : (
                <div className="space-y-3">
                  {severityTrend.map((item, idx) => {
                    const maxTotal = Math.max(...severityTrend.map(t => t.total), 1);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleNavigateToReview({
                          severity: item.critical > 0 ? 'critical' : item.high > 0 ? 'high' : undefined,
                        })}
                        className="w-full text-left p-3 bg-horror-bg/50 rounded-lg border border-horror-border/50 hover:border-horror-accent/50 hover:bg-horror-accent/5 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-horror-heading truncate mr-2">{item.label}</span>
                          <span className="text-xs text-horror-text/50">{item.total} 条</span>
                        </div>
                        <div className="h-3 bg-horror-border/30 rounded-full overflow-hidden flex">
                          <div className="bg-red-500 h-full" style={{ width: `${(item.critical / maxTotal) * 100}%` }} title={`严重: ${item.critical}`} />
                          <div className="bg-orange-500 h-full" style={{ width: `${(item.high / maxTotal) * 100}%` }} title={`高: ${item.high}`} />
                          <div className="bg-yellow-500 h-full" style={{ width: `${(item.medium / maxTotal) * 100}%` }} title={`中: ${item.medium}`} />
                          <div className="bg-blue-500 h-full" style={{ width: `${(item.low / maxTotal) * 100}%` }} title={`低: ${item.low}`} />
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          {item.critical > 0 && <span className="text-red-400">严重 {item.critical}</span>}
                          {item.high > 0 && <span className="text-orange-400">高 {item.high}</span>}
                          {item.medium > 0 && <span className="text-yellow-400">中 {item.medium}</span>}
                          {item.low > 0 && <span className="text-blue-400">低 {item.low}</span>}
                        </div>
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-3 pt-2 text-xs text-horror-text/40 border-t border-horror-border/50">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />严重</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />高</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />中</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />低</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-red-400" />
                <h4 className="text-sm font-semibold text-horror-heading">连续失败风险</h4>
              </div>
              {consecutiveFailureCards.length === 0 ? (
                <p className="text-sm text-horror-text/50 text-center py-6">暂无连续失败记录</p>
              ) : (
                <div className="space-y-3">
                  {consecutiveFailureCards.map(card => (
                    <button
                      key={card.jumpScareId}
                      onClick={() => handleNavigateToReview({
                        jumpScareId: card.jumpScareId,
                        compareMode: true,
                      })}
                      className="w-full text-left p-3 bg-red-500/5 rounded-lg border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-horror-heading">{card.name}</span>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold">
                          连续 {card.consecutiveFails} 次失败
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-horror-text/60">
                        <span>累计失败: <span className="text-red-400 font-medium">{card.totalFailures}</span>/{card.totalTests}</span>
                        {card.topIssue && (
                          <span>主要问题: <span className="text-horror-accent">{issueTypeLabels[card.topIssue]?.label || card.topIssue}</span></span>
                        )}
                      </div>
                      {card.routes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {card.routes.map(route => (
                            <span key={route} className="px-1.5 py-0.5 rounded bg-horror-border/30 text-xs text-horror-text/50">
                              {characters.find(c => c.id === route)?.name || route}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Skull className="w-5 h-5 text-horror-accent" />
              <h3 className="text-sm font-semibold text-horror-heading">失败率最高的跳吓镜头</h3>
            </div>
            <div className="space-y-3">
              {failureRateByJumpScare.slice(0, 5).map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigateToReview({ jumpScareId: item.id, compareMode: true })}
                  className="w-full text-left flex items-center gap-3 hover:bg-horror-bg/30 p-1 rounded transition-colors"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-red-500/20 text-red-400' : 'bg-horror-border/50 text-horror-text/50'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-horror-heading font-medium truncate mr-2">{item.name}</span>
                      <span className={`text-sm font-bold ${item.rate > 60 ? 'text-red-400' : item.rate > 30 ? 'text-orange-400' : 'text-yellow-400'}`}>
                        {item.rate}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-horror-border/30 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.rate > 60 ? 'bg-red-500' : item.rate > 30 ? 'bg-orange-500' : 'bg-yellow-500'}`} style={{ width: `${item.rate}%` }} />
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-horror-text/50">
                      <span>{item.failed} 失败 / {item.total} 总测试</span>
                    </div>
                  </div>
                </button>
              ))}
              {failureRateByJumpScare.every((i) => i.failed === 0) && (
                <p className="text-sm text-horror-text/50 text-center py-4">暂无失败记录</p>
              )}
            </div>
          </div>

          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-horror-warning" />
              <h3 className="text-sm font-semibold text-horror-heading">最常见的问题类型</h3>
            </div>
            <div className="space-y-3">
              {issueTypeDistribution.filter((i) => i.count > 0).map((item) => {
                const config = issueTypeLabels[item.type];
                const maxCount = issueTypeDistribution[0]?.count || 1;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleNavigateToReview({ severity: item.type })}
                    className="w-full text-left flex items-center gap-3 hover:bg-horror-bg/30 p-1 rounded transition-colors"
                  >
                    <span className="text-lg">{config.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                        <span className="text-sm text-horror-heading font-bold">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-horror-border/30 rounded-full overflow-hidden">
                        <div className="h-full bg-horror-accent rounded-full" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                  </button>
                );
              })}
              {issueTypeDistribution.every((i) => i.count === 0) && (
                <p className="text-sm text-horror-text/50 text-center py-4">暂无问题类型记录</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-horror-panel rounded-xl border border-horror-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-horror-accent" />
            <h3 className="text-lg font-semibold text-horror-heading">上线前优先处理列表（动态生成）</h3>
          </div>
          <p className="text-xs text-horror-text/50 mb-4">基于全部测试数据实时汇总，按失败率和严重程度排序</p>
          {dynamicPriorityList.length === 0 ? (
            <p className="text-sm text-horror-text/50 text-center py-6">所有测试均通过，暂无需要优先处理的问题</p>
          ) : (
            <div className="space-y-3">
              {dynamicPriorityList.map((item) => {
                const topIssueConfig = item.topIssue ? issueTypeLabels[item.topIssue] : null;
                return (
                  <button
                    key={item.jumpScareId}
                    onClick={() => handleNavigateToReview({ jumpScareId: item.jumpScareId, compareMode: true })}
                    className={`w-full text-left p-4 rounded-lg border flex items-center gap-4 transition-colors hover:brightness-110 ${
                      item.topSeverity === 'critical'
                        ? 'border-red-500/50 bg-red-500/5'
                        : item.topSeverity === 'high'
                        ? 'border-orange-500/40 bg-orange-500/5'
                        : 'border-horror-border bg-horror-bg/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.rank <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-horror-border/50 text-horror-text/50'
                    }`}>
                      {item.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-horror-heading">{item.name}</span>
                        {item.topSeverity && <SeverityBadge severity={item.topSeverity} size="sm" />}
                        {topIssueConfig && (
                          <span className={`text-xs ${topIssueConfig.color}`}>{topIssueConfig.icon} {topIssueConfig.label}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-horror-text/60">
                        <span>失败率: <strong className={item.failureRate > 60 ? 'text-red-400' : item.failureRate > 30 ? 'text-orange-400' : 'text-yellow-400'}>{item.failureRate}%</strong></span>
                        <span>测试: {item.totalTests} 次</span>
                      </div>
                    </div>
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-horror-border/30" />
                        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${(item.failureRate / 100) * 150} 150`} className={item.failureRate > 60 ? 'text-red-500' : item.failureRate > 30 ? 'text-orange-500' : 'text-yellow-500'} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-horror-heading">{item.failureRate}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-horror-panel rounded-xl border border-horror-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-horror-heading mb-4">问题分类概览</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button onClick={() => setCategoryFilter('all')} className={`p-4 rounded-lg border text-left transition-all ${categoryFilter === 'all' ? 'border-horror-accent bg-horror-accent/10' : 'border-horror-border bg-horror-bg/30 hover:border-horror-border/80'}`}>
              <div className="text-2xl mb-2">📊</div><div className="font-medium text-horror-heading">全部</div>
              <div className="text-2xl font-bold text-horror-heading mt-1">{producerInsights.length}</div>
            </button>
            {Object.entries(categoryStats).map(([category, stats]) => {
              const config = categoryLabels[category];
              return (
                <button key={category} onClick={() => setCategoryFilter(category)} className={`p-4 rounded-lg border text-left transition-all ${categoryFilter === category ? 'border-horror-accent bg-horror-accent/10' : 'border-horror-border bg-horror-bg/30 hover:border-horror-border/80'}`}>
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <div className={`font-medium ${config.color}`}>{config.label}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-horror-heading">{stats.count}</span>
                    {stats.critical > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">{stats.critical}严重</span>}
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
            const affectedCharNames = insight.affectedRoutes.map((r) => characters.find((c) => c.id === r)?.name).filter(Boolean);
            const affectedDiffNames = insight.affectedDifficulties.map((d) => difficultyLabels[d]);
            return (
              <div key={insight.id} className={`bg-horror-panel rounded-xl border transition-all overflow-hidden ${insight.severity === 'critical' ? 'border-red-500/50 shadow-lg shadow-red-500/10' : insight.severity === 'high' ? 'border-orange-500/30' : 'border-horror-border'}`}>
                <div className="p-5 cursor-pointer hover:bg-horror-bg/20 transition-colors" onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{categoryConfig.icon}</span>
                        <SeverityBadge severity={insight.severity} />
                        <span className={`text-sm ${categoryConfig.color}`}>{categoryConfig.label}</span>
                        <span className="text-xs text-horror-text/50">{insight.id}</span>
                      </div>
                      <h4 className="text-lg font-semibold text-horror-heading mb-2">{insight.title}</h4>
                      <p className="text-sm text-horror-text/70 line-clamp-2">{insight.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-horror-text/50" /><span className="text-horror-text/70">影响: {affectedCharNames.join(', ')}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-horror-text/50" /><span className="text-horror-text/70">难度: {affectedDiffNames.join(', ')}</span></div>
                        <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-horror-text/50" /><span className="text-horror-text/70">{insight.testCount} 次测试</span></div>
                        <div className={`flex items-center gap-1.5 font-medium ${insight.failureRate > 60 ? 'text-red-400' : insight.failureRate > 30 ? 'text-orange-400' : 'text-yellow-400'}`}>
                          {insight.failureRate > 60 ? <XCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          失败率 {insight.failureRate}%
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-horror-border/30" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(insight.failureRate / 100) * 176} 176`} className={insight.failureRate > 60 ? 'text-red-500' : insight.failureRate > 30 ? 'text-orange-500' : 'text-yellow-500'} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-horror-heading">{insight.failureRate}%</span></div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-horror-text/50" /> : <ChevronDown className="w-5 h-5 text-horror-text/50" />}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-horror-border p-5 bg-horror-bg/30">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-semibold text-horror-heading mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" />问题详述</h5>
                        <p className="text-sm text-horror-text/80 leading-relaxed">{insight.description}</p>
                        <div className="mt-4">
                          <h6 className="text-xs font-medium text-horror-text/60 mb-2">证据链</h6>
                          <div className="space-y-1.5">
                            {insight.evidence.map((ev, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-horror-text/70"><span className="text-horror-accent">•</span><span>{ev}</span></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-horror-heading mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-400" />修复建议</h5>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                          <p className="text-sm text-yellow-200/90 leading-relaxed">{insight.recommendation}</p>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <button className="flex-1 py-2 px-4 bg-horror-accent text-white text-sm font-medium rounded-lg hover:bg-horror-accent/90 transition-colors flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />标记为已处理</button>
                          <button
                            onClick={() => handleNavigateToReview({ compareMode: true })}
                            className="py-2 px-4 bg-horror-border/50 text-horror-text text-sm font-medium rounded-lg hover:bg-horror-border transition-colors flex items-center justify-center gap-2"
                          >
                            <ArrowRight className="w-4 h-4" />查看复盘
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
      </div>
    </div>
  );
};

export default ProducerPage;
