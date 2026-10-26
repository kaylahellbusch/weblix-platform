"use client";
import { useSyncExternalStore } from "react";
import { Icon } from "./ui-icon";
const sections = [
  { hash: "#headline-section", label: "Homepage", icon: "business" },
  { hash: "#introduction-section", label: "Introduction", icon: "compact" },
  { hash: "#services-section", label: "Services", icon: "compact" },
  { hash: "#areas-section", label: "Service areas", icon: "location" },
] as const;
function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
export function ContentSectionNav() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash || "#headline-section", () => "#headline-section");
  return <nav className="workspace-nav content-section-nav" aria-label="Content sections">
    {sections.map(section => <a key={section.hash} href={section.hash} aria-current={hash === section.hash ? "location" : undefined}><Icon name={section.icon} />{section.label}</a>)}
  </nav>;
}
