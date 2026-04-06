import { Query } from 'node-appwrite';
import { databases } from '../shared/appwrite-server.js';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const VIDEO_JOBS_COLLECTION_ID = process.env.APPWRITE_VIDEO_JOBS_TABLE_ID ?? 'video_jobs';
const INTERVAL_MS = 60_000;
let running = false;

if (!DATABASE_ID) {
  throw new Error('Missing APPWRITE_DATABASE_ID environment variable.');
}

console.log('🚀 DukeClaw worker online. Starting autonomous heartbeat.');
console.log('🧠 Skills loaded: Appwrite + OpenRouter + Remotion.');

async function checkJobs() {
  if (running) {
    console.log('⏳ Previous heartbeat cycle still running; skipping this tick.');
    return;
  }

  running = true;
  console.log('💓 Heartbeat tick: scanning for pending jobs...');

  try {
    const response = await databases.listDocuments(DATABASE_ID, VIDEO_JOBS_COLLECTION_ID, [
      Query.equal('status', 'pending'),
      Query.limit(1)
    ]);

    if (response.documents.length === 0) {
      console.log('🛌 No pending jobs found.');
      return;
    }

    const job = response.documents[0];
    console.log(`📥 Pending job found: ${job.$id} (${job.topic ?? 'untitled'})`);

    await databases.updateDocument(DATABASE_ID, VIDEO_JOBS_COLLECTION_ID, job.$id, {
      status: 'researching'
    });
    console.log(`🔄 Job ${job.$id} status updated to researching.`);

  } catch (error) {
    console.error('❌ Heartbeat cycle failed:', error);
  } finally {
    running = false;
  }
}

void checkJobs();
setInterval(() => {
  void checkJobs();
}, INTERVAL_MS);
