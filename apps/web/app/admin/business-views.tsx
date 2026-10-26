"use client";
import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import type { Business } from "@/lib/businesses/repository";
const preferenceKey = "weblix-business-view";
const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("weblix-view", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("weblix-view", callback); };
};
function storedView() {
  try { return localStorage.getItem(preferenceKey) === "compact" ? "compact" : "grid"; } catch { return "grid"; }
}
export function BusinessViews({ businesses }: { businesses: Business[] }) {
  const stored = useSyncExternalStore(subscribe, storedView, () => "grid");
  const [chosen, setChosen] = useState<string>();
  const view = chosen ?? stored;
  const [search, setSearch] = useState("");
  const query = search.trim().toLocaleLowerCase();
  const matches = businesses.filter(business => [business.name, business.industry, business.website, business.city, business.state].filter(Boolean).join(" ").toLocaleLowerCase().includes(query));
  function select(next: string) {
    setChosen(next);
    try { localStorage.setItem(preferenceKey, next); window.dispatchEvent(new Event("weblix-view")); } catch { /* Browsing remains usable without storage. */ }
  }
  return <>
    <div className="business-toolbar">
      <div className="search-field"><label htmlFor="business-search">Search businesses</label><input type="search" id="business-search" placeholder="Name, industry, website or location" value={search} onChange={event => setSearch(event.target.value)} /></div>
      <div className="view-switch" role="group" aria-label="Business view">{["grid", "compact"].map(option => <button key={option} type="button" aria-pressed={view === option} onClick={() => select(option)}>{option === "grid" ? "Grid" : "Compact"}</button>)}</div>
    </div>
    <p role="status" className="result-count">{matches.length} {matches.length === 1 ? "business" : "businesses"}{query ? " matching your search" : " in your workspace"}</p>
    {businesses.length === 0 ? <div className="empty-panel"><h2>No businesses yet</h2><p>Add your first business or review a CSV to get started.</p></div> : matches.length === 0 ? <div className="empty-panel"><h2>No matching businesses</h2><p>Try a different name, industry, website or location.</p><button className="secondary" onClick={() => setSearch("")}>Clear search</button></div> :
      <ul className={`business-list ${view}`}>{matches.map(business => <li key={business.id} className="business-card">
        <div className="website-placeholder" aria-hidden="true"><svg viewBox="0 0 40 32" width="40" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="36" height="28" rx="3"/><path d="M2 9h36M8 16h13M8 22h23"/></svg><span>Website preview unavailable</span></div>
        <div className="business-meta"><h2>{business.name}</h2><p>{business.industry}</p><p>{[business.city, business.state].filter(Boolean).join(", ") || "Location not provided"}</p><p>{business.website || "Website not provided"}</p></div>
        <div className="business-actions"><Link className="secondary" href={`/admin/businesses/${business.id}/content`} aria-label={`Edit website for ${business.name}`}>Edit website</Link><Link href={`/admin/businesses/${business.id}`} aria-label={`View details for ${business.name}`}>View details</Link></div>
      </li>)}</ul>}
  </>;
}
