/** Read env vars safely (trim + strip accidental quotes). */
export function env(name: string): string {
  const raw = process.env[name];
  if (!raw) return "";
  return raw.trim().replace(/^["']|["']$/g, "");
}
