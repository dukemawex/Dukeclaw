import { runProducer } from "./producer.js";
import { validateForExport } from "./director.js";
import { getPendingJobs, updateJobStatus, writeAgentLog } from "../skills/skill-appwrite.js";

const intervalMs = Number.parseInt(process.env.HEARTBEAT_INTERVAL_MS ?? "10000", 10);
let running = false;

async function processPendingJobs(): Promise<void> {
  if (running) {
    return;
  }

  running = true;

  try {
    const jobs = await getPendingJobs();

    for (const job of jobs) {
      try {
        await writeAgentLog({
          jobId: job.$id,
          agent: "Director",
          level: "info",
          message: "Heartbeat picked up pending job",
          timestampIso: new Date().toISOString()
        });

        await updateJobStatus(job.$id, "InProgress");

        const produced = await runProducer(job);
        await updateJobStatus(job.$id, "InProgress", {
          remotionPropsJson: produced.remotionPropsJson,
          estimatedDurationSec: produced.estimatedDurationSec
        });

        const refreshedJob = {
          ...job,
          remotionPropsJson: produced.remotionPropsJson,
          estimatedDurationSec: produced.estimatedDurationSec
        };

        const decision = await validateForExport(refreshedJob);

        if (!decision.approved) {
          const status = decision.reason === "Manual approval required" ? "AwaitingApproval" : "Failed";
          await updateJobStatus(job.$id, status, {
            notes: decision.reason
          });
          continue;
        }

        await updateJobStatus(job.$id, "ReadyToRender");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await writeAgentLog({
          jobId: job.$id,
          agent: "Director",
          level: "error",
          message: "Job processing failed",
          metadata: { error: message },
          timestampIso: new Date().toISOString()
        });
        await updateJobStatus(job.$id, "Failed", { notes: message });
      }
    }
  } finally {
    running = false;
  }
}

export function startHeartbeat(): NodeJS.Timeout {
  void processPendingJobs();
  return setInterval(() => {
    void processPendingJobs();
  }, intervalMs);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`[${new Date().toISOString()}] Heartbeat loop starting with interval ${intervalMs}ms`);
  startHeartbeat();
}
