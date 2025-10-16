"use client";

import { useEffect, useMemo } from "react";

export interface AtlasCanvasProps {
  prompts: string[];
  focusMetric: number;
  anxietyMetric: number;
  onIntensityChange?: (value: number) => void;
}

export function AtlasCanvas({ prompts, focusMetric, anxietyMetric, onIntensityChange }: AtlasCanvasProps) {
  const gradient = useMemo(() => {
    const focusPercent = Math.round(focusMetric * 100);
    const anxietyPercent = Math.round(anxietyMetric * 100);
    return `radial-gradient(circle at ${focusPercent}% ${100 - anxietyPercent}%, #38bdf8, #9333ea)`;
  }, [focusMetric, anxietyMetric]);

  useEffect(() => {
    if (onIntensityChange) {
      onIntensityChange(Math.max(0, Math.min(1, (focusMetric + (1 - anxietyMetric)) / 2)));
    }
  }, [onIntensityChange, focusMetric, anxietyMetric]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
      <div
        className="h-48 rounded-2xl transition-all"
        style={{ backgroundImage: gradient }}
        aria-hidden
      />
      <div className="mt-6 space-y-2">
        <p className="text-sm uppercase tracking-widest text-slate-400">Fear Console Prompts</p>
        <ul className="list-disc space-y-1 pl-6 text-left text-slate-200">
          {prompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">
          Focus: {(focusMetric * 100).toFixed(1)}% · Anxiety: {(anxietyMetric * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
