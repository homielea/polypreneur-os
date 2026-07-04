import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { Compass, Lightbulb, LogOut, ScrollText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app", label: "Today", icon: Compass, end: true },
  { to: "/app/ledger", label: "Ledger", icon: ScrollText, end: false },
  { to: "/app/ideas", label: "Ideas", icon: Lightbulb, end: false },
];

export default function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 md:min-h-screen md:w-52 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:py-6">
        <div className="md:mb-8">
          <NavLink to="/app" className="font-semibold tracking-tight">
            Polypreneur OS
          </NavLink>
        </div>
        <nav className="flex gap-1 md:flex-col">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="md:mt-auto">
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Sign out</span>
          </Button>
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
