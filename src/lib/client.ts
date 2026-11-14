import type { AgentEvent, StreamMessage } from "./types";

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

/** Posts JSON and reads an NDJSON stream, calling `onEvent` for each agent update. Resolves with the final result. */
export async function streamAgents<T>(url: string, body: unknown, onEvent: (event: AgentEvent) => void): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok || !response.body) throw new Error(await errorMessage(response));

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: T | undefined;

  const handle = (line: string) => {
    if (!line.trim()) return;
    const message = JSON.parse(line) as StreamMessage<T>;
    if (message.type === "agent") onEvent(message.event);
    else if (message.type === "result") result = message.data;
    else throw new Error(message.message);
  };

  for (;;) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    lines.forEach(handle);
    if (done) break;
  }
  handle(buffer);

  if (result === undefined) throw new Error("The agents did not return a result. Please try again.");
  return result;
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await errorMessage(response));
  return (await response.json()) as T;
}
