import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Calendar,
  Wrench,
  Users,
  BarChart2,
  FileText,
  Bell,
  Settings,
  X,
  ChevronDown,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { WebSocketConnectionState } from '../../types';
import dashxLogo from '../../assets/dashx-logo.png';
import dashxIcon from '../../assets/dashx-icon.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  connectionState: WebSocketConnectionState;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems = [
  { name: 'Command Center', to: '/', icon: Activity },
  { name: 'Bookings', to: '/bookings', icon: Calendar },
  { name: 'Mechanics', to: '/mechanics', icon: Wrench },
  { name: 'Customers', to: '/customers', icon: Users },
  { name: 'Analytics', to: '/analytics', icon: BarChart2 },
  { name: 'Reports', to: '/reports', icon: FileText },
  { name: 'Alerts', to: '/alerts', icon: Bell, badge: '3' },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  connectionState,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0d0d10] text-slate-300 flex flex-col transition-all duration-300 ease-out border-r border-[#1a1a22] shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16 w-60' : 'w-60'}`}
      >
        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-[#1a1a22] px-4 transition-all duration-300 ${
          isCollapsed ? 'justify-center md:px-2' : 'justify-between'
        }`}>
          {!isCollapsed ? (
            <div className="flex items-center">
              <img
                src={dashxLogo}
                alt="DashX Ops Command"
                className="h-8 w-auto max-w-[170px] object-contain"
              />
            </div>
          ) : (
            <div className="hidden md:flex items-center justify-center">
              <img
                src={dashxIcon}
                alt="X"
                className="h-6 w-auto object-contain"
              />
            </div>
          )}

          {/* Desktop Collapse Toggle Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1a24] border border-[#22222d] transition-colors"
              title={isCollapsed ? 'Expand Navigation Panel' : 'Collapse Navigation Panel'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#FF5500]" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Selector */}
        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={onClose}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `group relative flex items-center rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isCollapsed
                    ? 'justify-center p-2.5 my-1'
                    : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#1a1714] text-[#FF5500] shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141419]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <item.icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#FF5500]' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {/* Badge */}
                  {item.badge && !isCollapsed && (
                    <span className="w-4 h-4 rounded-full bg-[#FF5500] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && isCollapsed && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5500]" />
                  )}

                  {/* Tooltip on Collapsed Desktop */}
                  {isCollapsed && (
                    <div className="hidden md:group-hover:flex absolute left-full ml-2.5 px-2.5 py-1 bg-[#1a1a24] text-white text-xs font-bold rounded-lg shadow-xl border border-[#2a2a38] whitespace-nowrap z-50 pointer-events-none items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#FF5500] text-[9px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Live System Stream Footer Widget */}
        <div className={`border-t border-[#1a1a22] transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {!isCollapsed ? (
            <div className="p-3.5 rounded-xl bg-[#121217] border border-[#1f1f28] space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Live System Stream
                </span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[9px] font-bold text-emerald-400">
                    {connectionState === 'LIVE' ? 'LIVE' : connectionState}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium text-slate-300">WebSocket Connected</p>
                <p className="text-[10px] text-slate-500 font-mono">128 events/min</p>
              </div>

              {/* Glowing Green Waveform Sparkline */}
              <div className="h-7 w-full flex items-center">
                <svg className="w-full h-full" viewBox="0 0 160 30" fill="none">
                  <path
                    d="M0 15 Q 15 5, 30 15 T 60 12 T 90 22 T 120 8 T 145 18 L 160 14"
                    stroke="#10B981"
                    strokeWidth="1.8"
                    fill="none"
                    className="drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                  />
                </svg>
              </div>

              <div className="pt-2 border-t border-[#1f1f28] flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400">Last Sync</span>
                <span className="font-mono text-emerald-400 flex items-center gap-1 text-[10px] whitespace-nowrap shrink-0">
                  <RotateCw className="w-2.5 h-2.5 shrink-0" /> 23 sec ago
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-col items-center py-2 space-y-3">
              <div className="relative group cursor-pointer" title="WebSocket Live Stream">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse block" />
                <div className="hidden group-hover:flex absolute left-full ml-3 px-2 py-1 bg-[#1a1a24] text-emerald-400 text-[10px] font-mono font-bold rounded shadow-lg border border-[#2a2a38] whitespace-nowrap z-50">
                  Stream: {connectionState}
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleCollapse}
                className="text-slate-500 hover:text-slate-300 text-[10px] font-mono"
                title="Expand panel"
              >
                v2.4.1
              </button>
            </div>
          )}

          {!isCollapsed && (
            <div className="mt-2 px-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>v2.4.1</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
