import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const TIMEOUT_MS = 8_000;

let client: GoogleGenAI | null = null;

export function geminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function getClient(): GoogleGenAI {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

/**
 * Asks Gemini for JSON and validates it against a schema.
 * Throws when the key is missing, the call times out, or the output does not match the schema,
 * so each agent can fall back to its rule engine.
 */
export async function askGemini<T>(system: string, prompt: string, schema: z.ZodType<T>): Promise<T> {
  if (!geminiAvailable()) throw new Error("GEMINI_API_KEY is not set");

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      temperature: 0.4,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    },
  });

  const raw = response.text;
  if (!raw) throw new Error("Empty response from Gemini");
  return schema.parse(JSON.parse(raw));
}
