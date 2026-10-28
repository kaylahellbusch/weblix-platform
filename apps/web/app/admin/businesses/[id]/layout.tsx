import type { ReactNode } from "react";

// The business sidebar lives in the admin layout; this only frames the business pages.
export default function BusinessLayout({ children }: { children: ReactNode }) {
  return <div className="editor-body">{children}</div>;
}
