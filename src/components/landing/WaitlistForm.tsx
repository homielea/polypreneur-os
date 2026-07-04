import { useState, type FormEvent } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaitlistForm({ id }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "already">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("sending");
    const { error: insertError } = await supabase
      .from("waitlist_signups")
      .insert({ email: email.trim().toLowerCase() });
    if (!insertError) {
      setState("done");
    } else if (insertError.code === "23505") {
      setState("already");
    } else {
      setState("idle");
      setError(insertError.message);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <p className="text-sm text-muted-foreground">
        The waitlist isn't wired up in this preview build.
      </p>
    );
  }
  if (state === "done") {
    return <p className="text-sm">You're on the list. One email when it's ready — that's all.</p>;
  }
  if (state === "already") {
    return <p className="text-sm">You're already on the list. Good instinct, twice.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <Input
        id={id}
        type="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={state === "sending" || !email.trim()}>
        {state === "sending" ? "…" : "Join the waitlist"}
      </Button>
      {error && <p className="text-sm text-destructive sm:w-full">{error}</p>}
    </form>
  );
}
