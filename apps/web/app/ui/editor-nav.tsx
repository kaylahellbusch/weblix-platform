import Link from "next/link";
export function EditorNav({ id, current }: { id: string; current: "content" | "details" }) {
  return <nav className="editor-tabs" aria-label="Business editor">
    <Link href={`/admin/businesses/${id}/content`} aria-current={current === "content" ? "page" : undefined}>Content</Link>
    <Link href={`/admin/businesses/${id}/edit`} aria-current={current === "details" ? "page" : undefined}>Details</Link>
  </nav>;
}
