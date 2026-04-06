import { TelemetryBoard } from "@/components/telemetry-board";

export default function Home(): React.ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Duke-Claw Control Room</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Real-time multi-agent telemetry for heartbeat, production, and director quality gates.
        </p>
      </header>
      <TelemetryBoard />
    </main>
  );
}
