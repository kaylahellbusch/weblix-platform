"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icon } from "./ui-icon";

export function BusinessNav({ id, name }: { id: string; name?: string }) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  // The phone menu floats over the page, so a tap elsewhere or Escape closes it.
  useEffect(() => {
    function clickAway(event: PointerEvent) {
      if (menu.current?.open && !menu.current.contains(event.target as Node)) menu.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape" || !menu.current?.open) return;
      menu.current.open = false;
      menu.current.querySelector("summary")?.focus();
    }
    document.addEventListener("pointerdown", clickAway);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", clickAway);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const content = pathname.endsWith("/content");
  const settings = pathname.endsWith("/settings");
  // Details also covers the edit page.
  const current = content ? "Content" : settings ? "Settings" : "Details";
  const links = <nav className="workspace-nav" aria-label="Business pages">
    <Link href={`/admin/businesses/${id}`} aria-current={current === "Details" ? "page" : undefined}><Icon name="details" />Details</Link>
    <Link href={`/admin/businesses/${id}/content`} aria-current={content ? "page" : undefined}><Icon name="content" />Content</Link>
    <Link href={`/admin/businesses/${id}/settings`} aria-current={settings ? "page" : undefined}><Icon name="settings" />Settings</Link>
  </nav>;
  return <>
    <div className="desktop-nav">{links}</div>
    {/* Keyed by path so the mobile menu closes after navigating. */}
    <details key={pathname} ref={menu} className="mobile-nav"><summary>
      <span className="sr-only">Business menu: </span>
      {name ? <><span className="mobile-nav-name">{name}</span><span className="sr-only">, </span></> : null}
      <span className="mobile-nav-page">{current}</span>
    </summary>{links}</details>
  </>;
}
