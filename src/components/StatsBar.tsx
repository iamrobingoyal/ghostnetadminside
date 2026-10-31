import React from "react";
import { NetworkStats } from "../types";

interface Props {
  stats: NetworkStats;
  connected: boolean;
}

export const StatsBar: React.FC<Props> = ({ stats, connected }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-3 bg-zinc-900 border-b border-zinc-800 text-xs">
      <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col">
        <span className="text-zinc-500 font-bold uppercase text-[10px]">Command Uplink</span>
        <div className="flex items-center space-x-1.5 mt-1">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              connected ? "bg-emerald-400 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="font-bold text-zinc-200">
            {connected ? "LIVE SOCKET" : "RECONNECTING"}
          </span>
        </div>
      </div>

      <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col">
        <span className="text-zinc-500 font-bold uppercase text-[10px]">Active Gateways</span>
        <span className="text-lg font-black text-blue-400 mt-0.5">{stats.activeGateways} Online</span>
      </div>

      <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col">
        <span className="text-zinc-500 font-bold uppercase text-[10px]">Pending Triage</span>
        <span className="text-lg font-black text-red-400 mt-0.5">{stats.pendingAlerts} Critical</span>
      </div>

      <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col">
        <span className="text-zinc-500 font-bold uppercase text-[10px]">Units Dispatched</span>
        <span className="text-lg font-black text-amber-400 mt-0.5">{stats.dispatchedAlerts} En Route</span>
      </div>

      <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col">
        <span className="text-zinc-500 font-bold uppercase text-[10px]">Rescues Resolved</span>
        <span className="text-lg font-black text-emerald-400 mt-0.5">{stats.resolvedAlerts} Safe</span>
      </div>

      <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col">
        <span className="text-zinc-500 font-bold uppercase text-[10px]">Avg Mesh Depth</span>
        <span className="text-lg font-black text-purple-400 mt-0.5">{stats.averageHops} Hops</span>
      </div>
    </div>
  );
};

