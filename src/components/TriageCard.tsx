import React, { useState } from "react";
import { EmergencyRecord, RescueStatus } from "../types";

interface Props {
  record: EmergencyRecord;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateStatus: (packetId: string, status: RescueStatus, team?: string) => void;
}

export const TriageCard: React.FC<Props> = ({
  record,
  isSelected,
  onSelect,
  onUpdateStatus,
}) => {
  const [showTeamInput, setShowTeamInput] = useState(false);
  const [teamName, setTeamName] = useState("Rescue Unit 1");

  const isCritical = record.triageScore >= 80;
  const isHigh = record.triageScore >= 65 && record.triageScore < 80;
  const isResolved = record.status === "RESOLVED";

  const priorityColor = isResolved
    ? "text-emerald-400 border-emerald-500/50 bg-emerald-950/40"
    : isCritical
    ? "text-red-400 border-red-500/50 bg-red-950/40"
    : isHigh
    ? "text-orange-400 border-orange-500/50 bg-orange-950/40"
    : "text-blue-400 border-blue-500/50 bg-blue-950/40";

  const handleDispatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showTeamInput) {
      setShowTeamInput(true);
    } else {
      onUpdateStatus(record.packetId, "DISPATCHED", teamName);
      setShowTeamInput(false);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-red-500 bg-zinc-900 shadow-xl shadow-red-950/40 scale-101"
          : isCritical && !isResolved
          ? "border-red-900/60 bg-zinc-900/90 hover:border-red-700"
          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
      }`}
    >
      {/* Top Header: Crisis & Priority Score */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">
            {record.crisisType === 1
              ? "🏥"
              : record.crisisType === 2
              ? "🏚️"
              : record.crisisType === 3
              ? "🔥"
              : record.crisisType === 4
              ? "🌊"
              : "🆘"}
          </span>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm text-zinc-100">{record.crisisName}</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${priorityColor}`}
              >
                Score {record.triageScore}
              </span>
            </div>
            <div className="font-mono text-[11px] text-zinc-500">
              ID: {record.packetId}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
            record.status === "RESOLVED"
              ? "bg-emerald-900 text-emerald-300"
              : record.status === "DISPATCHED"
              ? "bg-amber-900 text-amber-300"
              : record.status === "ACKNOWLEDGED"
              ? "bg-blue-900 text-blue-300"
              : "bg-red-900 text-red-300 animate-pulse"
          }`}
        >
          {record.status}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 my-3 text-center text-xs">
        <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase font-bold">Urgency</div>
          <div className="font-black text-red-400 mt-0.5">{record.urgency}/9</div>
        </div>

        <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase font-bold">Battery</div>
          <div
            className={`font-black mt-0.5 ${
              record.battery <= 20 ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {record.battery}%
          </div>
        </div>

        <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase font-bold">Mesh Hops</div>
          <div className="font-black text-purple-400 mt-0.5">
            {record.hopCount === 0 ? "Direct" : `${record.hopCount} Hops`}
          </div>
        </div>

        <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase font-bold">Coordinates</div>
          <div className="font-mono text-[10px] text-zinc-300 mt-0.5 truncate">
            {record.latitude.toFixed(3)}, {record.longitude.toFixed(3)}
          </div>
        </div>
      </div>

      {/* AI Triage Explanation */}
      {record.triageReason && (
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-2.5 text-[11px] text-zinc-300 mb-3">
          <div className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider mb-0.5">
            🤖 AI Triage Assessment
          </div>
          <p className="leading-relaxed">{record.triageReason}</p>
        </div>
      )}

      {/* Assigned Team Notice */}
      {record.assignedTeam && (
        <div className="text-[11px] text-amber-300 font-bold mb-2 flex items-center space-x-1">
          <span>🚒 Assigned:</span>
          <span>{record.assignedTeam}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-1 border-t border-zinc-800/80">
        {record.status === "PENDING" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(record.packetId, "ACKNOWLEDGED");
            }}
            className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 active:scale-95 transition-transform"
          >
            Acknowledge
          </button>
        )}

        {record.status !== "RESOLVED" && (
          <button
            onClick={handleDispatch}
            className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl active:scale-95 transition-transform"
          >
            {showTeamInput ? "Confirm Dispatch" : "Dispatch Unit"}
          </button>
        )}

        {record.status !== "RESOLVED" ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(record.packetId, "RESOLVED");
            }}
            className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
          >
            Mark Safe
          </button>
        ) : (
          <div className="text-xs text-emerald-400 font-bold py-1">
            ✅ Rescue Completed & Resolved
          </div>
        )}
      </div>

      {showTeamInput && (
        <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Unit Name (e.g. Squad-4)"
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white"
          />
        </div>
      )}
    </div>
  );
};

