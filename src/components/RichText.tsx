import { Fragment } from "react";

/**
 * Renders question text that may contain ```fenced code``` and `inline code` as real code,
 * without using dangerouslySetInnerHTML (the text is never parsed as HTML).
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/```(?:[a-z0-9+#-]*)\n?([\s\S]*?)```/gi);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} className="my-2 overflow-x-auto rounded-lg bg-ink px-3 py-2 font-mono text-[13px] leading-relaxed text-paper"><code>{part.replace(/\n$/, "")}</code></pre>
        ) : (
          <Fragment key={i}>{inline(part)}</Fragment>
        ),
      )}
    </span>
  );
}

function inline(text: string) {
  return text.split(/`([^`]+)`/g).map((t, i) =>
    i % 2 === 1 ? (
      <code key={i} className="whitespace-pre-wrap rounded bg-paper px-1 py-0.5 font-mono text-[0.9em]">{t}</code>
    ) : (
      <span key={i} className="whitespace-pre-wrap">{t}</span>
    ),
  );
}
