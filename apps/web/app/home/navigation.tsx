"use client";

import { useRef } from "react";

export function MobileNavigation() {
  const menu = useRef<HTMLDetailsElement>(null);
  return (
    <details className="home-menu" ref={menu} onKeyDown={event => {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    }}>
      <summary>Menu</summary>
      <nav aria-label="Mobile navigation" onClick={event => {
        if ((event.target as HTMLElement).closest("a") && menu.current) menu.current.open = false;
      }}>
        <a href="#how-it-works">How it works</a>
        <a href="#workspace-examples">Workspace examples</a>
        <a href="/login">Log in</a>
      </nav>
    </details>
  );
}
