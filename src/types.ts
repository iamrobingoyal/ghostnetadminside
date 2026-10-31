export type RescueStatus = "PENDING" | "ACKNOWLEDGED" | "DISPATCHED" | "RESOLVED";

export interface EmergencyRecord {
  packetId: string;
  deviceId: number;
  latitude: number;
  longitude: number;
  crisisType: number;
  crisisName: string;
  urgency: number;
  battery: number;
  hopCount: number;
  isDirectOrigin: boolean;
  isTest: boolean;
  timestampMinutes: number;
  rawHex: string;
  firstSeenAt: string;
  lastSeenAt: string;
  packetCount: number;
  gatewayNodeId: string;
  gatewayNodeIp?: string;
  status: RescueStatus;
  assignedTeam?: string;
  rescuerNotes?: string;
  triageScore: number;
  triageReason: string;
}

export interface NetworkStats {
  totalAlerts: number;
  pendingAlerts: number;
  dispatchedAlerts: number;
  resolvedAlerts: number;
  activeGateways: number;
  averageHops: number;
}

