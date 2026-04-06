import test from "node:test";
import assert from "node:assert/strict";

process.env.APPWRITE_ENDPOINT = "https://example.appwrite.test/v1";
process.env.APPWRITE_PROJECT_ID = "test-project";
process.env.APPWRITE_API_KEY = "test-api-key";
process.env.APPWRITE_DATABASE_ID = "test-db";
process.env.APPWRITE_JOBS_COLLECTION_ID = "jobs";
process.env.APPWRITE_LOGS_COLLECTION_ID = "logs";
process.env.DISABLE_APPWRITE_LOG_WRITE = "1";

const { validateForExport } = await import("../agents/director.js");

test("director pauses when manual approval is required", async () => {
  const result = await validateForExport({
    $id: "job-1",
    status: "InProgress",
    manualApprovalRequired: true,
    remotionPropsJson: JSON.stringify({
      title: "Sample",
      scenes: [
        {
          id: "scene-1",
          narration: "Hello world",
          visualCue: "Cue",
          durationSec: 5
        }
      ],
      estimatedDurationSec: 5
    }),
    estimatedDurationSec: 5
  });

  assert.equal(result.approved, false);
  assert.equal(result.reason, "Manual approval required");
});
