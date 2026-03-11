/**
 * Trigger.dev v3 Task: Crop Image with FFmpeg
 * Thin wrapper around the shared cropImageWithFFmpeg utility.
 */

import { task } from "@trigger.dev/sdk/v3";
import { cropImageWithFFmpeg, type CropImagePayload } from "../utils/ffmpeg";

export const cropImageTask = task({
  id: "crop-image",
  run: async (payload: CropImagePayload) => {
    console.log("[Trigger.dev] Starting image crop", {
      imageUrl: payload.imageUrl,
      x: payload.x,
      y: payload.y,
      width: payload.width,
      height: payload.height,
    });

    try {
      const result = await cropImageWithFFmpeg(payload);
      console.log("[Trigger.dev] Image crop completed", result.dimensions);
      return result;
    } catch (error: any) {
      console.error("[Trigger.dev] Image crop failed", error);
      return { success: false as const, error: error.message ?? "Image crop failed" };
    }
  },
});
