import type { ReactNode } from "react";
import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getOwnedBusinesses } from "@/lib/businesses/owned";
import { Brand } from "@/app/ui/brand";
import { SidebarNav } from "./sidebar-nav";
import { WorkspaceAccount } from "./workspace-account";
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser();
  // Names for the business sidebar; a load failure just leaves the name as a placeholder.
  const businesses = await getOwnedBusinesses().then(list => list.map(({ id, name }) => ({ id, name })), () => []);
  return <div className="workspace">
    <a className="skip-link" href="#workspace-content">Skip to content</a>
    <aside className="workspace-sidebar">
      <Link href="/admin" className="brand-link"><Brand /></Link>
      <SidebarNav businesses={businesses} />
      <WorkspaceAccount email={user.email} />
    </aside>
    <main id="workspace-content" className="workspace-content" tabIndex={-1}>{children}</main>
  </div>;
}
