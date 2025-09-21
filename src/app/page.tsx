"use client";

import React, { FormEvent, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { FaCheckCircle, FaTruck } from "react-icons/fa";
import { generateRecipe } from "./actions";
import type { NetworkMapHandle } from "./NetworkMap";

// ✅ Import map client-side only to avoid `window is not defined`
const NetworkMap = dynamic(() => import("./NetworkMap"), { ssr: false });

// Configure Amplify once
Amplify.configure(outputs, { ssr: true });

const Card = ({
  title,
  className = "",
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <section className={`rounded-2xl bg-[#1b2227] border border-[#2a3238] p-5 shadow ${className}`}>
    {title ? (
      <h3 className="text-sm tracking-widest text-gray-300/70 font-semibold mb-3">{title}</h3>
    ) : null}
    {children}
  </section>
);

const StatusRow = ({ ok, label, suffix }: { ok: boolean; label: string; suffix?: string }) => (
  <div className="flex items-center justify-between py-1.5">
    <div className="flex items-center gap-2">
      <FaCheckCircle className={ok ? "opacity-90" : "opacity-60"} />
      <span className="text-gray-200/90">{label}</span>
    </div>
    <span className={ok ? "text-sm text-emerald-400" : "text-sm text-amber-400"}>
      {suffix ?? (ok ? "OK" : "WARN")}
    </span>
  </div>
);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<NetworkMapHandle>(null);

  async function geocode(q: string) {
    if (!q.trim()) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&limit=1&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "UpliftDashboard/1.0",
        Referer: typeof window !== "undefined" ? window.location.origin : "",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name as string,
      };
    }
    return null;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const form = event.currentTarget as HTMLFormElement;
      const formData = new FormData(form);

      // Use the “Location” field to geocode and fly the map + drop pin
      const q = (formData.get("ingredients") || "").toString();
      if (q) {
        const loc = await geocode(q);
        if (loc) {
          mapRef.current?.flyTo(loc.lat, loc.lng, { zoom: 14, place: loc.displayName });
        }
      }

      await generateRecipe(formData); // keep your server action
      alert("Uplift request submitted 👍");
      form.reset();
    } catch (e: any) {
      alert(`An error occurred: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-white bg-[#0f1418]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl tracking-[0.2em] font-semibold text-gray-200/90">
            NETWORK DEMAND FOR EMERGENCIES
          </h1>
          <button className="rounded-lg border border-[#2a3238] px-3 py-2 text-sm text-gray-300/90 hover:bg-[#151b20]">
            ☰
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-0 lg:col-span-2">
          <NetworkMap ref={mapRef} />
        </Card>

        <Card title="NETWORK STATUS">
          <div className="space-y-1.5">
            <StatusRow ok label="Cell Sites" />
            <StatusRow ok label="Backhaul" />
            <StatusRow ok label="Power" suffix="OK 2" />
          </div>
        </Card>

        <Card title="DEMAND METRICS">
          <div className="space-y-2 text-gray-200/90">
            <div className="flex justify-between">
              <span>Active Sessions</span>
              <span className="font-semibold">2,500</span>
            </div>
            <div className="flex justify-between">
              <span>Data Throughput</span>
              <span className="font-semibold">450 Mbps</span>
            </div>
            <div className="flex justify-between">
              <span>Voice Traffic</span>
              <span className="font-semibold">120 calls</span>
            </div>
          </div>
        </Card>

        <Card title="DEPLOYABLES">
          <div className="divide-y divide-[#2a3238]/80">
            {[
              { name: "COLT", status: "Active" },
              { name: "COLT", status: "In Transit" },
              { name: "COLT", status: "30 min" },
            ].map((d, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <FaTruck className="text-gray-300/80" />
                  <span className="text-gray-200/90">{d.name}</span>
                </div>
                <span className="text-sm text-gray-300">{d.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="UPLIFT REQUEST">
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="text-sm text-gray-300/80 block">Location:</label>
            <input
              name="ingredients"
              placeholder="e.g., 400 S Houston St, Dallas TX"
              className="w-full rounded-lg bg-[#0f1418] border border-[#2a3238] px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500/40"
            />
            <button
              disabled={loading}
              className="w-full rounded-xl py-2.5 font-semibold bg-[#2e6fe7] hover:bg-[#2b66d4] disabled:opacity-60 transition"
            >
              {loading ? "Submitting..." : "SUBMIT"}
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}
