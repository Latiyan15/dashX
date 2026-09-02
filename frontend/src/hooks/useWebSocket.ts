import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { WebSocketConnectionState, WsEvent, LiveActivityItem } from '../types';
import { formatCanonicalStatusLabel } from '../lib/statusConfig';

const INITIAL_ACTIVITIES: LiveActivityItem[] = [
  {
    id: 'act-1',
    type: 'BOOKING_UPDATED',
    message: 'Booking IM-260901-00408 moved to ON THE WAY',
    timestamp: new Date(Date.now() - 45000).toISOString(),
    statusKey: 'ON_THE_WAY',
  },
  {
    id: 'act-2',
    type: 'MECHANIC_STATUS_CHANGED',
    message: 'Mechanic Rajesh Kumar is now Busy in Bay',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    statusKey: 'BUSY',
  },
  {
    id: 'act-3',
    type: 'BOOKING_UPDATED',
    message: 'Booking IM-260901-00405 moved to COMPLETED',
    timestamp: new Date(Date.now() - 320000).toISOString(),
    statusKey: 'COMPLETED',
  },
  {
    id: 'act-4',
    type: 'MECHANIC_STATUS_CHANGED',
    message: 'Mechanic Aarav Sharma is now Available',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    statusKey: 'AVAILABLE',
  },
];

export function useWebSocket() {
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>('OFFLINE');
  const [activities, setActivities] = useState<LiveActivityItem[]>(INITIAL_ACTIVITIES);
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  const addActivity = useCallback(
    (
      type: 'BOOKING_UPDATED' | 'MECHANIC_STATUS_CHANGED',
      message: string,
      statusKey?: string
    ) => {
      const newItem: LiveActivityItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        message,
        timestamp: new Date().toISOString(),
        statusKey,
      };
      setActivities((prev) => [newItem, ...prev.slice(0, 19)]); // Keep last 20
    },
    []
  );

  const connect = useCallback(() => {
    const rawWsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
    // Clean trailing slash if present
    const baseUrl = rawWsUrl.replace(/\/+$/, '');
    const wsUrl = `${baseUrl}/ws/dashboard/`;

    try {
      setConnectionState('RECONNECTING');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('LIVE');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: WsEvent = JSON.parse(event.data);

          switch (data.type) {
            case 'BOOKING_UPDATED': {
              const { reference_code, status } = data.payload;
              const canonicalLabel = formatCanonicalStatusLabel(status);
              addActivity(
                'BOOKING_UPDATED',
                `Booking ${reference_code} moved to ${canonicalLabel}`,
                status
              );
              // Invalidate TanStack queries for seamless live update
              queryClient.invalidateQueries({ queryKey: ['bookings'] });
              queryClient.invalidateQueries({ queryKey: ['booking', data.payload.booking_id] });
              queryClient.invalidateQueries({ queryKey: ['analytics'] });
              queryClient.invalidateQueries({ queryKey: ['mechanics'] });
              break;
            }

            case 'MECHANIC_STATUS_CHANGED': {
              const { full_name, status_display } = data.payload;
              addActivity(
                'MECHANIC_STATUS_CHANGED',
                `Mechanic ${full_name} is now ${status_display}`
              );
              queryClient.invalidateQueries({ queryKey: ['mechanics'] });
              queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
              break;
            }

            case 'METRICS_UPDATED':
              queryClient.invalidateQueries({ queryKey: ['analytics'] });
              break;

            default:
              break;
          }
        } catch {
          // Ignore parse errors from non-standard frames
        }
      };

      ws.onclose = () => {
        setConnectionState('OFFLINE');
        // Exponential backoff reconnect: 1s, 2s, 4s, max 10s
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        reconnectAttempts.current += 1;
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = () => {
        setConnectionState('OFFLINE');
        ws.close();
      };
    } catch {
      setConnectionState('OFFLINE');
    }
  }, [queryClient, addActivity]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    connectionState,
    activities,
    clearActivities: () => setActivities([]),
  };
}
