import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Minus, MapPin } from 'lucide-react';
import type { Booking } from '../../types';

interface LiveFleetMapProps {
  bookings?: Booking[];
}

interface FleetMarker {
  id: number | string;
  label: string;
  refCode?: string;
  customer?: string;
  status: string;
  color: string;
  bg: string;
  top: string;
  left: string;
}

const PRESET_COORDINATES = [
  { top: '30%', left: '78%' }, // Whitefield
  { top: '35%', left: '22%' }, // Koramangala
  { top: '38%', left: '42%' }, // Indiranagar
  { top: '65%', left: '20%' }, // HSR Layout
  { top: '70%', left: '80%' }, // Electronic City
  { top: '85%', left: '45%' }, // Hebbal
  { top: '82%', left: '88%' }, // Bannerghatta
];

function getMarkerColor(status: string) {
  switch (status) {
    case 'COMPLETED':
      return { color: '#10B981', bg: 'bg-emerald-500' };
    case 'ON_THE_WAY':
    case 'ASSIGNED':
      return { color: '#3B82F6', bg: 'bg-blue-500' };
    case 'IN_PROGRESS':
    case 'PENDING':
      return { color: '#F59E0B', bg: 'bg-amber-500' };
    case 'CANCELLED':
      return { color: '#EF4444', bg: 'bg-rose-500' };
    default:
      return { color: '#3B82F6', bg: 'bg-blue-500' };
  }
}

export const LiveFleetMap: React.FC<LiveFleetMapProps> = ({ bookings = [] }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));

  // Build markers from actual bookings if available, else use regional hubs
  const markers: FleetMarker[] =
    bookings.length > 0
      ? bookings.slice(0, 7).map((b, idx) => {
          const coords = PRESET_COORDINATES[idx % PRESET_COORDINATES.length];
          const colors = getMarkerColor(b.status);
          const locationName = b.service_location.split(',')[0].trim() || 'Bay Dispatch';
          return {
            id: b.id,
            label: locationName,
            refCode: b.reference_code,
            customer: b.customer.full_name,
            status: b.status_display,
            color: colors.color,
            bg: colors.bg,
            top: coords.top,
            left: coords.left,
          };
        })
      : [
          { id: 1, label: 'Cyber Hub', status: 'On The Way', color: '#3B82F6', bg: 'bg-blue-500', top: '30%', left: '78%' },
          { id: 2, label: 'DLF Phase 5', status: 'Completed', color: '#10B981', bg: 'bg-emerald-500', top: '35%', left: '22%' },
          { id: 3, label: 'Sector 29', status: 'Cancelled', color: '#EF4444', bg: 'bg-rose-500', top: '38%', left: '42%' },
          { id: 4, label: 'Sohna Road', status: 'In Progress', color: '#F59E0B', bg: 'bg-amber-500', top: '65%', left: '20%' },
          { id: 5, label: 'Golf Course Ext.', status: 'In Progress', color: '#F59E0B', bg: 'bg-amber-500', top: '70%', left: '80%' },
          { id: 6, label: 'Udyog Vihar', status: 'On The Way', color: '#3B82F6', bg: 'bg-blue-500', top: '85%', left: '45%' },
          { id: 7, label: 'MG Road (Gurugram)', status: 'Cancelled', color: '#EF4444', bg: 'bg-rose-500', top: '82%', left: '88%' },
        ];

  return (
    <div className="bg-[#131317] rounded-xl border border-[#1f1f26] p-4 flex flex-col justify-between shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f1f26]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Live Fleet Map
        </h3>
        <Link
          to="/bookings"
          className="text-[11px] font-semibold text-[#FF5500] hover:text-[#ff6a1f] transition-colors"
        >
          View Full Map
        </Link>
      </div>

      {/* Map Canvas with Radar Rings and Markers */}
      <div className="relative w-full h-40 bg-[#0e0e12] rounded-lg border border-[#1f1f28] overflow-hidden my-auto flex items-center justify-center">
        {/* Scaled Inner Canvas */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Subtle Map Grid Lines */}
          <div className="absolute inset-0 opacity-15">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="mapGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#64748b" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#mapGrid)" />
            </svg>
          </div>

          {/* Concentric Radar Rings */}
          <div className="absolute w-36 h-36 rounded-full border border-teal-500/20 pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full border border-teal-500/30 pointer-events-none" />
          <div className="absolute w-14 h-14 rounded-full border border-teal-500/40 pointer-events-none" />

          {/* Center Vehicle Hub Pulse */}
          <div className="relative z-10 w-8 h-8 rounded-full bg-teal-950 border border-teal-400 flex items-center justify-center shadow-[0_0_12px_rgba(45,212,191,0.6)]">
            <Car className="w-4 h-4 text-teal-300" />
          </div>

          {/* Location Markers */}
          {markers.map((m) => (
            <div
              key={m.id}
              style={{ top: m.top, left: m.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group z-20"
            >
              <div
                className={`w-3.5 h-3.5 rounded-full ${m.bg} flex items-center justify-center shadow-md ring-2 ring-black/40`}
                style={{ backgroundColor: m.color }}
              >
                <MapPin className="w-2 h-2 text-white" />
              </div>
              <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center bg-black/95 text-white text-[9px] px-2 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap z-30 pointer-events-none">
                <span className="font-bold text-slate-100">{m.label}</span>
                {m.refCode && <span className="text-[#FF5500] font-mono">{m.refCode}</span>}
                {m.customer && <span className="text-slate-400">{m.customer}</span>}
                <span className="text-slate-400 mt-0.5" style={{ color: m.color }}>{m.status}</span>
              </div>
            </div>
          ))}

          {/* Geographic Labels */}
          <span className="absolute top-2 right-4 text-[8px] font-mono text-slate-500 select-none">
            Cyber City
          </span>
          <span className="absolute bottom-2 right-4 text-[8px] font-mono text-slate-500 select-none">
            Golf Course Ext.
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute right-2 top-2 flex flex-col gap-1 bg-[#1a1a22]/90 backdrop-blur-xs p-0.5 rounded border border-[#262632] z-30">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Map Legend */}
      <div className="pt-2 border-t border-[#1f1f26] flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>On The Way</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
};
