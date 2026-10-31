import React, { useState } from "react";
import { EmergencyRecord, RescueStatus } from "../types";
import { TriageCard } from "./TriageCard";

interface Props {
  records: EmergencyRecord[];
  selectedPacketId: string | null;
  onSelectPacket: (id: string) => void;
  onUpdateStatus: (packetId: string, status: RescueStatus, team?: string) => void;
}

export const PriorityQueue: React.FC<Props> = ({
  records,
  selectedPacketId,
  onSelectPacket,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const filtered = records.filter((r) => {
    if (search.trim()) {
      const matchId = r.packetId.toLowerCase().includes(search.toLowerCase());
      const matchCrisis = r.crisisName.toLowerCase().includes(search.toLowerCase());
      if (!matchId && !matchCrisis) return false;
    }

    if (filter === "ALL") return true;
    if (filter === "PENDING") return r.status === "PENDING";
    if (filter === "CRITICAL") return r.triageScore >= 80;
    if (filter === "TRAPPED") return r.crisisType === 2;
    if (filter === "MEDICAL") return r.crisisType === 1;
    if (filter === "FIRE") return r.crisisType === 3;
    if (filter === "RESOLVED") return r.status === "RESOLVED";
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
      {/* Header & Filter Controls */}
      <div className="p-3 border-b border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
            Priority Triage Queue
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/80">
            {filtered.length} Alerts
          </span>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by ID or emergency..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {["ALL", "PENDING", "CRITICAL", "TRAPPED", "MEDICAL", "RESOLVED"].map((chip) => (
            <button
              key={chip}
              onClick={() => setFilter(chip)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filter === chip
                  ? "bg-zinc-200 text-zinc-900 shadow"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-600 text-xs">
            <span className="text-3xl block mb-2">🛡️</span>
            No active emergencies matching filter.
          </div>
        ) : (
          filtered.map((record) => (
            <TriageCard
              key={record.packetId}
              record={record}
              isSelected={selectedPacketId === record.packetId}
              onSelect={() => onSelectPacket(record.packetId)}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};

