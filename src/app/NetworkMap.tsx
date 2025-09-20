"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  CircleMarker,
  useMap,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Zone = {
  id: string;
  label?: string;
  severity: number;        // 0..1 (0=low, 1=high)
  coords: LatLngTuple[];   // [lat, lng]
};

const colorFor = (s: number) => (s >= 0.7 ? "#ef4444" : s >= 0.4 ? "#f59e0b" : "#84cc16");

/** ---- Dallas mock polygons ----
 * Rough boxes for Downtown, Deep Ellum, and Design District/Oak Lawn.
 * Swap with backend data later.
 */
const SEED: Zone[] = [
  {
    id: "A",
    label: "Downtown Dallas",
    severity: 0.72,
    coords: [
      [32.778, -96.810],
      [32.786, -96.810],
      [32.786, -96.796],
      [32.778, -96.796],
    ],
  },
  {
    id: "B",
    label: "Deep Ellum",
    severity: 0.48,
    coords: [
      [32.780, -96.792],
      [32.788, -96.792],
      [32.788, -96.775],
      [32.780, -96.775],
    ],
  },
  {
    id: "C",
    label: "Design District / Oak Lawn",
    severity: 0.22,
    coords: [
      [32.802, -96.830],
      [32.812, -96.830],
      [32.812, -96.812],
      [32.802, -96.812],
    ],
  },
];

// Fit map view to all zones
function FitToZones({ zones }: { zones: Zone[] }) {
  const map = useMap();
  useEffect(() => {
    if (!zones.length) return;
    const bounds = zones.reduce(
      (b, z) => {
        z.coords.forEach((pt) => b.extend(pt));
        return b;
      },
      new L.LatLngBounds(zones[0].coords)
    );
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [zones, map]);
  return null;
}

export default function NetworkMap() {
  const [zones, setZones] = useState<Zone[]>(SEED);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Simulate live updates until backend is ready
  useEffect(() => {
    const id = setInterval(() => {
      setZones((prev) =>
        prev.map((z) => {
          const bump = (Math.random() - 0.5) * 0.16; // -0.08..0.08
          const severity = Math.max(0, Math.min(1, z.severity + bump));
          return { ...z, severity };
        })
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const center = useMemo(() => [32.7767, -96.7970] as LatLngTuple, []);

  return (
    <div className="w-full h-[520px] rounded-xl overflow-hidden relative">
      {/* Legend */}
      <div className="absolute z-[500] bottom-3 left-3 bg-[#0f1418]/80 border border-[#2a3238] rounded-lg px-3 py-2 text-xs text-gray-200">
        <div className="font-semibold mb-1">Congestion</div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#84cc16" }} />
          Low
          <span className="inline-block w-3 h-3 rounded-sm ml-3" style={{ background: "#f59e0b" }} />
          Medium
          <span className="inline-block w-3 h-3 rounded-sm ml-3" style={{ background: "#ef4444" }} />
          High
        </div>
      </div>

      <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <FitToZones zones={zones} />

        {zones.map((z) => {
          const hovered = hoverId === z.id;
          const color = colorFor(z.severity);
          return (
            <Polygon
              key={z.id}
              positions={z.coords}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: hovered ? 0.75 : 0.55,
                weight: hovered ? 2.5 : 1.2,
              }}
              eventHandlers={{
                mouseover: () => setHoverId(z.id),
                mouseout: () => setHoverId((cur) => (cur === z.id ? null : cur)),
              }}
            >
              <Tooltip sticky>
                <div className="text-xs">
                  <div className="font-semibold">{z.label ?? z.id}</div>
                  Congestion: {(z.severity * 100).toFixed(0)}%
                </div>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Tower markers around Dallas */}
        <CircleMarker center={[32.790, -96.820]} radius={6} pathOptions={{ color: "#67e8f9", fillColor: "#67e8f9", fillOpacity: 0.9 }} />
        <CircleMarker center={[32.770, -96.790]} radius={6} pathOptions={{ color: "#67e8f9", fillColor: "#67e8f9", fillOpacity: 0.9 }} />
        <CircleMarker center={[32.805, -96.780]} radius={6} pathOptions={{ color: "#67e8f9", fillColor: "#67e8f9", fillOpacity: 0.9 }} />
      </MapContainer>
    </div>
  );
}
