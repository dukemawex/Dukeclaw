export class ResearchAgent {
  async run(job) {
    console.log(`🔎 ResearchAgent: processing topic \"${job.topic ?? "unknown"}\"`);
    return {
      summary: `Research initialized for ${job.topic ?? "untitled topic"}`,
      sources: []
    };
  }
}
