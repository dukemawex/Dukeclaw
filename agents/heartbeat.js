import { Client, Databases, Query } from 'node-appwrite';
import { ResearchAgent } from './researcher.js';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? 'dukeclaw_db';
const VIDEO_JOBS_COLLECTION_ID = process.env.APPWRITE_VIDEO_JOBS_COLLECTION_ID ?? 'video_jobs';

async function startOrchestrator(job) {
  const researcher = new ResearchAgent();
  await researcher.run(job);
}

async function checkJobs() {
  console.log('💓 DukeClaw Heartbeat: Checking for pending video tasks...');

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      VIDEO_JOBS_COLLECTION_ID,
      [Query.equal('status', 'pending')]
    );

    if (response.documents.length > 0) {
      const job = response.documents[0];
      console.log(`🚀 Starting Job: ${job.topic}`);
      await startOrchestrator(job);
    }
  } catch (error) {
    console.error('❌ Heartbeat failed:', error);
  }
}

void checkJobs();
setInterval(checkJobs, 60000);
