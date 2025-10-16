"use client";

import { useMemo, useState } from "react";
import { AtlasCanvas } from "@neuro-engine/ui";
import { pulseFocusModel } from "@neuro-engine/models";
import { studioSessionSchema } from "@neuro-engine/schemas";
import { formatLatency } from "@neuro-engine/utils";
import { PromptForge, defaultPrompts } from "@neuro-engine/ai";
import { defaultBlueprints } from "@neuro-engine/promptforge";

const sampleSession = studioSessionSchema.parse({
  id: "demo",
  creator: "websim.ai",
  prompts: ["soothing synesthesia", "algorithmic daydreams"],
  latencyMs: 42
});

const forge = new PromptForge();

defaultPrompts.forEach((blueprint) => forge.register(blueprint));

export default function Page() {
  const [intensity, setIntensity] = useState(0.42);
  const signal = pulseFocusModel(intensity);
  const ritualPrompt = useMemo(() => {
    const ritual = defaultBlueprints[0];
    return ritual.compile({ modality: "holographic sound garden", tone: "playful" });
  }, []);

  const segments = useMemo(
    () =>
      forge.build("websim:experience-designer", {
        theme: "neuro-inclusive collaboration",
        modalities: "haptics · volumetric light"
      }),
    []
  );

  return (
    <section className="w-full max-w-3xl space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Neurodivergent Creativity Engine</h1>
        <p className="text-slate-300">
          Harness deep focus patterns and playful entropy — optimized for websim.ai experiments.
        </p>
      </header>
      <AtlasCanvas
        prompts={sampleSession.prompts}
        focusMetric={signal.focus}
        anxietyMetric={signal.anxiety}
        onIntensityChange={setIntensity}
      />
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Prompt blueprints</h2>
        <div className="grid gap-3 text-sm text-left">
          <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="font-medium text-slate-100">Experience Designer Stack</h3>
            <p className="text-slate-400 whitespace-pre-wrap">
              {segments.map((segment) => `${segment.role.toUpperCase()}: ${segment.content}`).join("\n\n")}
            </p>
          </article>
          <article className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="font-medium text-slate-100">Ritual Blueprint</h3>
            <p className="text-slate-400 whitespace-pre-wrap">{ritualPrompt}</p>
          </article>
        </div>
      </section>
      <footer className="text-center text-sm text-slate-400">
        Session latency: {formatLatency(sampleSession.latencyMs)} · Session ID: {sampleSession.id}
      </footer>
    </section>
  );
}
