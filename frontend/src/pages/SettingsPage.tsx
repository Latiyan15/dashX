import React, { useState } from 'react';
import {
  Shield,
  Radio,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  // Dispatch automation settings
  const [dispatchMode, setDispatchMode] = useState<'auto' | 'manual'>('auto');
  const [serviceRadius, setServiceRadius] = useState<number>(15);
  const [slaTimeoutMinutes, setSlaTimeoutMinutes] = useState<number>(15);
  const [maxConcurrentJobs, setMaxConcurrentJobs] = useState<number>(1);

  // Telemetry settings
  const [heartbeatInterval, setHeartbeatInterval] = useState<number>(15);
  const [redisHost, setRedisHost] = useState<string>('redis://127.0.0.1:6379/0');
  const [wsUrl, setWsUrl] = useState<string>('ws://127.0.0.1:8000/ws/dashboard/');

  // Alert preferences
  const [emergencyAlerts, setEmergencyAlerts] = useState<boolean>(true);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(true);
  const [idleTechnicianAlert, setIdleTechnicianAlert] = useState<boolean>(true);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(false);

  // Hub profile
  const [hubStation, setHubStation] = useState<string>('Gurugram Central Ops Hub #01');
  const [operatorCallsign, setOperatorCallsign] = useState<string>('Dispatcher Ops - Lead Bay Controller');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Fleet Operations & Telemetry Protocol settings saved successfully.');
    }, 450);
  };

  const handleResetDefaults = () => {
    setDispatchMode('auto');
    setServiceRadius(15);
    setSlaTimeoutMinutes(15);
    setMaxConcurrentJobs(1);
    setHeartbeatInterval(15);
    setEmergencyAlerts(true);
    setSmsNotifications(true);
    setIdleTechnicianAlert(true);
    setSoundAlerts(false);
    toast.info('Settings restored to factory fleet defaults.');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fleet Command Protocol & Settings"
        description="Configure automated dispatch parameters, WebSocket telemetry channels, Redis layers, and operational alert thresholds."
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-[#16161d] border border-[#262634] rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#FF5500] hover:bg-[#ff6a1f] rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Dispatch Automation Settings */}
        <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1f1f26]">
            <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Automated Dispatch & Routing Protocol
              </h3>
              <p className="text-[10px] text-slate-400">
                Configure mechanic matching heuristics and SLA response limits.
              </p>
            </div>
          </div>

          {/* Dispatch Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Technician Allocation Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDispatchMode('auto')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  dispatchMode === 'auto'
                    ? 'bg-[#1e1b18] border-[#FF5500] text-white shadow-xs'
                    : 'bg-[#16161d] border-[#262634] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold block">Autonomous Dispatch</span>
                  {dispatchMode === 'auto' && <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5500]" />}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Algorithm allocates by rating, bay load, and proximity.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDispatchMode('manual')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  dispatchMode === 'manual'
                    ? 'bg-[#1e1b18] border-[#FF5500] text-white shadow-xs'
                    : 'bg-[#16161d] border-[#262634] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold block">Manual Controller</span>
                  {dispatchMode === 'manual' && <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5500]" />}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  All work orders require dispatcher bay approval.
                </span>
              </button>
            </div>
          </div>

          {/* Service Radius Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Maximum Service Geofence Radius</span>
              <span className="font-mono text-[#FF5500]">{serviceRadius} km</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={serviceRadius}
              onChange={(e) => setServiceRadius(Number(e.target.value))}
              className="w-full accent-[#FF5500] bg-[#1e1e28] h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Mechanics will only receive dispatch signals within this radial distance.
            </span>
          </div>

          {/* SLA Timeout & Max Concurrent Jobs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                SLA Alert Threshold
              </label>
              <select
                value={slaTimeoutMinutes}
                onChange={(e) => setSlaTimeoutMinutes(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-[#16161d] border border-[#262634] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Standard)</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Concurrent Jobs / Tech
              </label>
              <select
                value={maxConcurrentJobs}
                onChange={(e) => setMaxConcurrentJobs(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-[#16161d] border border-[#262634] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              >
                <option value={1}>1 Job (Strict focus)</option>
                <option value={2}>2 Jobs (Staggered bay)</option>
                <option value={3}>3 Jobs (Emergency pool)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Real-Time Telemetry & WebSocket Engine */}
        <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1f1f26]">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Real-Time Telemetry & ASGI Channels
              </h3>
              <p className="text-[10px] text-slate-400">
                Django Channels consumer sockets and Redis layer parameters.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                WebSocket Operations Stream Endpoint
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#16161d] border border-[#262634] rounded-lg text-emerald-400 focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
                />
                <span className="absolute right-3 top-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Channel group: <strong className="text-slate-400">ops_dashboard</strong>
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Redis Channel Layer Backend
              </label>
              <input
                type="text"
                value={redisHost}
                onChange={(e) => setRedisHost(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-[#16161d] border border-[#262634] rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Managed in <code className="text-slate-400">CHANNEL_LAYERS[&apos;default&apos;]</code>
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Heartbeat Keep-Alive Interval</span>
                <span className="font-mono text-cyan-400">{heartbeatInterval}s</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={heartbeatInterval}
                onChange={(e) => setHeartbeatInterval(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-[#1e1e28] h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Operational Notifications & Alerts */}
        <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1f1f26]">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Notification Rules & Dispatch Alerts
              </h3>
              <p className="text-[10px] text-slate-400">
                Control triggers for automated sound, SMS, and dashboard alerts.
              </p>
            </div>
          </div>

          <div className="space-y-3 divide-y divide-[#1f1f28]">
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Emergency Breakdown Signals
                </span>
                <span className="text-[10px] text-slate-400">
                  Priority alert flash when roadside breakdown booking arrives.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emergencyAlerts}
                onChange={(e) => setEmergencyAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#FF5500] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Technician SMS Dispatch Pushes
                </span>
                <span className="text-[10px] text-slate-400">
                  Send work order location & customer specs via Twilio/Fast2SMS.
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#FF5500] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Technician Idle Warning (&gt; 45 min)
                </span>
                <span className="text-[10px] text-slate-400">
                  Highlight mechanics who have completed jobs but haven&apos;t taken new tasks.
                </span>
              </div>
              <input
                type="checkbox"
                checked={idleTechnicianAlert}
                onChange={(e) => setIdleTechnicianAlert(e.target.checked)}
                className="w-4 h-4 accent-[#FF5500] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Acoustic Audio Chime on New Booking
                </span>
                <span className="text-[10px] text-slate-400">
                  Play telemetry bell chime in cockpit when booking arrives.
                </span>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#FF5500] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Station Profile & Fleet Environment */}
        <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#1f1f26]">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Operations Hub Station & Environment
              </h3>
              <p className="text-[10px] text-slate-400">
                Lead bay controller identity, API versioning, and environment metadata.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Active Operations Bay Station
              </label>
              <input
                type="text"
                value={hubStation}
                onChange={(e) => setHubStation(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#16161d] border border-[#262634] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Operator Callsign Profile
              </label>
              <input
                type="text"
                value={operatorCallsign}
                onChange={(e) => setOperatorCallsign(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#16161d] border border-[#262634] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-[#16161d] border border-[#262634]">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">System Version</span>
                <span className="font-mono text-white font-bold">v2.4.1 (Fleet Core)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#16161d] border border-[#262634]">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">REST API Base</span>
                <span className="font-mono text-cyan-400 font-bold">/api/v1/</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
