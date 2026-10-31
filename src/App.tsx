import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { StatsBar } from "./components/StatsBar";
import { LiveMap } from "./components/LiveMap";
import { PriorityQueue } from "./components/PriorityQueue";
import { EmergencyRecord, NetworkStats, RescueStatus } from "./types";
import { BACKEND_URL } from "./config";

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [records, setRecords] = useState<EmergencyRecord[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    totalAlerts: 0,
    pendingAlerts: 0,
    dispatchedAlerts: 0,
    resolvedAlerts: 0,
    activeGateways: 0,
    averageHops: 0,
  });
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  useEffect(() => {
    const s = io(BACKEND_URL, {
      reconnectionAttempts: 20,
      reconnectionDelay: 1500,
    });

    s.on("connect", () => {
      setConnected(true);
    });

    s.on("disconnect", () => {
      setConnected(false);
    });

    s.on("emergency:initial_state", (data: { records: EmergencyRecord[]; stats: NetworkStats }) => {
      setRecords(data.records || []);
      if (data.stats) setStats(data.stats);
    });

    s.on("emergency:new", (newRecord: EmergencyRecord) => {
      setRecords((prev) => {
        const existingIdx = prev.findIndex((r) => r.packetId === newRecord.packetId);
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = newRecord;
          return copy;
        }
        return [newRecord, ...prev].sort((a, b) => b.triageScore - a.triageScore);
      });

      setBannerAlert(`🚨 NEW EMERGENCY RECEIVED: ${newRecord.crisisName} (AI Triage Score: ${newRecord.triageScore}/100)`);
      setTimeout(() => setBannerAlert(null), 6000);
    });

    s.on("emergency:update", (updatedRecord: EmergencyRecord) => {
      setRecords((prev) =>
        prev
          .map((r) => (r.packetId === updatedRecord.packetId ? updatedRecord : r))
          .sort((a, b) => b.triageScore - a.triageScore)
      );
    });

    s.on("emergency:status_change", (changedRecord: EmergencyRecord) => {
      setRecords((prev) =>
        prev.map((r) => (r.packetId === changedRecord.packetId ? changedRecord : r))
      );
    });

    s.on("stats:update", (newStats: NetworkStats) => {
      setStats(newStats);
    });

    s.on("database:reset", () => {
      setRecords([]);
      setSelectedPacketId(null);
    });

    setSocket(s);

    fetch(`${BACKEND_URL}/api/packets`)
      .then((res) => res.json())
      .then((data) => {
        if (data.records) setRecords(data.records);
      })
      .catch((e) => console.warn("Fetch initial fallback error:", e));

    fetch(`${BACKEND_URL}/api/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((e) => console.warn("Fetch stats fallback error:", e));

    return () => {
      s.disconnect();
    };
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await fetch(`${BACKEND_URL}/api/simulate/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch (e) {
      console.error("Simulation error:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateCluster = async () => {
    setIsSimulating(true);
    try {
      const centerLat = records.length > 0 ? records[0].latitude : 30.6805;
      const centerLng = records.length > 0 ? records[0].longitude : 76.6054;

      await fetch(`${BACKEND_URL}/api/simulate/cluster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centerLat, centerLng, count: 5 }),
      });
      setBannerAlert("👥 MULTI-USER CLUSTER TEST: 5 simultaneous survivors in disaster zone triaged!");
      setTimeout(() => setBannerAlert(null), 6000);
    } catch (e) {
      console.error("Cluster simulation error:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/reset`, { method: "POST" });
    } catch (e) {
      console.error("Reset error:", e);
    }
  };

  const handleUpdateStatus = async (
    packetId: string,
    status: RescueStatus,
    team?: string
  ) => {
    try {
      await fetch(`${BACKEND_URL}/api/packets/${packetId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assignedTeam: team }),
      });
    } catch (e) {
      console.error("Update status error:", e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Alert Banner */}
      {bannerAlert && (
        <div className="bg-red-600 text-white font-black text-center py-2 px-4 text-xs animate-bounce z-50 shadow-lg">
          {bannerAlert}
        </div>
      )}

      {/* Commander Top Header */}
      <header className="h-14 px-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-lg shadow-md">
            📡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-black tracking-wide text-zinc-100">
                GhostNet AI-Triage Command Hub
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800 rounded-md">
                Rescuer Console
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Live Mesh Gateway Ingestion & Spatial Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateCluster}
            disabled={isSimulating}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow active:scale-95 transition-all disabled:opacity-50"
            title="Simulate 5 multiple concurrent survivors in the same disaster area"
          >
            <span>👥</span>
            <span>{isSimulating ? "..." : "Simulate 5 Multi-Users"}</span>
          </button>

          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow active:scale-95 transition-all disabled:opacity-50"
          >
            <span>⚡</span>
            <span>{isSimulating ? "Simulating..." : "Auto-Inject SOS"}</span>
          </button>

          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl text-xs font-bold transition"
            title="Reset database for fresh demo"
          >
            🗑️ Clear
          </button>

          <a
            href="/user"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl border border-zinc-700 text-xs transition"
          >
            📱 Open Survivor SOS App ➔
          </a>
        </div>
      </header>

      {/* Network Metrics Bar */}
      <StatsBar stats={stats} connected={connected} />

      {/* Split Body: Map View (Left) & Priority Triage Queue (Right) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 md:w-3/5 h-1/2 md:h-full relative">
          <LiveMap
            records={records}
            selectedPacketId={selectedPacketId}
            onSelectPacket={setSelectedPacketId}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>

        <div className="md:w-2/5 h-1/2 md:h-full border-t md:border-t-0 md:border-l border-zinc-800">
          <PriorityQueue
            records={records}
            selectedPacketId={selectedPacketId}
            onSelectPacket={setSelectedPacketId}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
      </div>
    </div>
  );
};

