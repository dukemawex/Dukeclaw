import { z } from "zod";

export const scriptSegmentSchema = z.object({
  sceneId: z.string().min(1),
  narration: z.string().min(1),
  visualCue: z.string().optional(),
  durationSec: z.number().positive().optional()
});

export const videoScriptSchema = z.object({
  title: z.string().min(1),
  language: z.string().optional(),
  segments: z.array(scriptSegmentSchema).min(1)
});

export const remotionCompositionPropsSchema = z.object({
  title: z.string().min(1),
  scenes: z.array(
    z.object({
      id: z.string().min(1),
      narration: z.string().min(1),
      visualCue: z.string().min(1),
      durationSec: z.number().positive()
    })
  ).min(1),
  estimatedDurationSec: z.number().positive()
});

export const videoJobSchema = z.object({
  $id: z.string().min(1),
  status: z.enum(["Pending", "InProgress", "AwaitingApproval", "ReadyToRender", "Completed", "Failed"]),
  manualApprovalRequired: z.boolean().optional(),
  scriptJson: z.string().optional(),
  remotionPropsJson: z.string().optional(),
  estimatedDurationSec: z.number().optional(),
  notes: z.string().optional()
});
