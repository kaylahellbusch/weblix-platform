"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BusinessNav } from "@/app/ui/business-nav";
import { Icon } from "@/app/ui/ui-icon";
import { WorkspaceNav } from "./workspace-nav";

const businessPath = /^\/admin\/businesses\/([0-9a-f-]{36})(?:\/|$)/i;

/** The sidebar stays mounted across /admin; only this section switches between the workspace and a business. */
export function SidebarNav({ businesses }: { businesses: { id: string; name: string }[] }) {
  const id = usePathname().match(businessPath)?.[1];
  // On phones the workspace has only Businesses, which the logo already links to, so there is no menu.
  if (!id) return <div className="desktop-nav"><WorkspaceNav /></div>;
  const name = businesses.find(business => business.id === id)?.name;
  // On phones this collapses to one row: an icon-only back link and the business menu.
  return <div className="business-bar">
    <Link href="/admin" className="editor-back"><Icon name="back" /><span className="editor-back-label">Back to Businesses</span></Link>
    <div className="business-context">
      {name
        ? <p className="business-context-name"><span aria-hidden="true">{name.slice(0, 1)}</span>{name}</p>
        : <span className="loading-placeholder" aria-hidden="true" />}
      <BusinessNav id={id} name={name} />
    </div>
  </div>;
}
