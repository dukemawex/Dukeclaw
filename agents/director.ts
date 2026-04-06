import { remotionCompositionPropsSchema } from "../shared/schemas.js";
import type { VideoJob } from "../shared/types.js";
import { writeAgentLog } from "../skills/skill-appwrite.js";

const toleranceSeconds = 3;

function estimateScriptDurationFromNarration(remotionPropsJson: string): number {
  const parsed = remotionCompositionPropsSchema.parse(JSON.parse(remotionPropsJson));
  const total = parsed.scenes.reduce((acc, scene) => acc + scene.durationSec, 0);
  return Number(total.toFixed(2));
}

export async function validateForExport(job: VideoJob): Promise<{ approved: boolean; reason?: string }> {
  if (!job.remotionPropsJson) {
    throw new Error("Director validation requires remotionPropsJson.");
  }

  const estimateFromProps = estimateScriptDurationFromNarration(job.remotionPropsJson);
  const estimateFromJob = job.estimatedDurationSec ?? estimateFromProps;
  const delta = Math.abs(estimateFromProps - estimateFromJob);

  if (delta > toleranceSeconds) {
    const reason = `Duration mismatch too large (${delta.toFixed(2)}s > ${toleranceSeconds}s)`;
    await writeAgentLog({
      jobId: job.$id,
      agent: "Director",
      level: "warn",
      message: reason,
      metadata: { estimateFromProps, estimateFromJob, delta },
      timestampIso: new Date().toISOString()
    });
    return { approved: false, reason };
  }

  await writeAgentLog({
    jobId: job.$id,
    agent: "Director",
    level: "info",
    message: "Director duration validation passed",
    metadata: { estimateFromProps, estimateFromJob, delta },
    timestampIso: new Date().toISOString()
  });

  if (job.manualApprovalRequired) {
    await writeAgentLog({
      jobId: job.$id,
      agent: "Director",
      level: "info",
      message: "Manual approval required; pausing before export",
      timestampIso: new Date().toISOString()
    });
    return { approved: false, reason: "Manual approval required" };
  }

  return { approved: true };
}
