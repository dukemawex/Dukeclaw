import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { renderMedia } from '@remotion/renderer';

export async function renderVideo(jobId, videoProps = {}) {
  if (!jobId) {
    throw new Error('renderVideo requires a jobId.');
  }

  const outDir = join(process.cwd(), 'out');
  await mkdir(outDir, { recursive: true });
  const outputLocation = join(outDir, `${jobId}.mp4`);

  await renderMedia({
    serveUrl: process.env.REMOTION_SERVE_URL ?? process.cwd(),
    composition: process.env.REMOTION_COMPOSITION_ID ?? 'DukeClawMain',
    codec: 'h264',
    outputLocation,
    inputProps: videoProps
  });

  return outputLocation;
}
