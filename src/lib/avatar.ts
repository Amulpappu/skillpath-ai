/**
 * Original generated profile pictures (no third-party artwork):
 *  - identicon: a mirrored 5×5 pattern, like a GitHub default avatar
 *  - badge: a bold glyph on a two-colour gradient, like a game profile picture
 *  - mono: the person's initials on a coloured tile
 * Stored as "<style>:<seed>" in profiles.avatar_choice.
 */
export type AvatarStyle = "identicon" | "badge" | "mono";
export const AVATAR_CHOICE = /^(identicon|badge|mono):[a-z0-9]{1,16}$/;

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10).replace(/[^a-z0-9]/g, "") || "seed";
}

const GLYPHS = [
  "M50 18l9.4 19 21 3-15.2 14.8 3.6 20.9L50 65.8 31.2 75.7l3.6-20.9L19.6 40l21-3z", // star
  "M56 14L28 54h18l-6 32 32-44H54z", // bolt
  "M50 16l30 34-30 34-30-34z", // diamond
  "M50 80S20 60 20 40a15 15 0 0 1 30-6 15 15 0 0 1 30 6c0 20-30 40-30 40z", // heart
  "M50 16l29 17v34L50 84 21 67V33z", // hexagon
  "M50 18l34 60H16z", // triangle
  "M40 18h20v22h22v20H60v22H40V60H18V40h22z", // plus
  "M36 30L18 50l18 20 6-6-12-14 12-14zm28 0l-6 6 12 14-12 14 6 6 18-20zM54 22l-16 56h8l16-56z", // </>
];

export function avatarSvg(choice: string, name = ""): string {
  const [style, seed] = choice.split(":") as [AvatarStyle, string];
  const h = hash(seed);
  const hue = h % 360;
  if (style === "identicon") {
    const fg = `hsl(${hue} 55% 52%)`;
    let cells = "";
    for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) {
      if (((h >>> (x * 5 + y)) & 1) === 0) continue;
      cells += `<rect x="${10 + x * 16}" y="${10 + y * 16}" width="16" height="16"/>`;
      if (x < 2) cells += `<rect x="${10 + (4 - x) * 16}" y="${10 + y * 16}" width="16" height="16"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f2f5"/><g fill="${fg}">${cells}</g></svg>`;
  }
  if (style === "badge") {
    const hue2 = (hue + 40 + (h >>> 9) % 80) % 360;
    const glyph = GLYPHS[(h >>> 20) % GLYPHS.length];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 75% 55%)"/><stop offset="1" stop-color="hsl(${hue2} 70% 35%)"/></linearGradient></defs><rect width="100" height="100" fill="url(#g${seed})"/><path d="${glyph}" fill="#fff" fill-opacity=".92"/></svg>`;
  }
  const initials = name.trim().split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
  const safe = initials.replace(/[^A-Z0-9?]/g, "?");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="hsl(${hue} 45% 40%)"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="-apple-system,Segoe UI,Helvetica,Arial,sans-serif" font-size="40" font-weight="600" fill="#fff">${safe}</text></svg>`;
}

export function avatarDataUri(choice: string, name = ""): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg(choice, name))}`;
}

/** A fresh set of suggestions: identicons, badges and an initials tile. */
export function suggestions(count = 11): string[] {
  const styles: AvatarStyle[] = ["identicon", "badge"];
  return [...Array.from({ length: count }, (_, i) => `${styles[i % 2]}:${randomSeed()}`), `mono:${randomSeed()}`];
}
