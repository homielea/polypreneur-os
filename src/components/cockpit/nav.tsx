"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Scale,
  HeartPulse,
  LayoutGrid,
  Lightbulb,
  Inbox,
  Send,
  LineChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Today", icon: Compass, hint: "Highest-leverage move" },
  { href: "/ledger", label: "Inversion Ledger", icon: Scale, hint: "Execution vs judgment" },
  { href: "/inner-life", label: "Inner Life OS", icon: HeartPulse, hint: "Check-in & habits" },
  { href: "/ventures", label: "Ventures", icon: LayoutGrid, hint: "80/20 focus cap" },
  { href: "/vault", label: "Idea Vault", icon: Lightbulb, hint: "Parked ideas" },
  { href: "/inbox", label: "Approval Inbox", icon: Inbox, hint: "Agent drafts" },
  { href: "/distribution", label: "Distribution", icon: Send, hint: "Publish approved content" },
  { href: "/analyst", label: "Analyst", icon: LineChart, hint: "Momentum & neglect radar" },
  { href: "/settings", label: "Settings", icon: Settings, hint: "Weights & cadence" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex flex-col leading-tight">
              <span>{item.label}</span>
              <span className="text-[11px] text-muted-foreground">{item.hint}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
