import React from 'react';
import { Skull, ClipboardList, BarChart3, Eye } from 'lucide-react';
import { useApp } from '../store/AppContext';

const Navbar: React.FC = () => {
  const { currentPage, setCurrentPage } = useApp();

  const navItems = [
    { id: 'tasks', label: '测试任务', icon: ClipboardList },
    { id: 'review', label: '问题复盘', icon: BarChart3 },
    { id: 'producer', label: '制作人视图', icon: Eye },
  ];

  return (
    <nav className="bg-horror-panel border-b border-horror-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Skull className="w-8 h-8 text-horror-accent animate-pulse-slow" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-horror-accent rounded-full animate-ping opacity-75" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-horror-heading">
                跳吓复核平台
              </h1>
              <p className="text-xs text-horror-text/60">
                Jumpscare Review System v2.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-horror-accent/20 text-horror-accent border border-horror-accent/30'
                      : 'text-horror-text hover:text-horror-heading hover:bg-horror-border/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </nav>
    );
};

export default Navbar;
