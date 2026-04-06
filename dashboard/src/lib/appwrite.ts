import { Client } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_ENDPOINT or NEXT_PUBLIC_APPWRITE_PROJECT_ID");
}

export const appwriteClient = new Client().setEndpoint(endpoint).setProject(projectId);

export const appwriteConfig = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  jobsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID,
  logsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_LOGS_COLLECTION_ID
};
