import type { AgentEvent, StreamMessage } from "./types";

export type Emit = (event: AgentEvent) => void;

/**
 * Runs a pipeline and streams its agent events and final result as newline-delimited JSON,
 * so the browser can show each agent working as it happens.
 */
export function ndjsonResponse<T>(run: (emit: Emit) => Promise<T>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (message: StreamMessage<T>) => controller.enqueue(encoder.encode(`${JSON.stringify(message)}\n`));
      try {
        const data = await run((event) => send({ type: "agent", event }));
        send({ type: "result", data });
      } catch (error) {
        console.error("Pipeline failed", error);
        send({ type: "error", message: "The agents could not finish. Please try again." });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}
