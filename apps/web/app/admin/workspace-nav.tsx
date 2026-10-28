"use client";
import Link from "next/link";
import { Icon } from "@/app/ui/ui-icon";
import { usePathname } from "next/navigation";
export function WorkspaceNav() {
  // Adding and importing businesses start from the business list, so those pages stay under Businesses.
  const listing = usePathname() === "/admin";
  return <nav aria-label="Workspace" className="workspace-nav">
    <Link href="/admin" aria-current={listing ? "page" : "true"}><Icon name="business" />Businesses</Link>
  </nav>;
}
