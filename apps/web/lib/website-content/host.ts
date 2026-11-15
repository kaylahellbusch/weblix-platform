/** Recognize tenant hosts; the page validates the label before looking up data. */
export function publicSubdomain(host: string | null, rootDomain: string | undefined): string | null {
  const root = rootDomain?.trim().toLowerCase().replace(/\.$/, "");
  const hostname = host?.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  if (!root || !hostname || hostname === "vercel.app" || hostname.endsWith(".vercel.app")) return null;
  if (!hostname.endsWith(`.${root}`)) return null;
  const label = hostname.slice(0, -(root.length + 1));
  return label === "www" ? null : label;
}
