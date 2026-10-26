import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "./brand";
import { Icon } from "./ui-icon";
import { ContentSectionNav } from "./content-section-nav";
export function EditorShell({ id, name, current, children }: {
  id: string; name: string; current: "content" | "details"; children: ReactNode;
}) {
  return <div className="editor-workspace">
    <aside className="editor-sidebar" aria-label="Client context">
      <Brand />
      <Link href="/admin" className="editor-back"><Icon name="back" />Back to Businesses</Link>
      <Link href={`/admin/businesses/${id}`} className="client-context" aria-label={`Business overview for ${name}`}><span aria-hidden="true">{name.slice(0, 1)}</span><strong>{name}</strong></Link>
      {current === "content" ? <><div className="editor-desktop-nav"><ContentSectionNav /></div><details className="editor-mobile-nav"><summary>Content sections</summary><ContentSectionNav /></details></> : <p className="editor-sidebar-note">Update this business’s contact and location details.</p>}
    </aside>
    <section className="editor-body">{children}</section>
  </div>;
}
