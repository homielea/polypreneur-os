import { Link } from "react-router-dom";
import { Compass, Lightbulb, ScrollText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

const features = [
  {
    icon: Compass,
    name: "Highest-Leverage Home Screen",
    body: "One screen that answers one question: where does the next hour go? Every action carries a leverage score, and the list reorders itself around what matters — with the reasoning visible, never a black box. Points only ever add up. Nothing decays, nothing shames, nothing streaks.",
  },
  {
    icon: ScrollText,
    name: "Great Inversion Ledger",
    body: "A running record of the moments your judgment created value that execution couldn't — the call you made, the thing you refused, the reframe that changed the outcome. Captured in seconds from anywhere in the app. Over time it becomes evidence of the one asset AI doesn't commoditize: yours.",
  },
  {
    icon: Lightbulb,
    name: "80/20 Enforcer + Idea Vault",
    body: "Every idea gets captured. Every idea faces the same quiet question: is this in the top 20% of leverage right now? What passes goes on today's list. What doesn't waits in a vault that resurfaces ideas for another look — a rhythm, not a graveyard, and never a deadline.",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold tracking-tight">Polypreneur OS</span>
        <Link to={user ? "/app" : "/login"} className="text-sm text-muted-foreground hover:text-foreground">
          {user ? "Open the app →" : "Sign in"}
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6">
        {/* Hero */}
        <section className="py-20 sm:py-28">
          <p className="text-sm text-muted-foreground">Pre-launch</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Many ventures. One place to decide what actually matters.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Polypreneur OS is a personal operating system for people running several things at
            once. It rests on one conviction: AI can execute almost anything now — it can't
            decide what's worth doing. This protects the space where you do.
          </p>
          <div className="mt-8">
            <WaitlistForm id="hero-email" />
            <p className="mt-2 text-xs text-muted-foreground">
              No countdowns, no drip campaigns. One email when it's ready.
            </p>
          </div>
        </section>

        {/* Problem / positioning */}
        <section className="border-t py-16 sm:py-20">
          <div className="max-w-2xl space-y-5 leading-relaxed">
            <p>
              It's 9:40 on a Tuesday. The coaching call went long, the newsletter draft is open
              in one tab, the retreat inquiry in another, and somewhere under all of it sits the
              product you swore you'd ship this quarter. None of it is failing. All of it is
              asking for the same hour.
            </p>
            <p>
              Every tool you've tried wants to make you <em>faster</em> — more tasks, more
              automation, more throughput. But execution was never the bottleneck. The moment
              you can generate ten drafts in a minute, the question stops being{" "}
              <em>how do I do more</em> and becomes <em>which of these deserves me at all</em>.
            </p>
            <p>
              That's the Great Inversion: as AI commoditizes execution, human judgment becomes
              the scarce, valuable layer. Polypreneur OS is built for that layer — not another
              task manager, but a thin surface above your ventures that keeps one question
              answerable every morning: <em>where does the next hour go?</em>
            </p>
          </div>
        </section>

        {/* Features as proof points */}
        <section className="border-t py-16 sm:py-20">
          <h2 className="text-xl font-semibold tracking-tight">
            Three parts, one discipline
          </h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {features.map(({ icon: Icon, name, body }) => (
              <div key={name}>
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="mt-3 font-medium">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Maker note */}
        <section className="border-t py-16 sm:py-20">
          <div className="max-w-2xl space-y-5 leading-relaxed">
            <p>
              I'm building this because I live it: coaching, retreats on the Galician coast,
              content brands, and a portfolio of small products — run in parallel, by one
              person, with an ADHD brain that no amount of color-coded calendars ever fixed.
              Polypreneur OS is the system I designed around how that actually works: rhythm
              over schedule, 80/20 over everything, and no gamified pressure anywhere.
            </p>
            <p className="text-muted-foreground">— Lea</p>
          </div>
        </section>

        {/* Final capture */}
        <section className="border-t py-16 sm:py-20">
          <h2 className="text-xl font-semibold tracking-tight">
            If you're running more than one thing, this is for you.
          </h2>
          <div className="mt-6">
            <WaitlistForm id="footer-email" />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-4xl border-t px-6 py-8 text-sm text-muted-foreground">
        Polypreneur OS · pre-launch
      </footer>
    </div>
  );
}
