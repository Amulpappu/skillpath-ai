import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({ title, id, children, aside }: { title: string; id: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-md border border-line bg-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const style =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-hover"
      : "border border-line bg-card text-ink hover:border-ink";
  return (
    <button
      type="button"
      {...props}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${style} ${className}`}
    />
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted";

export const labelClass = "mb-1 block text-sm font-medium";
