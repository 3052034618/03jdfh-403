import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Filter,
  MapPin,
  BookOpen,
  AlertTriangle,
  Clock,
  User,
  Gamepad2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  GitCompare,
  X,
  Layers,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { jumpScares } from '../data/jumpScares';
import { characters } from '../data/characters';
import { difficultyLabels, saveStateLabels, chapters } from '../data/chapters';
import { SeverityBadge, IssueTypeBadge, StatusBadge } from '../components/Badges';
import type { Severity, IssueType, TestResult } from '../types';

const ReviewPage: React.FC = () => {
  const { testResults, batches } = useApp();
  const [groupBy, setGroupBy] = useState<'chapter' | 'level' | 'severity' | 'issueType'>('chapter');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['chapter1', 'chapter2', 'chapter3']));
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [testerFilter, setTesterFilter] = useState<string>('all');
  const [compareJumpScareId, setCompareJumpScareId] = useState<string | null>(null);

  const uniqueTesters = useMemo(() => {
    const testers = new Set(testResults.map((r) => r.tester));
    return Array.from(testers).sort();
  }, [testResults]);

  const filteredResults = useMemo(() => {
    return testResults.filter((result) => {
      if (severityFilter !== 'all' && result.checks.severity !== severityFilter) return false;
      if (routeFilter !== 'all' && result.route !== routeFilter) return false;
      if (batchFilter !== 'all' && result.batchId !== batchFilter) return false;
      if (testerFilter !== 'all' && result.tester !== testerFilter) return false;
      return true;
    });
  }, [testResults, severityFilter, routeFilter, batchFilter, testerFilter]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, TestResult[]> = {};
    filteredResults.forEach((result) => {
      const jumpScare = jumpScares.find((js) => js.id === result.jumpScareId);
      if (!jumpScare) return;
      let key: string;
      switch (groupBy) {
        case 'chapter': key = jumpScare.chapter; break;
        case 'level': key = jumpScare.level; break;
        case 'severity': key = result.checks.severity || 'unrated'; break;
        case 'issueType': key = result.checks.issueType || 'unknown'; break;
        default: key = 'other';
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(result);
    });
    return groups;
  }, [filteredResults, groupBy]);

  const compareResults = useMemo(() => {
    if (!compareJumpScareId) return [];
    return testResults.filter((r) => r.jumpScareId === compareJumpScareId);
  }, [testResults, compareJumpScareId]);

  const stats = useMemo(() => {
    const total = testResults.length;
    const passed = testResults.filter((r) => r.passed).length;
    const failed = total - passed;
    const bySeverity = {
      critical: testResults.filter((r) => r.checks.severity === 'critical').length,
      high: testResults.filter((r) => r.checks.severity === 'high').length,
      medium: testResults.filter((r) => r.checks.severity === 'medium').length,
      low: testResults.filter((r) => r.checks.severity === 'low').length,
    };
    const byIssueType: Record<IssueType, number> = {
      not_triggered: testResults.filter((r) => r.checks.issueType === 'not_triggered').length,
      obscured: testResults.filter((r) => r.checks.issueType === 'obscured').length,
      distracted: testResults.filter((r) => r.checks.issueType === 'distracted').length,
      low_fps: testResults.filter((r) => r.checks.issueType === 'low_fps').length,
      timing: testResults.filter((r) => r.checks.issueType === 'timing').length,
      other: testResults.filter((r) => r.checks.issueType === 'other').length,
    };
    return { total, passed, failed, bySeverity, byIssueType };
  }, [testResults]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getGroupLabel = (key: string) => {
    switch (groupBy) {
      case 'chapter': { const c = chapters.find((c) => c.id === key); return c ? c.name : key; }
      case 'severity': return { critical: '严重', high: '高', medium: '中', low: '低', unrated: '未评级' }[key] || key;
      case 'issueType': return { not_triggered: '未触发', obscured: '被遮挡', distracted: '注意力分散', low_fps: '低帧率', timing: '时机问题', other: '其他', unknown: '未知' }[key] || key;
      default: return key;
    }
  };

  const getGroupIcon = (_key: string) => {
    switch (groupBy) {
      case 'chapter': return <BookOpen className="w-4 h-4" />;
      case 'level': return <MapPin className="w-4 h-4" />;
      case 'severity': return <AlertTriangle className="w-4 h-4" />;
      case 'issueType': return <Filter className="w-4 h-4" />;
      default: return null;
    }
  };

  const groupByOptions = [
    { id: 'chapter', label: '按章节', icon: BookOpen },
    { id: 'level', label: '按关卡', icon: MapPin },
    { id: 'severity', label: '按严重程度', icon: AlertTriangle },
    { id: 'issueType', label: '按问题类型', icon: Filter },
  ];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-horror-heading mb-2">问题复盘</h2>
          <p className="text-horror-text/70">按不同维度归类分析测试结果，定位体验断点</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-horror-panel rounded-xl border border-horror-border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-blue-400" /></div>
              <div><p className="text-xs text-horror-text/60">总测试数</p><p className="text-2xl font-bold text-horror-heading">{stats.total}</p></div>
            </div>
          </div>
          <div className="bg-horror-panel rounded-xl border border-horror-border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-400" /></div>
              <div><p className="text-xs text-horror-text/60">通过</p><p className="text-2xl font-bold text-green-400">{stats.passed}</p></div>
            </div>
          </div>
          <div className="bg-horror-panel rounded-xl border border-horror-border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-400" /></div>
              <div><p className="text-xs text-horror-text/60">失败</p><p className="text-2xl font-bold text-red-400">{stats.failed}</p></div>
            </div>
          </div>
          <div className="bg-horror-panel rounded-xl border border-horror-border p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-orange-400" /></div>
              <div><p className="text-xs text-horror-text/60">严重问题</p><p className="text-2xl font-bold text-orange-400">{stats.bySeverity.critical + stats.bySeverity.high}</p></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <h3 className="text-sm font-medium text-horror-heading mb-4">严重程度分布</h3>
            <div className="space-y-3">
              {Object.entries(stats.bySeverity).map(([severity, count]) => {
                const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={severity}>
                    <div className="flex justify-between text-xs mb-1">
                      <SeverityBadge severity={severity as Severity} size="sm" />
                      <span className="text-horror-text/70">{count} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-horror-border/30 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${severity === 'critical' ? 'bg-red-500' : severity === 'high' ? 'bg-orange-500' : severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <h3 className="text-sm font-medium text-horror-heading mb-4">问题类型分布</h3>
            <div className="space-y-2">
              {Object.entries(stats.byIssueType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <IssueTypeBadge type={type as IssueType} />
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-horror-border/30 rounded-full overflow-hidden">
                      <div className="h-full bg-horror-accent rounded-full" style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs text-horror-text/70 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-horror-panel rounded-xl border border-horror-border p-5">
            <h3 className="text-sm font-medium text-horror-heading mb-4">筛选条件</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-horror-text/60 mb-1 block">严重程度</label>
                <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as any)} className="w-full px-3 py-2 bg-horror-bg/50 border border-horror-border rounded-lg text-sm text-horror-text focus:outline-none focus:border-horror-accent/50">
                  <option value="all">全部</option><option value="critical">严重</option><option value="high">高</option><option value="medium">中</option><option value="low">低</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-horror-text/60 mb-1 block">角色路线</label>
                <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)} className="w-full px-3 py-2 bg-horror-bg/50 border border-horror-border rounded-lg text-sm text-horror-text focus:outline-none focus:border-horror-accent/50">
                  <option value="all">全部</option>{characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-horror-text/60 mb-1 block">测试批次</label>
                <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} className="w-full px-3 py-2 bg-horror-bg/50 border border-horror-border rounded-lg text-sm text-horror-text focus:outline-none focus:border-horror-accent/50">
                  <option value="all">全部</option><option value="none">无批次</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-horror-text/60 mb-1 block">测试员</label>
                <select value={testerFilter} onChange={(e) => setTesterFilter(e.target.value)} className="w-full px-3 py-2 bg-horror-bg/50 border border-horror-border rounded-lg text-sm text-horror-text focus:outline-none focus:border-horror-accent/50">
                  <option value="all">全部</option>
                  {uniqueTesters.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-horror-text/70">分组方式：</span>
          {groupByOptions.map((option) => {
            const Icon = option.icon;
            const isActive = groupBy === option.id;
            return (
              <button key={option.id} onClick={() => setGroupBy(option.id as any)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${isActive ? 'bg-horror-accent/20 text-horror-accent border border-horror-accent/30' : 'bg-horror-panel text-horror-text/70 border border-horror-border hover:text-horror-heading'}`}>
                <Icon className="w-4 h-4" />{option.label}
              </button>
            );
          })}
        </div>

        {compareJumpScareId && (
          <div className="mb-6 bg-horror-panel rounded-xl border border-horror-accent2/50 overflow-hidden">
            <div className="p-4 border-b border-horror-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-horror-accent2" />
                <h4 className="font-semibold text-horror-heading">
                  跨路线对比：{jumpScares.find((js) => js.id === compareJumpScareId)?.name || compareJumpScareId}
                </h4>
              </div>
              <button onClick={() => setCompareJumpScareId(null)} className="text-horror-text/50 hover:text-horror-accent transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-horror-text/60 border-b border-horror-border">
                      <th className="pb-2 pr-4">路线</th>
                      <th className="pb-2 pr-4">难度</th>
                      <th className="pb-2 pr-4">存档</th>
                      <th className="pb-2 pr-4">结果</th>
                      <th className="pb-2 pr-4">问题类型</th>
                      <th className="pb-2 pr-4">严重程度</th>
                      <th className="pb-2 pr-4">测试员</th>
                      <th className="pb-2">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-horror-border/50">
                    {compareResults.map((result) => {
                      const char = characters.find((c) => c.id === result.route);
                      return (
                        <tr key={result.id} className={` ${!result.passed ? 'bg-red-500/5' : ''}`}>
                          <td className="py-2 pr-4 text-horror-heading">{char?.name || result.route}</td>
                          <td className="py-2 pr-4">{difficultyLabels[result.difficulty]}</td>
                          <td className="py-2 pr-4">{saveStateLabels[result.saveState] || result.saveState}</td>
                          <td className="py-2 pr-4"><StatusBadge passed={result.passed} /></td>
                          <td className="py-2 pr-4">{result.checks.issueType ? <IssueTypeBadge type={result.checks.issueType} /> : <span className="text-horror-text/30">—</span>}</td>
                          <td className="py-2 pr-4">{result.checks.severity ? <SeverityBadge severity={result.checks.severity} size="sm" /> : <span className="text-horror-text/30">—</span>}</td>
                          <td className="py-2 pr-4 text-horror-text/70">{result.tester}</td>
                          <td className="py-2 text-horror-text/60 max-w-[200px] truncate">{result.checks.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {compareResults.length > 1 && (
                <div className="mt-4 p-3 bg-horror-bg/50 rounded-lg border border-horror-border">
                  <p className="text-xs text-horror-text/70">
                    <span className="font-semibold text-horror-heading">对比摘要：</span>
                    {(() => {
                      const failed = compareResults.filter((r) => !r.passed);
                      const routesWithFailures = new Set(failed.map((r) => r.route));
                      const allSameRoute = routesWithFailures.size === 0 || (routesWithFailures.size === 1 && failed.length === compareResults.filter((r) => r.route === Array.from(routesWithFailures)[0]).length);
                      if (failed.length === 0) return ' 所有测试均通过，无路径相关问题。';
                      if (allSameRoute) return ` 仅在路线「${characters.find((c) => c.id === Array.from(routesWithFailures)[0])?.name}」上出现失败，可能是路线特定问题。`;
                      return ` 在 ${routesWithFailures.size} 条路线上均出现失败，可能是通用问题而非路径相关。`;
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(groupedResults).map(([groupKey, results]) => {
            const isExpanded = expandedGroups.has(groupKey);
            const failedCount = results.filter((r) => !r.passed).length;
            return (
              <div key={groupKey} className="bg-horror-panel rounded-xl border border-horror-border overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-horror-bg/30 transition-colors" onClick={() => toggleGroup(groupKey)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-horror-accent/20 flex items-center justify-center text-horror-accent">{getGroupIcon(groupKey)}</div>
                      <div>
                        <h4 className="font-medium text-horror-heading">{getGroupLabel(groupKey)}</h4>
                        <p className="text-xs text-horror-text/50">{results.length} 条测试记录 · {failedCount} 条失败</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {failedCount > 0 && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">{failedCount} 个问题</span>}
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-horror-text/50" /> : <ChevronDown className="w-5 h-5 text-horror-text/50" />}
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-horror-border divide-y divide-horror-border">
                    {results.map((result) => {
                      const jumpScare = jumpScares.find((js) => js.id === result.jumpScareId);
                      const char = characters.find((c) => c.id === result.route);
                      return (
                        <div key={result.id} className="p-4 hover:bg-horror-bg/20 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <StatusBadge passed={result.passed} />
                                <h5 className="font-medium text-horror-heading">{jumpScare?.name || result.jumpScareId}</h5>
                                <span className="text-xs text-horror-text/50">{result.jumpScareId}</span>
                              </div>
                              <p className="text-sm text-horror-text/70 mb-2">{jumpScare?.description}</p>
                              <div className="flex items-center gap-4 text-xs text-horror-text/60 flex-wrap">
                                <div className="flex items-center gap-1"><User className="w-3 h-3" />{char?.name}</div>
                                <div className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" />{difficultyLabels[result.difficulty]}</div>
                                <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(result.timestamp)}</div>
                                <div className="flex items-center gap-1"><span className="text-horror-text/50">测试员:</span>{result.tester}</div>
                                {result.batchId && (
                                  <div className="flex items-center gap-1"><Layers className="w-3 h-3" />{batches.find((b) => b.id === result.batchId)?.name || result.batchId}</div>
                                )}
                              </div>
                              {result.checks.notes && (
                                <div className="mt-2 p-2 bg-horror-bg/50 rounded-lg border border-horror-border/50">
                                  <p className="text-sm text-horror-text/80"><span className="text-horror-text/50">备注：</span>{result.checks.notes}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {result.checks.issueType && <IssueTypeBadge type={result.checks.issueType} />}
                              {result.checks.severity && <SeverityBadge severity={result.checks.severity} />}
                              {!result.passed && (
                                <button
                                  onClick={() => setCompareJumpScareId(result.jumpScareId)}
                                  className="mt-1 px-2 py-1 rounded text-xs text-horror-accent2 bg-horror-accent2/10 hover:bg-horror-accent2/20 transition-colors flex items-center gap-1"
                                >
                                  <GitCompare className="w-3 h-3" />对比
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {result.checks.triggered ? (
                              <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">✓ 成功触发</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">✗ 未触发</span>
                            )}
                            {result.checks.obscured && <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs">被遮挡</span>}
                            {result.checks.distracted && <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs">注意力分散</span>}
                            {result.checks.lowFps && <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 text-xs">低帧率错过</span>}
                          </div>
                        </div>
                      );
                    })}
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

export default ReviewPage;
