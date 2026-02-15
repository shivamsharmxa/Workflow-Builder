/**
 * Trigger.dev v4 Task: Crop Image with FFmpeg
 * Assignment Requirement: Crop Image node must execute via FFmpeg on Trigger.dev
 */

import { task } from "@trigger.dev/sdk/v3";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const execAsync = promisify(exec);

export const cropImageTask = task({
  id: "crop-image",
  run: async (payload: {
    imageUrl: string;
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    width: number; // percentage (0-100)
    height: number; // percentage (0-100)
  }) => {
    console.log("[Trigger.dev] Starting image crop", payload);

    const { imageUrl, x, y, width, height } = payload;

    try {
      // Create temp directory
      const tempDir = path.join("/tmp", crypto.randomUUID());
      await fs.mkdir(tempDir, { recursive: true });

      const inputPath = path.join(tempDir, "input.jpg");
      const outputPath = path.join(tempDir, "output.jpg");

      // Download image
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      await fs.writeFile(inputPath, Buffer.from(buffer));

      // Get image dimensions
      const { stdout: dimensions } = await execAsync(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${inputPath}"`
      );
      const [imgWidth, imgHeight] = dimensions.trim().split(",").map(Number);

      // Calculate crop dimensions
      const cropX = Math.floor((x / 100) * imgWidth);
      const cropY = Math.floor((y / 100) * imgHeight);
      const cropW = Math.floor((width / 100) * imgWidth);
      const cropH = Math.floor((height / 100) * imgHeight);

      // Execute FFmpeg crop
      await execAsync(
        `ffmpeg -i "${inputPath}" -vf "crop=${cropW}:${cropH}:${cropX}:${cropY}" "${outputPath}"`
      );

      // Read output file
      const croppedBuffer = await fs.readFile(outputPath);
      const base64 = croppedBuffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });

      console.log("[Trigger.dev] Image crop completed");

      return {
        success: true,
        result: dataUrl,
        dimensions: { width: cropW, height: cropH },
      };
    } catch (error: any) {
      console.error("[Trigger.dev] Image crop failed", error);
      
      return {
        success: false,
        error: error.message || "Image crop failed",
      };
    }
  },
});
