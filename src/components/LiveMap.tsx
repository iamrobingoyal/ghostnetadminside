import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { EmergencyRecord } from "../types";

interface Props {
  records: EmergencyRecord[];
  selectedPacketId: string | null;
  onSelectPacket: (id: string) => void;
  onUpdateStatus: (id: string, status: any, team?: string) => void;
}

export const LiveMap: React.FC<Props> = ({
  records,
  selectedPacketId,
  onSelectPacket,
  onUpdateStatus,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Use latest record coordinates if available, otherwise default
    const initialLat = records.length > 0 ? records[0].latitude : 28.6139;
    const initialLng = records.length > 0 ? records[0].longitude : 77.2090;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Pan when records change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMarkerMap = markersRef.current;
    const activeIds = new Set<string>();
    const latLngs: L.LatLngExpression[] = [];

    // Coordinate occurrence counter for clean multi-user clustering/spiderification
    const coordOccurrences = new Map<string, number>();

    records.forEach((record) => {
      activeIds.add(record.packetId);

      const coordKey = `${record.latitude.toFixed(4)},${record.longitude.toFixed(4)}`;
      const occurrence = coordOccurrences.get(coordKey) || 0;
      coordOccurrences.set(coordKey, occurrence + 1);

      // If multiple survivors share the exact same location, fan out markers in a circle (~20m)
      let displayLat = record.latitude;
      let displayLng = record.longitude;
      if (occurrence > 0) {
        const angle = occurrence * (Math.PI / 3);
        const radius = 0.00018 * Math.ceil(occurrence / 6);
        displayLat += Math.sin(angle) * radius;
        displayLng += Math.cos(angle) * radius;
      }

      latLngs.push([displayLat, displayLng]);

      const isCritical = record.triageScore >= 80;
      const isHigh = record.triageScore >= 65 && record.triageScore < 80;
      const isResolved = record.status === "RESOLVED";

      const bgColor = isResolved
        ? "#10b981"
        : isCritical
        ? "#ef4444"
        : isHigh
        ? "#f97316"
        : "#3b82f6";

      const isSelected = selectedPacketId === record.packetId;

      // Custom high-contrast HTML marker
      const customHtml = `
        <div class="${isCritical && !isResolved ? "custom-emergency-marker" : ""}" style="
          width: ${isSelected ? "44px" : "36px"};
          height: ${isSelected ? "44px" : "36px"};
          background-color: ${bgColor};
          border: 3px solid ${isSelected ? "#ffffff" : "#18181b"};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          font-size: 13px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          cursor: pointer;
        ">
          ${record.crisisType === 1 ? "🏥" : record.crisisType === 2 ? "🏚️" : record.crisisType === 3 ? "🔥" : record.crisisType === 4 ? "🌊" : "🆘"}
        </div>
      `;

      const icon = L.divIcon({
        className: "ghostnet-map-icon",
        html: customHtml,
        iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
        iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
      });

      let marker = currentMarkerMap.get(record.packetId);

      if (!marker) {
        marker = L.marker([displayLat, displayLng], { icon }).addTo(map);
        marker.on("click", () => {
          onSelectPacket(record.packetId);
        });
        currentMarkerMap.set(record.packetId, marker);
      } else {
        marker.setLatLng([displayLat, displayLng]);
        marker.setIcon(icon);
      }

      // Popup Content
      const popupContent = `
        <div style="font-family: sans-serif; color: #18181b; min-width: 200px;">
          <div style="font-size: 14px; font-weight: 900; color: ${bgColor}; margin-bottom: 4px;">
            ${record.crisisName} (${record.status})
          </div>
          <div style="font-size: 11px; color: #52525b; margin-bottom: 6px;">
            ID: <b>${record.packetId}</b>
          </div>
          <div style="font-size: 12px; margin-bottom: 4px;">
            AI Triage: <b>${record.triageScore}/100</b> | Urgency: <b>${record.urgency}/9</b>
          </div>
          <div style="font-size: 12px; margin-bottom: 4px;">
            Battery: <b>${record.battery}%</b> | Mesh Hops: <b>${record.hopCount}</b>
          </div>
          <div style="font-size: 11px; color: #71717a; margin-bottom: 8px;">
            Location: <b>${record.latitude.toFixed(5)}, ${record.longitude.toFixed(5)}</b>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
    });

    // Remove stale markers
    for (const [id, marker] of currentMarkerMap.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        currentMarkerMap.delete(id);
      }
    }

    // Auto-center or fit bounds on live records
    if (latLngs.length === 1) {
      const single = records[0];
      map.setView([single.latitude, single.longitude], 15);
    } else if (latLngs.length > 1) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [records, selectedPacketId, onSelectPacket]);

  // When selectedPacketId changes, pan to that specific victim
  useEffect(() => {
    if (!selectedPacketId || !mapInstanceRef.current) return;
    const selected = records.find((r) => r.packetId === selectedPacketId);
    if (selected) {
      mapInstanceRef.current.panTo([selected.latitude, selected.longitude]);
      const marker = markersRef.current.get(selectedPacketId);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedPacketId, records]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full dark-tiles z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-zinc-950/90 border border-zinc-800 p-2.5 rounded-xl text-[11px] space-y-1 shadow-lg backdrop-blur-sm">
        <div className="font-bold text-zinc-300 mb-1">Triage Priority</div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-zinc-400">Critical (&ge; 80)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-zinc-400">High (65 - 79)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-zinc-400">Standard (&lt; 65)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-zinc-400">Resolved</span>
        </div>
      </div>
    </div>
  );
};
