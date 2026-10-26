import type { ReactNode } from "react";
import { signOutAction } from "@/app/admin/actions";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { Brand } from "@/app/ui/brand";
import { WorkspaceNav } from "./workspace-nav";
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser();
  return <div className="workspace">
    <a className="skip-link" href="#workspace-content">Skip to content</a>
    <aside className="workspace-sidebar">
      <Brand />
      <div className="desktop-nav"><WorkspaceNav /></div>
      <details className="mobile-nav"><summary>Workspace menu</summary><WorkspaceNav /></details>
      <div className="workspace-account"><p className="text-sm">Signed in as <span>{user.email}</span></p>
        <form action={signOutAction}><button type="submit" className="secondary">Sign out</button></form>
      </div>
    </aside>
    <main id="workspace-content" className="workspace-content" tabIndex={-1}>{children}</main>
  </div>;
}
