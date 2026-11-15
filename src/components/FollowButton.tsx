"use client";

import { useState } from "react";

export function FollowButton({ userId, initial, onChange }: { userId: string; initial: boolean; onChange?: (following: boolean) => void }) {
  const [following, setFollowing] = useState(initial);
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    const next = !following;
    const res = await fetch("/api/follow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, follow: next }) });
    setBusy(false);
    if (res.ok) { setFollowing(next); onChange?.(next); }
  }
  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={following}
      className={`rounded-md border px-3 py-1 text-sm font-medium disabled:opacity-60 ${following ? "border-line bg-subtle text-ink hover:border-bad hover:text-bad" : "border-line bg-card text-ink hover:bg-subtle"}`}>
      {following ? "Following" : "Follow"}
    </button>
  );
}
