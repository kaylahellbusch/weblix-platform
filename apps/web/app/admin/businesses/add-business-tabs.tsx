"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/businesses/new", label: "Enter details" },
  { href: "/admin/businesses/import", label: "Import from CSV" },
] as const;

/** The two ways to add businesses, as tabs linking their pages so each keeps its own URL. */
export function AddBusinessTabs({ locked = false }: { locked?: boolean }) {
  const pathname = usePathname();
  return <nav className="add-business-tabs" aria-label="Ways to add businesses">
    {tabs.map(tab => <Link key={tab.href} href={tab.href} aria-current={pathname === tab.href ? "page" : undefined}
      aria-disabled={locked || undefined} onClick={event => { if (locked) event.preventDefault(); }}>{tab.label}</Link>)}
  </nav>;
}
