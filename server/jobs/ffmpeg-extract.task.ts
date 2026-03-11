/**
 * Trigger.dev v3 Task: Extract Frame from Video with FFmpeg
 * Thin wrapper around the shared extractFrameWithFFmpeg utility.
 */

import { task } from "@trigger.dev/sdk/v3";
import { extractFrameWithFFmpeg, type ExtractFramePayload } from "../utils/ffmpeg";

export const extractFrameTask = task({
  id: "extract-frame",
  run: async (payload: ExtractFramePayload) => {
    console.log("[Trigger.dev] Starting frame extraction", {
      videoUrl: payload.videoUrl,
      timestamp: payload.timestamp,
      isPercentage: payload.isPercentage,
    });

    try {
      const result = await extractFrameWithFFmpeg(payload);
      console.log("[Trigger.dev] Frame extraction completed at", result.timestamp, "s");
      return result;
    } catch (error: any) {
      console.error("[Trigger.dev] Frame extraction failed", error);
      return { success: false as const, error: error.message ?? "Frame extraction failed" };
    }
  },
});
