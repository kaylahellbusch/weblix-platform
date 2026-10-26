type IconName = "business" | "grid" | "compact" | "search" | "location" | "link" | "back" | "arrow";
const paths: Record<IconName, string> = {
  business: "M3 10h18M5 10v11h14V10M3 10l3-7h12l3 7M9 21v-7h6v7",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  compact: "M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01",
  search: "M21 21l-6-6M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  location: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  link: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2",
  back: "M20 12H4m7-7-7 7 7 7",
  arrow: "m9 5 7 7-7 7",
};
export function Icon({ name }: { name: IconName }) {
  return <svg aria-hidden="true" className="ui-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
