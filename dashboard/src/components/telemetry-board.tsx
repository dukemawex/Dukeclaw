"use client";

import { useEffect, useMemo, useState } from "react";
import { Databases, Models, Query } from "appwrite";
import { appwriteClient, appwriteConfig } from "@/lib/appwrite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type JobDoc = Models.Document & {
  status?: string;
  notes?: string;
  manualApprovalRequired?: boolean;
};

type LogDoc = Models.Document & {
  agent?: string;
  level?: string;
  message?: string;
  timestampIso?: string;
  jobId?: string;
};

export function TelemetryBoard(): React.ReactElement {
  const [jobs, setJobs] = useState<JobDoc[]>([]);
  const [logs, setLogs] = useState<LogDoc[]>([]);
  const [error, setError] = useState<string | null>(null);

  const databases = useMemo(() => new Databases(appwriteClient), []);

  useEffect(() => {
    const { databaseId, jobsCollectionId, logsCollectionId } = appwriteConfig;
    if (!databaseId || !jobsCollectionId || !logsCollectionId) {
      setError("Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID / collection IDs");
      return;
    }

    const load = async (): Promise<void> => {
      try {
        const [jobsResult, logsResult] = await Promise.all([
          databases.listDocuments(databaseId, jobsCollectionId, [Query.limit(20), Query.orderDesc("$updatedAt")]),
          databases.listDocuments(databaseId, logsCollectionId, [Query.limit(50), Query.orderDesc("$createdAt")])
        ]);
        setJobs(jobsResult.documents as JobDoc[]);
        setLogs(logsResult.documents as LogDoc[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    };

    void load();

    const unsubscribe = appwriteClient.subscribe(
      [
        `databases.${databaseId}.collections.${jobsCollectionId}.documents`,
        `databases.${databaseId}.collections.${logsCollectionId}.documents`
      ],
      () => {
        void load();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [databases]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Job Status</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.$id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{job.$id}</p>
                  <Badge status={job.status}>{job.status ?? "Unknown"}</Badge>
                </div>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">manualApprovalRequired: {String(Boolean(job.manualApprovalRequired))}</p>
                {job.notes ? <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">notes: {job.notes}</p> : null}
              </li>
            ))}
            {!jobs.length ? <li className="text-sm text-zinc-500">No jobs yet.</li> : null}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {logs.map((log) => (
              <li key={log.$id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide">{log.agent ?? "Agent"}</p>
                  <Badge>{log.level ?? "info"}</Badge>
                </div>
                <p className="mt-1 text-sm">{log.message}</p>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">job: {log.jobId ?? "n/a"} • {log.timestampIso ?? log.$createdAt}</p>
              </li>
            ))}
            {!logs.length ? <li className="text-sm text-zinc-500">No logs yet.</li> : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
