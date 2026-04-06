import { Client, Databases, ID, Query } from "node-appwrite";
import type { AgentLogEntry, JobStatus, VideoJob } from "../shared/types.js";
import { videoJobSchema } from "../shared/schemas.js";

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID;
const jobsCollectionId = process.env.APPWRITE_JOBS_COLLECTION_ID;
const logsCollectionId = process.env.APPWRITE_LOGS_COLLECTION_ID;

if (!endpoint || !projectId || !apiKey || !databaseId || !jobsCollectionId || !logsCollectionId) {
  throw new Error("Missing required Appwrite environment configuration.");
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

export async function getPendingJobs(limit = 10): Promise<VideoJob[]> {
  const response = await databases.listDocuments(databaseId, jobsCollectionId, [
    Query.equal("status", "Pending"),
    Query.limit(limit)
  ]);

  return response.documents
    .map((doc) => videoJobSchema.safeParse(doc))
    .filter((result) => result.success)
    .map((result) => result.data as VideoJob);
}

export async function updateJobStatus(jobId: string, status: JobStatus, patch: Partial<VideoJob> = {}): Promise<void> {
  await databases.updateDocument(databaseId, jobsCollectionId, jobId, {
    status,
    ...patch
  });
}

export async function writeAgentLog(entry: AgentLogEntry): Promise<void> {
  console.log(`[${entry.timestampIso}] [${entry.agent}] [${entry.level}] ${entry.message}`, entry.metadata ?? {});

  await databases.createDocument(databaseId, logsCollectionId, ID.unique(), {
    jobId: entry.jobId,
    agent: entry.agent,
    level: entry.level,
    message: entry.message,
    metadata: JSON.stringify(entry.metadata ?? {}),
    timestampIso: entry.timestampIso
  });
}
