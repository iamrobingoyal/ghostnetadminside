import React from "react";

export type ViewMode = "dual" | "survivor" | "command" | "relay";

interface Props {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onSimulate: () => void;
  onReset: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<Props> = ({
  activeView,
  onSelectView,
  onSimulate,
  onReset,
  isSimulating,
}) => {
  return (
    <header className="px-4 py-2 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
      {/* Brand & Tagline */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-xl shadow-md shadow-red-900/50">
          📡
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-black tracking-wide text-zinc-100">
              GhostNet Protocol
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/80 rounded-md">
              Offline Mesh + AI Triage
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Emergency SOS Network without Cellular or Wi-Fi
          </p>
        </div>
      </div>

      {/* View Switcher Pills */}
      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 space-x-1 text-xs">
        <button
          onClick={() => onSelectView("dual")}
          className={`px-3 py-1.5 rounded-lg font-black transition-all flex items-center space-x-1.5 ${
            activeView === "dual"
              ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>⚡</span>
          <span>Dual Screen (Demo)</span>
        </button>

        <button
          onClick={() => onSelectView("survivor")}
          className={`px-3 py-1.5 rounded-lg font-black transition-all flex items-center space-x-1.5 ${
            activeView === "survivor"
              ? "bg-red-700 text-white shadow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>📱</span>
          <span>Survivor Phone (User)</span>
        </button>

        <button
          onClick={() => onSelectView("command")}
          className={`px-3 py-1.5 rounded-lg font-black transition-all flex items-center space-x-1.5 ${
            activeView === "command"
              ? "bg-zinc-700 text-white shadow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>🗺️</span>
          <span>Rescue Command (Server)</span>
        </button>

        <button
          onClick={() => onSelectView("relay")}
          className={`px-3 py-1.5 rounded-lg font-black transition-all flex items-center space-x-1.5 ${
            activeView === "relay"
              ? "bg-blue-800 text-white shadow"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>📡</span>
          <span>Mesh Relay Node</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onSimulate}
          disabled={isSimulating}
          className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md shadow-red-900/40 active:scale-95 transition-all disabled:opacity-50"
          title="Simulate random survivor emergency beacon"
        >
          <span>⚡</span>
          <span>{isSimulating ? "Simulating..." : "Auto-Inject SOS"}</span>
        </button>

        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl text-xs font-bold active:scale-95 transition-all"
          title="Reset database for fresh demo"
        >
          🗑️ Clear
        </button>
      </div>
    </header>
  );
};
