import React, { useState } from 'react';
import { Check, X, Loader2, UserPlus } from 'lucide-react';
import {
  VALID_TRANSITIONS,
  type BookingStatus,
  type BookingDetail,
  type Mechanic,
} from '../../types';
import { useUpdateBookingStatus, useAssignMechanic } from '../../hooks/useBookings';
import { formatCanonicalStatusLabel } from '../../lib/statusConfig';

interface BookingStatusActionsProps {
  booking: BookingDetail;
  availableMechanics?: Mechanic[];
  onSuccess?: () => void;
}

export const BookingStatusActions: React.FC<BookingStatusActionsProps> = ({
  booking,
  availableMechanics = [],
  onSuccess,
}) => {
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateStatusMutation = useUpdateBookingStatus();
  const assignMechanicMutation = useAssignMechanic();

  const currentStatus = booking.status as BookingStatus;
  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

  const handleTransition = async (targetStatus: BookingStatus) => {
    setErrorMsg(null);
    try {
      await updateStatusMutation.mutateAsync({
        id: booking.id,
        status: targetStatus,
        notes: notes.trim() || undefined,
        changed_by: 'Operations Desk',
      });
      setNotes('');
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(error.response?.data?.detail || 'Failed to update status.');
    }
  };

  const handleAssign = async () => {
    if (!selectedMechanicId) return;
    setErrorMsg(null);
    try {
      await assignMechanicMutation.mutateAsync({
        id: booking.id,
        mechanic_id: Number(selectedMechanicId),
        notes: notes.trim() || undefined,
        changed_by: 'Operations Dispatch',
      });
      setSelectedMechanicId('');
      setNotes('');
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(error.response?.data?.detail || 'Failed to assign mechanic.');
    }
  };

  const isLoading = updateStatusMutation.isPending || assignMechanicMutation.isPending;

  if (allowedNext.length === 0) {
    return (
      <div className="p-3 rounded-lg bg-[#14141a] border border-[#22222e] text-xs text-slate-400 text-center">
        This booking is in terminal state ({booking.status_display}). No further actions allowed.
      </div>
    );
  }

  return (
    <div className="bg-[#14141a] p-4 rounded-xl border border-[#22222e] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Available Workflow Transitions
        </span>
        {isLoading && (
          <span className="inline-flex items-center gap-1 text-xs text-[#FF5500]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-md bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Notes optional input */}
      <div>
        <input
          type="text"
          placeholder="Add optional dispatch notes / remarks..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-1.5 text-xs bg-[#1a1a24] border border-[#282838] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5500] text-white placeholder:text-slate-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {allowedNext.map((nextStatus) => {
          const isCancel = nextStatus === 'CANCELLED';
          return (
            <button
              key={nextStatus}
              type="button"
              disabled={isLoading}
              onClick={() => handleTransition(nextStatus)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                isCancel
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/80'
                  : 'bg-[#FF5500] text-white hover:bg-[#ff6a1f]'
              }`}
            >
              {!isCancel && <Check className="w-3.5 h-3.5" />}
              Advance to {formatCanonicalStatusLabel(nextStatus)}
            </button>
          );
        })}
      </div>

      {/* Assign Mechanic Sub-action */}
      <div className="pt-3 border-t border-[#22222e] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <select
          value={selectedMechanicId}
          onChange={(e) => setSelectedMechanicId(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-2.5 py-1.5 text-xs bg-[#1a1a24] border border-[#282838] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5500] text-slate-200"
        >
          <option value="">-- Assign/Reassign Field Mechanic --</option>
          {availableMechanics.map((mech) => (
            <option key={mech.id} value={mech.id}>
              {mech.full_name} ({mech.status_display} - ★{mech.rating})
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={isLoading || !selectedMechanicId}
          onClick={handleAssign}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#1e1e2a] border border-[#2e2e3e] hover:bg-[#282838] disabled:opacity-40 rounded-lg transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Assign Mechanic
        </button>
      </div>
    </div>
  );
};
