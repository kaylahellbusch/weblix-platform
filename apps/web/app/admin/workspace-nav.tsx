"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function WorkspaceNav() {
  const pathname = usePathname();
  const importing = pathname.includes("/import");
  return <nav aria-label="Workspace" className="workspace-nav">
    <Link href="/admin" aria-current={!importing ? "page" : undefined}>Businesses</Link>
    <Link href="/admin/businesses/import" aria-current={importing ? "page" : undefined}>Review CSV</Link>
  </nav>;
}
