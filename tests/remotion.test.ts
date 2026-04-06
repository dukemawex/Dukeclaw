import test from "node:test";
import assert from "node:assert/strict";
import { buildRemotionProps } from "../skills/skill-remotion.js";

test("buildRemotionProps creates scenes and estimated duration", () => {
  const props = buildRemotionProps({
    title: "Duke Claw Episode",
    segments: [
      { sceneId: "1", narration: "Welcome to the channel", durationSec: 4 },
      { sceneId: "2", narration: "Let us explore autonomous systems", durationSec: 6 }
    ]
  });

  assert.equal(props.scenes.length, 2);
  assert.equal(props.estimatedDurationSec, 10);
});
