/**
 * Trigger.dev v4 Task: Extract Frame from Video with FFmpeg
 * Assignment Requirement: Extract Frame node must execute via FFmpeg on Trigger.dev
 */

import { task } from "@trigger.dev/sdk/v3";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const execAsync = promisify(exec);

export const extractFrameTask = task({
  id: "extract-frame",
  run: async (payload: {
    videoUrl: string;
    timestamp: number; // seconds or percentage
    isPercentage?: boolean;
  }) => {
    console.log("[Trigger.dev] Starting frame extraction", payload);

    const { videoUrl, timestamp, isPercentage = false } = payload;

    try {
      // Create temp directory
      const tempDir = path.join("/tmp", crypto.randomUUID());
      await fs.mkdir(tempDir, { recursive: true });

      const inputPath = path.join(tempDir, "input.mp4");
      const outputPath = path.join(tempDir, "frame.jpg");

      // Download video
      const response = await fetch(videoUrl);
      const buffer = await response.arrayBuffer();
      await fs.writeFile(inputPath, Buffer.from(buffer));

      let extractTime = timestamp;

      // If percentage, calculate actual timestamp
      if (isPercentage) {
        const { stdout: duration } = await execAsync(
          `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
        );
        const totalDuration = parseFloat(duration.trim());
        extractTime = (timestamp / 100) * totalDuration;
      }

      // Extract frame using FFmpeg
      await execAsync(
        `ffmpeg -ss ${extractTime} -i "${inputPath}" -vframes 1 -q:v 2 "${outputPath}"`
      );

      // Read output file
      const frameBuffer = await fs.readFile(outputPath);
      const base64 = frameBuffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });

      console.log("[Trigger.dev] Frame extraction completed");

      return {
        success: true,
        result: dataUrl,
        timestamp: extractTime,
      };
    } catch (error: any) {
      console.error("[Trigger.dev] Frame extraction failed", error);
      
      return {
        success: false,
        error: error.message || "Frame extraction failed",
      };
    }
  },
});
