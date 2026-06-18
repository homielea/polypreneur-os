import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/cockpit/nav";

export const metadata: Metadata = {
  title: "Polypreneur OS",
  description:
    "The judgment layer. One cockpit for many ventures — the human decides, agents execute.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen bg-muted/30">
            <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:block">
              <div className="px-5 py-5">
                <div className="text-lg font-bold tracking-tight">
                  Polypreneur OS
                </div>
                <div className="text-xs text-muted-foreground">
                  The judgment layer
                </div>
              </div>
              <Nav />
            </aside>
            <main className="flex-1 overflow-x-hidden">
              <div className="mx-auto max-w-5xl px-5 py-8">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
