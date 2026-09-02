// WebSocket event types matching Django Channels DashboardConsumer
export type WebSocketConnectionState = 'LIVE' | 'RECONNECTING' | 'OFFLINE';

export interface WsConnectionAck {
  type: 'CONNECTION_ACK';
  timestamp: string;
  message: string;
}

export interface WsBookingUpdated {
  type: 'BOOKING_UPDATED';
  timestamp: string;
  payload: {
    booking_id: number;
    reference_code: string;
    status: string;
    status_display: string;
    mechanic_id: number | null;
    customer_name: string | null;
    service_name: string | null;
  };
}

export interface WsMechanicStatusChanged {
  type: 'MECHANIC_STATUS_CHANGED';
  timestamp: string;
  payload: {
    mechanic_id: number;
    full_name: string;
    status: string;
    status_display: string;
  };
}

export interface WsMetricsUpdated {
  type: 'METRICS_UPDATED';
  timestamp: string;
  payload: Record<string, never>;
}

export type WsEvent =
  | WsConnectionAck
  | WsBookingUpdated
  | WsMechanicStatusChanged
  | WsMetricsUpdated;

export interface LiveActivityItem {
  id: string;
  type: 'BOOKING_UPDATED' | 'MECHANIC_STATUS_CHANGED';
  message: string;
  timestamp: string;
  statusKey?: string;
}
