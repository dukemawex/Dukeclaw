import { Client } from "appwrite";

export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  jobsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID,
  logsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_LOGS_COLLECTION_ID
};

let cachedClient: Client | null = null;

export function getAppwriteClient(): Client | null {
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);
  }

  return cachedClient;
}
