"use client";

import React, { FormEvent, useState } from "react";
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { FaCheckCircle, FaTruck } from "react-icons/fa";
import { generateRecipe } from "./actions";
import NetworkMap from "./NetworkMap"; // <- if you put it in src/components/, use: ../components/NetworkMap

// Configure Amplify once
Amplify.configure(outputs, { ssr: true });

/** Local Card (simple wrapper for consistent tiles) */
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

  // Keep the same submit pipeline: FormData -> generateRecipe(formData)
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      await generateRecipe(formData); // unchanged backend call
      alert("Uplift request submitted 👍");
      (event.currentTarget as HTMLFormElement).reset();
    } catch (e) {
      alert(`An error occurred: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-white bg-[#0f1418]">
      {/* Header */}
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

      {/* Dashboard grid */}
      <div
        className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-10
                   grid grid-cols-1 lg:grid-cols-3 lg:auto-rows-[300px] gap-5"
      >
        {/* Interactive Map — spans 2 columns x 2 rows */}
        <Card className="p-0 lg:col-span-2 lg:row-span-2 h-full">
          <NetworkMap />
        </Card>

        {/* NETWORK STATUS */}
        <Card title="NETWORK STATUS" className="h-full">
          <div className="space-y-1.5">
            <StatusRow ok label="Cell Sites" />
            <StatusRow ok label="Backhaul" />
            <StatusRow ok label="Power" suffix="OK 2" />
          </div>
        </Card>

        {/* DEMAND METRICS */}
        <Card title="DEMAND METRICS" className="h-full">
          <div className="space-y-2 text-gray-200/90">
            <div className="flex justify-between"><span>Active Sessions</span><span className="font-semibold">2,500</span></div>
            <div className="flex justify-between"><span>Data Throughput</span><span className="font-semibold">450 Mbps</span></div>
            <div className="flex justify-between"><span>Voice Traffic</span><span className="font-semibold">120 calls</span></div>
          </div>
        </Card>

        {/* DEPLOYED ASSETS */}
        <Card title="DEPLOYED ASSETS" className="h-full">
          <div className="divide-y divide-[#2a3238]/80">
            {[
              { name: "SatCOLT", status: "Active" },
              { name: "SatCOLT", status: "In Transit" },
              { name: "SatCOLT", status: "30 min" },
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

        {/* Inventory/Assets */}
        <Card title="INVENTORY/ASSETS" className="h-full">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-200/90">COLT</span><span className="text-sm text-gray-300">Active</span></div>
            <div className="flex justify-between"><span className="text-gray-200/90">In Transit</span><span className="text-sm text-gray-300">15 min</span></div>
            <div className="flex justify-between"><span className="text-gray-200/90">Voice Traffic</span><span className="text-sm text-gray-300">120 calls</span></div>
          </div>
        </Card>

        {/* UPLIFT REQUEST — still posts to generateRecipe(formData) */}
        <Card title="UPLIFT REQUEST" className="h-full">
          <form onSubmit={onSubmit} className="space-y-3">
            {/* Keep this field name so actions.ts doesn't change */}
            <label className="text-sm text-gray-300/80 block">Location:</label>
            <input
              name="ingredients"
              placeholder="e.g., Austin, TX"
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
