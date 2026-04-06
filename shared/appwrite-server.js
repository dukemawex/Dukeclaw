import { Client, Databases } from 'node-appwrite';
import 'dotenv/config';

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  throw new Error('Missing required Appwrite server environment variables.');
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

export const databases = new Databases(client);
