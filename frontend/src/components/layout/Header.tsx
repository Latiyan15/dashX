import React from 'react';
import { Menu, Shield, Radio, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import type { WebSocketConnectionState } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
  connectionState: WebSocketConnectionState;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  connectionState,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-[#0d0d10] border-b border-[#1a1a22] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-400 hover:bg-[#1a1a22] md:hidden transition-colors border border-[#22222d]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1a24] border border-[#22222d] transition-colors"
            title={isCollapsed ? 'Expand Navigation Panel' : 'Collapse Navigation Panel'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#FF5500]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2.5 text-xs">
          <span className="font-bold uppercase tracking-widest text-slate-400 text-[11px]">
            Operations Telemetry
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-[#FF5500] flex items-center gap-1 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-[#FF5500]" /> Fleet Protocol
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#16161d] border border-[#262634] transition-all shadow-xs"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-400 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Real-time WebSocket Heartbeat Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#1f2924] bg-[#0c1a14] text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] font-bold text-emerald-400">
            {connectionState === 'LIVE' ? 'LIVE' : connectionState}
          </span>
          <span className="text-emerald-500 font-mono text-[10px]">∿</span>
        </div>

        {/* Broadcast Radio Icon */}
        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-white transition-colors"
          aria-label="Signal"
        >
          <Radio className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#1f1f28]">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-amber-500/40 bg-[#16161d]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Dispatcher Ops"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="hidden lg:block text-left text-xs">
            <span className="font-bold text-white block leading-tight">Dispatcher Ops</span>
            <span className="text-[10px] text-slate-400 block font-mono">Lead Bay Controller</span>
          </div>
        </div>
      </div>
    </header>
  );
};
