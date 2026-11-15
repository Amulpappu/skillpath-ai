import type { ReactNode } from "react";

/** Re-mounts on every page change so each page eases in. */
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
