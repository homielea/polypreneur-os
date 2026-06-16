import { WeightsEditor } from "@/components/cockpit/weights-editor";
import { CadenceEditor } from "@/components/cockpit/cadence-editor";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Tune how the cockpit ranks your leverage and how the Scribe runs. The
          ranking is always inspectable and overridable — no black box.
        </p>
      </header>
      <WeightsEditor />
      <CadenceEditor />
    </div>
  );
}
