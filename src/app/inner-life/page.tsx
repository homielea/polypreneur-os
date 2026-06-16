"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getJSON, sendJSON } from "@/lib/client";
import type { Activity, Checkin, Habit, HabitLog, Venture } from "@/lib/types";
import { cn } from "@/lib/utils";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const MOODS = ["focused", "calm", "inspired", "tired", "anxious", "flat"];

export default function InnerLifePage() {
  const qc = useQueryClient();
  const today = todayStr();

  const checkins = useQuery({
    queryKey: ["checkins"],
    queryFn: () => getJSON<Checkin[]>("/api/checkins"),
  });
  const habits = useQuery({
    queryKey: ["habits"],
    queryFn: () => getJSON<Habit[]>("/api/habits"),
  });
  const habitLogs = useQuery({
    queryKey: ["habit-logs"],
    queryFn: () => getJSON<HabitLog[]>("/api/habit-logs"),
  });
  const activities = useQuery({
    queryKey: ["activities"],
    queryFn: () => getJSON<Activity[]>("/api/activities"),
  });
  const ventures = useQuery({
    queryKey: ["ventures-list"],
    queryFn: () => getJSON<{ ventures: Venture[] }>("/api/ventures"),
  });

  const todayCheckin = checkins.data?.find((c) => c.date === today) ?? null;

  // check-in form state
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState(3);
  const [text, setText] = useState("");
  const [contentFlag, setContentFlag] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (checkins.data && !loaded) {
      if (todayCheckin) {
        setMood(todayCheckin.emotional_state);
        setEnergy(todayCheckin.energy_level);
        setText(todayCheckin.free_text);
        setContentFlag(todayCheckin.content_flag);
      }
      setLoaded(true);
    }
  }, [checkins.data, loaded, todayCheckin]);

  const saveCheckin = useMutation({
    mutationFn: () =>
      sendJSON("/api/checkins", "POST", {
        date: today,
        emotional_state: mood,
        energy_level: energy,
        free_text: text,
        content_flag: contentFlag,
      }),
    onSuccess: () => {
      toast.success("Check-in saved");
      qc.invalidateQueries({ queryKey: ["checkins"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
  });

  const logValue = (habitId: string, value: string) =>
    sendJSON("/api/habit-logs", "POST", { habit_id: habitId, date: today, value });

  const logHabit = useMutation({
    mutationFn: (v: { habitId: string; value: string }) =>
      logValue(v.habitId, v.value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habit-logs"] }),
  });

  // activities touched today, grouped by venture (the schema date-join)
  const touchedToday = (activities.data ?? []).filter((a) => a.date === today);
  const touchedVentureIds = Array.from(
    new Set(touchedToday.map((a) => a.venture_id)),
  );
  const ventureName = (id: string) =>
    ventures.data?.ventures.find((v) => v.id === id)?.name ?? "—";

  const logFor = (habitId: string) =>
    habitLogs.data?.find((l) => l.habit_id === habitId && l.date === today)?.value ??
    "";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Inner Life OS</h1>
        <p className="text-muted-foreground">
          Not a mood journal — the data-collection apparatus for the v2
          correlation engine. Every entry is timestamped and joinable to the
          ventures you touched that day.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Today&apos;s check-in {todayCheckin && <Badge className="ml-2">saved</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Emotional state</Label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm capitalize transition-colors",
                    mood === m
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <Input
              className="mt-2"
              placeholder="…or describe it"
              value={MOODS.includes(mood) ? "" : mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2 block">Energy (1–5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setEnergy(n)}
                  className={cn(
                    "h-10 w-10 rounded-md border text-sm font-semibold transition-colors",
                    energy === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="freetext" className="mb-2 block">
              Notes
            </Label>
            <Textarea
              id="freetext"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <Label htmlFor="content-flag" className="font-medium">
                Content potential
              </Label>
              <p className="text-xs text-muted-foreground">
                Flag this for the Scribe as a Lea&apos;s Lessons input.
              </p>
            </div>
            <Switch
              id="content-flag"
              checked={contentFlag}
              onCheckedChange={setContentFlag}
            />
          </div>

          <Button onClick={() => saveCheckin.mutate()} disabled={saveCheckin.isPending}>
            {todayCheckin ? "Update check-in" : "Save check-in"}
          </Button>
        </CardContent>
      </Card>

      <HabitsCard
        habits={habits.data ?? []}
        logFor={logFor}
        onLog={(habitId, value) => logHabit.mutate({ habitId, value })}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ventures touched today</CardTitle>
          <p className="text-sm text-muted-foreground">
            Derived by joining today&apos;s activity to your check-in on the
            shared date axis — the link that powers the correlation engine.
          </p>
        </CardHeader>
        <CardContent>
          {touchedVentureIds.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No venture activity logged today yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {touchedVentureIds.map((id) => (
                <Badge key={id} variant="secondary">
                  {ventureName(id)}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HabitsCard({
  habits,
  logFor,
  onLog,
}: {
  habits: Habit[];
  logFor: (id: string) => string;
  onLog: (habitId: string, value: string) => void;
}) {
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");

  const refresh = () => qc.invalidateQueries({ queryKey: ["habits"] });

  const add = useMutation({
    mutationFn: () =>
      sendJSON("/api/habits", "POST", { name: newName, target: newTarget }),
    onSuccess: () => {
      setNewName("");
      setNewTarget("");
      refresh();
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const del = useMutation({
    mutationFn: (id: string) => sendJSON(`/api/habits/${id}`, "DELETE"),
    onSuccess: refresh,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Habits</CardTitle>
        <p className="text-sm text-muted-foreground">
          Operator-defined. Add, rename, retarget, or remove freely.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {habits.length === 0 && (
          <p className="text-sm text-muted-foreground">No habits yet.</p>
        )}
        {habits.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            value={logFor(h.id)}
            onLog={onLog}
            onChanged={refresh}
            onDelete={() => del.mutate(h.id)}
          />
        ))}

        <div className="flex flex-wrap items-end gap-2 border-t pt-3">
          <div className="min-w-[140px] flex-1">
            <Label className="mb-1 block text-xs">New habit</Label>
            <Input
              placeholder="e.g. Sleep"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="w-32">
            <Label className="mb-1 block text-xs">Target</Label>
            <Input
              placeholder="e.g. 8h"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => add.mutate()}
            disabled={!newName.trim() || add.isPending}
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HabitRow({
  habit,
  value,
  onLog,
  onChanged,
  onDelete,
}: {
  habit: Habit;
  value: string;
  onLog: (habitId: string, value: string) => void;
  onChanged: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(habit.name);
  const [target, setTarget] = useState(habit.target);
  const [logValue, setLogValue] = useState(value);

  useEffect(() => setLogValue(value), [value]);

  const save = useMutation({
    mutationFn: () =>
      sendJSON(`/api/habits/${habit.id}`, "PATCH", { name, target }),
    onSuccess: () => {
      setEditing(false);
      onChanged();
    },
  });

  if (editing) {
    return (
      <div className="flex flex-wrap items-end gap-2 rounded-md border px-3 py-2">
        <Input
          className="w-40"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          className="w-28"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <Button size="sm" onClick={() => save.mutate()}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{habit.name}</p>
        <p className="text-xs text-muted-foreground">target: {habit.target || "—"}</p>
      </div>
      <Input
        className="w-24"
        placeholder="today"
        value={logValue}
        onChange={(e) => setLogValue(e.target.value)}
        onBlur={() => logValue !== value && onLog(habit.id, logValue)}
      />
      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditing(true)}>
        <Pencil className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 px-2 text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
