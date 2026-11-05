import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weblix Platform",
  description: "A clean foundation for business data and website generation workflows.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" data-type="software" data-radius="soft" data-ground="sage" data-buttons="solid" data-motion="">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
