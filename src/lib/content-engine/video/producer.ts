/**
 * The Producer — turns an approved piece into a faceless short-form video
 * package (voiceover script, scene/b-roll plan, title, thumbnail concept).
 *
 * Depends only on the LlmPort (engine boundary) — no SDK/env imports. Falls back
 * to a deterministic stub when no LLM is configured, so the loop always runs.
 */

import type { LlmPort } from "@/lib/content-engine/ports";

export interface ProductionPackage {
  title: string;
  voiceover_script: string;
  scenes: string[];
  thumbnail_concept: string;
}

const SYSTEM = `You are The Producer — you turn an approved written piece into a FACELESS short-form video production package (no on-camera presenter; voiceover + b-roll).

Return ONLY a JSON object, no prose, with exactly these keys:
- "title": a punchy, curiosity-driven video title (<= 80 chars)
- "voiceover_script": the piece rewritten for spoken voiceover — tight, natural, ~60-90 seconds, no stage directions
- "scenes": an array of 4-8 short strings, each a concrete b-roll shot/visual that matches the voiceover beat by beat
- "thumbnail_concept": one sentence describing a faceless thumbnail (text overlay + visual)

Keep Lea's voice: plain-spoken, reflective, leverage/judgment themes. No hashtags. Output must be valid JSON.`;

function stubPackage(script: string): ProductionPackage {
  const seed = script.trim().split("\n").find((l) => l.trim()) ?? "a small lesson";
  return {
    title: "The one move that actually moved the needle",
    voiceover_script:
      `${seed} Here's the thing I keep relearning: the work is getting cheaper to do, ` +
      `so the rare part is deciding what's worth doing at all. Protect that decision. ` +
      `Everything else, hand off.`,
    scenes: [
      "Slow push-in on a sunrise over rooftops",
      "Hands closing a laptop, deliberate",
      "Time-lapse of a busy desk clearing to one notebook",
      "Close-up: a single checkbox being ticked",
      "Wide shot walking away down a quiet street",
    ],
    thumbnail_concept:
      "Bold text 'DO LESS, DECIDE MORE' over a faded busy-desk photo, one item in sharp focus.",
  };
}

function parsePackage(text: string, script: string): ProductionPackage {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    const obj = JSON.parse(cleaned) as Partial<ProductionPackage>;
    return {
      title: obj.title?.trim() || "Untitled",
      voiceover_script: obj.voiceover_script?.trim() || script,
      scenes: Array.isArray(obj.scenes) ? obj.scenes.filter(Boolean) : [],
      thumbnail_concept: obj.thumbnail_concept?.trim() || "",
    };
  } catch {
    return stubPackage(script);
  }
}

export async function produceVideoPackage(
  llm: LlmPort,
  script: string,
): Promise<ProductionPackage> {
  if (!llm.available) return stubPackage(script);
  const text = await llm.complete({
    system: SYSTEM,
    prompt: `Approved piece to adapt into a faceless video:\n\n${script}`,
    maxTokens: 2000,
  });
  return parsePackage(text, script);
}
