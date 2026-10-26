"use client";
import Link from "next/link";
import { Icon } from "@/app/ui/ui-icon";
import { usePathname } from "next/navigation";
export function WorkspaceNav() {
  const pathname = usePathname();
  const importing = pathname.includes("/import");
  return <nav aria-label="Workspace" className="workspace-nav">
    <Link href="/admin" aria-current={!importing ? "page" : undefined}><Icon name="business" />Businesses</Link>
    <Link href="/admin/businesses/import" aria-current={importing ? "page" : undefined}>Review CSV</Link>
  </nav>;
}
