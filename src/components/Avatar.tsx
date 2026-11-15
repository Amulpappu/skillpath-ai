import { AVATAR_CHOICE, avatarDataUri } from "@/lib/avatar";

/** Profile picture: a chosen generated avatar, else the Google/GitHub photo, else initials. */
export function Avatar({ choice, photo, name, size = 40, className = "" }: { choice?: string | null; photo?: string | null; name?: string | null; size?: number; className?: string }) {
  const src = choice && AVATAR_CHOICE.test(choice) ? avatarDataUri(choice, name ?? "")
    : photo && /^https:\/\//.test(photo) ? photo
    : avatarDataUri(`mono:${(name ?? "x").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16) || "x"}`, name ?? "");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} referrerPolicy="no-referrer"
      className={`shrink-0 rounded-full border border-line bg-subtle object-cover ${className}`} style={{ width: size, height: size }} />
  );
}
