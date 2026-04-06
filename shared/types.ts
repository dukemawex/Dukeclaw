export type JobStatus = "Pending" | "InProgress" | "AwaitingApproval" | "ReadyToRender" | "Completed" | "Failed";

export type AgentName = "Researcher" | "Scriptwriter" | "Producer" | "Director";

export interface ScriptSegment {
  sceneId: string;
  narration: string;
  visualCue?: string;
  durationSec?: number;
}

export interface VideoScript {
  title: string;
  language?: string;
  segments: ScriptSegment[];
}

export interface RemotionCompositionProps {
  title: string;
  scenes: Array<{
    id: string;
    narration: string;
    visualCue: string;
    durationSec: number;
  }>;
  estimatedDurationSec: number;
}

export interface VideoJob {
  $id: string;
  status: JobStatus;
  manualApprovalRequired?: boolean;
  scriptJson?: string;
  remotionPropsJson?: string;
  estimatedDurationSec?: number;
  notes?: string;
}

export interface AgentLogEntry {
  jobId: string;
  agent: AgentName;
  level: "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, unknown>;
  timestampIso: string;
}
