import { remotionCompositionPropsSchema, videoScriptSchema } from "../shared/schemas.js";
const defaultWordsPerSecond = Number.parseFloat(process.env.AVERAGE_VOICEOVER_WPS ?? "2.7");
function estimateDurationSec(narration) {
    const words = narration.trim().split(/\s+/).filter(Boolean).length;
    const duration = words / defaultWordsPerSecond;
    return Number(duration.toFixed(2));
}
export function buildRemotionProps(script) {
    const parsed = videoScriptSchema.parse(script);
    const scenes = parsed.segments.map((segment) => {
        const estimated = segment.durationSec ?? estimateDurationSec(segment.narration);
        return {
            id: segment.sceneId,
            narration: segment.narration,
            visualCue: segment.visualCue ?? "Default visual montage",
            durationSec: estimated
        };
    });
    const total = Number(scenes.reduce((acc, scene) => acc + scene.durationSec, 0).toFixed(2));
    return remotionCompositionPropsSchema.parse({
        title: parsed.title,
        scenes,
        estimatedDurationSec: total
    });
}
