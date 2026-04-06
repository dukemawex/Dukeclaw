import { Query } from 'node-appwrite';
import { config as loadEnv } from 'dotenv';
import { databases } from '../shared/appwrite-server.js';
import { askQwen } from '../skills/openrouter-gateway.js';
import { renderVideo } from '../skills/skill-remotion.js';

loadEnv();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? '69d39296000d3bf0e6ae';
const VIDEO_JOBS_TABLE_ID = process.env.APPWRITE_VIDEO_JOBS_TABLE_ID ?? 'video_jobs';
const INTERVAL_MS = 60_000;
let running = false;

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
    const response = await databases.listDocuments(DATABASE_ID, VIDEO_JOBS_TABLE_ID, [
      Query.equal('status', 'pending'),
      Query.limit(1)
    ]);

    if (response.documents.length === 0) {
      console.log('🛌 No pending jobs found.');
      return;
    }

    const job = response.documents[0];
    console.log(`📥 Pending job found: ${job.$id} (${job.topic ?? 'untitled'})`);

    await databases.updateDocument(DATABASE_ID, VIDEO_JOBS_TABLE_ID, job.$id, {
      status: 'researching'
    });
    console.log(`🔄 Job ${job.$id} status updated to researching.`);

    void askQwen;
    void renderVideo;
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
