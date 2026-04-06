import { videoScriptSchema } from "../shared/schemas.js";
import { writeAgentLog } from "../skills/skill-appwrite.js";
import { buildRemotionProps } from "../skills/skill-remotion.js";
export async function runProducer(job) {
    await writeAgentLog({
        jobId: job.$id,
        agent: "Producer",
        level: "info",
        message: "Starting script-to-remotion asset pipeline",
        timestampIso: new Date().toISOString()
    });
    if (!job.scriptJson) {
        throw new Error("Job does not include scriptJson payload.");
    }
    const raw = JSON.parse(job.scriptJson);
    const script = videoScriptSchema.parse(raw);
    const remotionProps = buildRemotionProps(script);
    await writeAgentLog({
        jobId: job.$id,
        agent: "Producer",
        level: "info",
        message: "Remotion props generated",
        metadata: {
            scenes: remotionProps.scenes.length,
            estimatedDurationSec: remotionProps.estimatedDurationSec
        },
        timestampIso: new Date().toISOString()
    });
    return {
        remotionPropsJson: JSON.stringify(remotionProps),
        estimatedDurationSec: remotionProps.estimatedDurationSec
    };
}
