"use client";

import React, {
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from "react";
import {
  MapContainer,
  TileLayer,
  Tooltip,
  CircleMarker,
  Circle,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ====== STRICTLY YOUR THREE DATASETS ====== */
const TOWERS_CSV = `tower_id,latitude,longitude,sessions,throughput_mbps,latency_ms,status,last_updated
KFA905,32.802639,-96.811944,,,,,
KKG410,32.792361,-96.785833,,,,,
KLB341,32.779306,-96.773056,,,,,
KLB342,32.759583,-96.7875,,,,,
KNKC295,32.78,-96.803889,,,,,
KNKC994,32.782056,-96.798333,,,,,
KNKI478,32.78,-96.803889,,,,,
KOR739,32.782056,-96.798333,,,,,
KPG788,32.775139,-96.805,,,,,
KPH272,32.802639,-96.811944,,,,,
KPN750,32.780139,-96.803889,,,,,
WIK273,32.767917,-96.788333,,,,,
WIK274,32.780833,-96.802222,,,,,
WIK275,32.752917,-96.772222,,,,,
WNMO923,32.777639,-96.815,,,,,
WNVG520,32.78,-96.803889,,,,,
WPHX939,32.781111,-96.809694,,,,,
WPIA879,32.780139,-96.803889,,,,,
WPLV413,32.780139,-96.803889,,,,,
WPLY943,32.780139,-96.804722,,,,,
WPMJ530,32.780139,-96.803889,,,,,
WPTL655,32.78,-96.803889,,,,,
WPTM743,32.780278,-96.801944,,,,,
WPXK795,32.780833,-96.802222,,,,,
WQDX668,32.780139,-96.803889,,,,,
WQEB401,32.785,-96.805556,,,,,
WQGR414,32.766722,-96.786667,,,,,
WQIW841,32.781389,-96.793306,,,,,
WQIW842,32.775833,-96.8075,,,,,
WQIW843,32.778611,-96.797222,,,,,
WQIW844,32.768056,-96.795278,,,,,
WQJY851,32.777639,-96.815,,,,,
WQMM748,32.782222,-96.775556,,,,,
WQYF413,32.754778,-96.778417,,,,,
WQZD501,32.78,-96.803889,,,,,`;

const INCIDENTS_CSV = `start_time,end_time,location,latitude,longitude,emergency_type,radius_km
08:45,10:30,I-35E near Downtown,32.7767,-96.81,Multi-vehicle accident,0.5
14:20,16:45,Deep Ellum District,32.7831,-96.7809,Building fire,7.0
19:15,20:30,Reunion Blvd,32.776,-96.8065,Gas leak,1.0`;

const FORECAST_CSV = `tower_id,timestamp,predicted_sessions,projected_throughput,predicted_latency
KFA905,2024-01-01 00:00:00,88,2500.0,49.24
KKG410,2024-01-01 00:00:00,83,2425.0,47.08
KLB341,2024-01-01 00:00:00,97,2450.0,50.74
KLB342,2024-01-01 00:00:00,81,2500.0,49.08
KNKC295,2024-01-01 00:00:00,50,2400.0,50.37
KNKC994,2024-01-01 00:00:00,110,2500.0,52.37
KNKI478,2024-01-01 00:00:00,86,2425.0,50.52
KOR739,2024-01-01 00:00:00,63,2450.0,51.88
KPG788,2024-01-01 00:00:00,67,2450.0,49.49
KPH272,2024-01-01 00:00:00,65,2475.0,44.66
KPN750,2024-01-01 00:00:00,105,2500.0,57.37
WIK273,2024-01-01 00:00:00,57,2500.0,50.5
WIK274,2024-01-01 00:00:00,104,2500.0,48.37
WIK275,2024-01-01 00:00:00,69,2400.0,45.24
WNMO923,2024-01-01 00:00:00,64,2475.0,46.57
WNVG520,2024-01-01 00:00:00,63,2500.0,49.39
WPHX939,2024-01-01 00:00:00,97,2425.0,54.49
WPIA879,2024-01-01 00:00:00,63,2500.0,50.91
WPLV413,2024-01-01 00:00:00,103,2500.0,53.53
WPLY943,2024-01-01 00:00:00,78,2400.0,47.09
WPMJ530,2024-01-01 00:00:00,50,2475.0,49.03
WPTL655,2024-01-01 00:00:00,51,2475.0,50.66
WPTM743,2024-01-01 00:00:00,75,2525.0,52.2
WPXK795,2024-01-01 00:00:00,78,2425.0,47.13
WQDX668,2024-01-01 00:00:00,111,2450.0,55.09
WQEB401,2024-01-01 00:00:00,50,2450.0,42.99
WQGR414,2024-01-01 00:00:00,88,2525.0,46.21
WQIW841,2024-01-01 00:00:00,105,2400.0,51.84
WQIW842,2024-01-01 00:00:00,112,2500.0,52.62
WQIW843,2024-01-01 00:00:00,90,2500.0,50.73
WQIW844,2024-01-01 00:00:00,69,2400.0,43.74
WQJY851,2024-01-01 00:00:00,64,2475.0,52.08
WQMM748,2024-01-01 00:00:00,109,2400.0,49.82
WQYF413,2024-01-01 00:00:00,57,2425.0,47.89
WQZD501,2024-01-01 00:00:00,90,2475.0,48.6
KFA905,2024-01-01 00:01:00,50,2425.0,43.02
KKG410,2024-01-01 00:01:00,120,2450.0,51.53
KLB341,2024-01-01 00:01:00,101,2375.0,50.27
KLB342,2024-01-01 00:01:00,127,2475.0,56.56
KNKC295,2024-01-01 00:01:00,80,2450.0,53.36
KNKC994,2024-01-01 00:01:00,53,2525.0,49.71
KNKI478,2024-01-01 00:01:00,78,2500.0,50.66
KOR739,2024-01-01 00:01:00,53,2525.0,50.35
KPG788,2024-01-01 00:01:00,102,2500.0,51.63
KPH272,2024-01-01 00:01:00,64,2475.0,47.99
KPN750,2024-01-01 00:01:00,52,2450.0,48.09
WIK273,2024-01-01 00:01:00,109,2500.0,52.68
WIK274,2024-01-01 00:01:00,62,2425.0,47.56
WIK275,2024-01-01 00:01:00,116,2450.0,54.71
WNMO923,2024-01-01 00:01:00,50,2475.0,51.1
WNVG520,2024-01-01 00:01:00,69,2475.0,48.97
WPHX939,2024-01-01 00:01:00,68,2475.0,49.06
WPIA879,2024-01-01 00:01:00,105,2475.0,52.98
WPLV413,2024-01-01 00:01:00,102,2475.0,48.9
WPLY943,2024-01-01 00:01:00,52,2400.0,46.79
WPMJ530,2024-01-01 00:01:00,50,2450.0,48.26
WPTL655,2024-01-01 00:01:00,127,2400.0,56.85
WPTM743,2024-01-01 00:01:00,50,2475.0,50.98
WPXK795,2024-01-01 00:01:00,64,2525.0,47.56
WQDX668,2024-01-01 00:01:00,59,2400.0,47.83
WQEB401,2024-01-01 00:01:00,52,2475.0,47.96
WQGR414,2024-01-01 00:01:00,55,2500.0,47.99
WQIW841,2024-01-01 00:01:00,113,2500.0,49.33
WQIW842,2024-01-01 00:01:00,50,2375.0,41.39
WQIW843,2024-01-01 00:01:00,63,2425.0,52.14
WQIW844,2024-01-01 00:01:00,87,2400.0,53.45
WQJY851,2024-01-01 00:01:00,54,2425.0,44.69
WQMM748,2024-01-01 00:01:00,82,2400.0,48.65
WQYF413,2024-01-01 00:01:00,75,2450.0,44.41
WQZD501,2024-01-01 00:01:00,63,2375.0,52.52
KFA905,2024-01-01 00:02:00,71,2500.0,46.6
KKG410,2024-01-01 00:02:00,79,2500.0,49.81
KLB341,2024-01-01 00:02:00,50,2400.0,50.73
KLB342,2024-01-01 00:02:00,73,2500.0,47.61
KNKC295,2024-01-01 00:02:00,51,2525.0,47.55
KNKC994,2024-01-01 00:02:00,73,2475.0,53.79
KNKI478,2024-01-01 00:02:00,92,2425.0,49.77
KOR739,2024-01-01 00:02:00,83,2500.0,53.43
KPG788,2024-01-01 00:02:00,105,2400.0,54.8
KPH272,2024-01-01 00:02:00,91,2500.0,52.66
KPN750,2024-01-01 00:02:00,50,2400.0,50.53
WIK273,2024-01-01 00:02:00,50,2400.0,44.74
WIK274,2024-01-01 00:02:00,84,2475.0,50.44
WIK275,2024-01-01 00:02:00,79,2475.0,45.62
WNMO923,2024-01-01 00:02:00,50,2425.0,41.89
WNVG520,2024-01-01 00:02:00,81,2525.0,53.07
WPHX939,2024-01-01 00:02:00,70,2450.0,46.53
WPIA879,2024-01-01 00:02:00,74,2475.0,49.76
WPLV413,2024-01-01 00:02:00,79,2500.0,49.84
WPLY943,2024-01-01 00:02:00,86,2475.0,53.17
WPMJ530,2024-01-01 00:02:00,109,2450.0,58.03
WPTL655,2024-01-01 00:02:00,103,2525.0,54.01
WPTM743,2024-01-01 00:02:00,85,2400.0,45.94
WPXK795,2024-01-01 00:02:00,79,2400.0,48.36
WQDX668,2024-01-01 00:02:00,93,2475.0,47.42
WQEB401,2024-01-01 00:02:00,55,2375.0,48.65
WQGR414,2024-01-01 00:02:00,91,2375.0,53.85
WQIW841,2024-01-01 00:02:00,61,2450.0,49.62
WQIW842,2024-01-01 00:02:00,83,2475.0,49.62`;

/* ====== TYPES ====== */
type Tower = { id: string; lat: number; lng: number };
type Forecast = {
  tower_id: string;
  timestamp: string;
  predicted_sessions: number;
  projected_throughput: number;
  predicted_latency: number;
};
type Incident = {
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
  location: string;
  lat: number;
  lng: number;
  emergency_type: string;
  radius_km: number;
};

export type NetworkMapHandle = {
  flyTo: (lat: number, lng: number, opts?: { zoom?: number; place?: string }) => void;
};

/* ====== HELPERS ====== */
const LEVEL_COLORS = {
  Normal: "#22c55e",
  High: "#f59e0b",
  Congested: "#ef4444",
} as const;

type Level = keyof typeof LEVEL_COLORS;

const hhmmToMinutes = (t: string) => {
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  return (isFinite(h) ? h : 0) * 60 + (isFinite(m) ? m : 0);
};
const minutesToHHMM = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

function parseTowers(csv: string): Tower[] {
  const lines = csv.trim().split(/\r?\n/);
  const out: Tower[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [id, la, lo] = lines[i].split(",");
    const lat = Number(la),
      lng = Number(lo);
    if (!id || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    out.push({ id, lat, lng });
  }
  return out;
}
function parseIncidents(csv: string): Incident[] {
  const lines = csv.trim().split(/\r?\n/);
  const out: Incident[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [start_time, end_time, location, lat, lng, emergency_type, radius_km] = lines[i].split(",");
    out.push({
      start_time,
      end_time,
      location,
      lat: Number(lat),
      lng: Number(lng),
      emergency_type,
      radius_km: Number(radius_km),
    });
  }
  return out;
}
function latestForecasts(csv: string): Map<string, Forecast> {
  const lines = csv.trim().split(/\r?\n/);
  const out = new Map<string, Forecast>();
  for (let i = 1; i < lines.length; i++) {
    const [tower_id, timestamp, s, thr, l] = lines[i].split(",");
    const f: Forecast = {
      tower_id,
      timestamp,
      predicted_sessions: Number(s),
      projected_throughput: Number(thr),
      predicted_latency: Number(l),
    };
    const prev = out.get(tower_id);
    if (!prev || new Date(f.timestamp) > new Date(prev.timestamp)) out.set(tower_id, f);
  }
  return out;
}

/** Your strict classification (no relaxation):
 *  - Congested if sessions > 2000 OR throughput < 1500
 *  - High      if sessions > 1500 OR throughput < 1500
 *  - Normal    otherwise
 */
function classifyForecastStrict(f: Forecast | undefined): Level {
  if (!f) return "Normal";
  const s = f.predicted_sessions;
  const tp = f.projected_throughput;
  if (s > 2000 || tp < 1500) return "Congested";
  if (s > 1500 || tp < 1500) return "High";
  return "Normal";
}

/** Haversine distance in km */
function kmBetween(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371; // km
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const A =
    s1 * s1 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(A));
}

/** If a tower lies within any ACTIVE incident radius, force it to Congested */
function levelWithEmergencyOverride(
  base: Level,
  tower: Tower,
  activeIncidents: Incident[]
): Level {
  for (let i = 0; i < activeIncidents.length; i++) {
    const e = activeIncidents[i];
    const d = kmBetween(tower.lat, tower.lng, e.lat, e.lng);
    if (d <= e.radius_km) return "Congested";
  }
  return base;
}

/* ====== COMPONENT (live/manual clock; towers go red inside active emergencies) ====== */
const NetworkMap = forwardRef<NetworkMapHandle, {}>(function NetworkMap(_, ref) {
  if (typeof window === "undefined") return null; // SSR guard

  const towers = useMemo(() => parseTowers(TOWERS_CSV), []);
  const incidents = useMemo(() => parseIncidents(INCIDENTS_CSV), []);
  const forecasts = useMemo(() => latestForecasts(FORECAST_CSV), []);

  // Search pin (from page geocoder)
  const [pin, setPin] = useState<{ lat: number; lng: number; label?: string } | null>(null);

  // Time control state (live/manual clock)
  const [mode, setMode] = useState<"live" | "manual">("live");
  const [manualMinutes, setManualMinutes] = useState<number>(9 * 60); // 09:00 default
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (mode !== "live") return;
    const id = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(id);
  }, [mode]);
  const minutesNow = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, [tick]);

  const selectedMinutes = mode === "live" ? minutesNow : manualMinutes;

  // Only incidents active at the selected time
  const activeIncidents = useMemo(() => {
    return incidents.filter((e) => {
      const start = hhmmToMinutes(e.start_time);
      const end = hhmmToMinutes(e.end_time);
      return selectedMinutes >= start && selectedMinutes <= end;
    });
  }, [incidents, selectedMinutes]);

  // expose flyTo so the page can focus the map and drop a pin
  const mapRef = useRef<L.Map | null>(null);
  useImperativeHandle(
    ref,
    () => ({
      flyTo(lat: number, lng: number, opts?: { zoom?: number; place?: string }) {
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], opts?.zoom ?? 14, { duration: 1.1 });
          setPin({ lat, lng, label: opts?.place });
        }
      },
    }),
    []
  );

  const center = useMemo<LatLngTuple>(() => [32.7767, -96.797], []);

  return (
    <div className="w-full h-[520px] rounded-xl overflow-hidden relative">
      {/* Legend (strict categories) */}
      <div className="absolute z-[500] bottom-3 left-3 bg-[#0f1418]/85 border border-[#2a3238] rounded-md px-3 py-2 text-xs text-gray-200">
        <div className="font-semibold mb-1">Severity (Strict)</div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: LEVEL_COLORS.Normal }} /> Normal
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: LEVEL_COLORS.High }} /> High
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: LEVEL_COLORS.Congested }} /> Congested
        </div>
      </div>

      {/* Time controls */}
      <div className="absolute z-[500] bottom-3 right-3 bg-[#0f1418]/85 border border-[#2a3238] rounded-md px-3 py-2 text-xs text-gray-200 w-[250px]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Time</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("live")}
              className={`px-2 py-0.5 rounded ${mode === "live" ? "bg-[#2563eb] text-white" : "bg-[#1b2227] border border-[#2a3238]"}`}
            >
              Live
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`px-2 py-0.5 rounded ${mode === "manual" ? "bg-[#2563eb] text-white" : "bg-[#1b2227] border border-[#2a3238]"}`}
            >
              Manual
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300/90">{minutesToHHMM(selectedMinutes)}</span>
          {mode === "manual" ? (
            <input
              type="range"
              min={0}
              max={1439}
              step={5}
              value={manualMinutes}
              onChange={(e) => setManualMinutes(parseInt(e.target.value, 10))}
              className="w-[160px]"
              title="Pick a time"
            />
          ) : (
            <span className="text-gray-400">live clock</span>
          )}
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={12}
        minZoom={3}
        maxZoom={19}
        scrollWheelZoom
        zoomControl
        whenCreated={(m) => (mapRef.current = m)}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Emergency radius circles — ONLY currently active ones */}
        {activeIncidents.map((e, i) => (
          <Circle
            key={`${e.location}-${i}`}
            center={[e.lat, e.lng]}
            radius={e.radius_km * 1000}
            pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.18, weight: 2 }}
          >
            <Tooltip sticky>
              <div className="text-xs">
                <div className="font-semibold">{e.location}</div>
                <div>{e.emergency_type}</div>
                <div>
                  {e.start_time}–{e.end_time} • {e.radius_km} km radius
                </div>
              </div>
            </Tooltip>
          </Circle>
        ))}

        {/* Tower markers — strict severity + emergency override to red */}
        {towers.map((t) => {
          const f = forecasts.get(t.id);
          const baseLevel = classifyForecastStrict(f);
          const level = levelWithEmergencyOverride(baseLevel, t, activeIncidents);
          const color = LEVEL_COLORS[level];

          // Size: small variation so congested pops a bit
          const size =
            level === "Congested" ? 12 : level === "High" ? 9 : 7;

          return (
            <CircleMarker
              key={t.id}
              center={[t.lat, t.lng]}
              radius={size}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 1.3 }}
            >
              <Tooltip sticky>
                <div className="text-xs">
                  <div className="font-semibold">{t.id}</div>
                  <div>
                    {t.lat.toFixed(5)}, {t.lng.toFixed(5)}
                  </div>
                  {f ? (
                    <>
                      <div className="mt-1 font-semibold">Latest Forecast</div>
                      <div>
                        {new Date(f.timestamp).toLocaleString()} • Sess {f.predicted_sessions} • Thr{" "}
                        {f.projected_throughput.toFixed(0)} • Lat {f.predicted_latency.toFixed(0)} ms
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-300/80">No forecast</div>
                  )}
                  <div className="mt-1">Severity: <b>{level}</b>{level !== baseLevel ? " (Emergency override)" : ""}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Optional search pin from page */}
        {pin && (
          <CircleMarker
            center={[pin.lat, pin.lng]}
            radius={10}
            pathOptions={{ color: "#a78bfa", fillColor: "#a78bfa", fillOpacity: 0.3, weight: 2 }}
          >
            <Tooltip sticky>
              <div className="text-xs">
                <div className="font-semibold">Search Location</div>
                <div>{pin.label || `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
});

export default NetworkMap;
