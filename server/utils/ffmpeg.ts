/**
 * FFmpeg utility functions.
 * Used by both the Express routes (direct execution) and Trigger.dev tasks.
 * Requires ffmpeg and ffprobe to be installed and available in PATH.
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const execAsync = promisify(exec);

export interface CropImagePayload {
  imageUrl: string;
  x: number;      // percentage 0–100
  y: number;      // percentage 0–100
  width: number;  // percentage 0–100
  height: number; // percentage 0–100
}

export interface CropImageResult {
  success: true;
  result: string; // data URL
  dimensions: { width: number; height: number };
}

export interface ExtractFramePayload {
  videoUrl: string;
  timestamp: number;       // seconds, or percentage when isPercentage=true
  isPercentage?: boolean;
}

export interface ExtractFrameResult {
  success: true;
  result: string; // data URL
  timestamp: number;
}

/**
 * Crops an image using FFmpeg. Input coordinates are percentages (0–100).
 * Downloads the image to a temp directory, crops, returns a base64 data URL.
 */
export async function cropImageWithFFmpeg(
  payload: CropImagePayload
): Promise<CropImageResult> {
  const { imageUrl, x, y, width, height } = payload;

  const tempDir = path.join("/tmp", crypto.randomUUID());
  await fs.mkdir(tempDir, { recursive: true });

  try {
    const inputPath = path.join(tempDir, "input.jpg");
    const outputPath = path.join(tempDir, "output.jpg");

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: HTTP ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    await fs.writeFile(inputPath, Buffer.from(buffer));

    // Get image dimensions with ffprobe
    const { stdout: dimensions } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${inputPath}"`
    );
    const [imgWidth, imgHeight] = dimensions.trim().split(",").map(Number);

    if (!imgWidth || !imgHeight) {
      throw new Error("Could not determine image dimensions");
    }

    const cropX = Math.floor((x / 100) * imgWidth);
    const cropY = Math.floor((y / 100) * imgHeight);
    const cropW = Math.max(1, Math.floor((width / 100) * imgWidth));
    const cropH = Math.max(1, Math.floor((height / 100) * imgHeight));

    await execAsync(
      `ffmpeg -i "${inputPath}" -vf "crop=${cropW}:${cropH}:${cropX}:${cropY}" -y "${outputPath}"`
    );

    const croppedBuffer = await fs.readFile(outputPath);
    const base64 = croppedBuffer.toString("base64");

    return {
      success: true,
      result: `data:image/jpeg;base64,${base64}`,
      dimensions: { width: cropW, height: cropH },
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

/**
 * Extracts a single frame from a video at the given timestamp using FFmpeg.
 * Returns the frame as a base64 JPEG data URL.
 */
export async function extractFrameWithFFmpeg(
  payload: ExtractFramePayload
): Promise<ExtractFrameResult> {
  const { videoUrl, timestamp, isPercentage = false } = payload;

  const tempDir = path.join("/tmp", crypto.randomUUID());
  await fs.mkdir(tempDir, { recursive: true });

  try {
    const inputPath = path.join(tempDir, "input.mp4");
    const outputPath = path.join(tempDir, "frame.jpg");

    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: HTTP ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    await fs.writeFile(inputPath, Buffer.from(buffer));

    let extractTime = timestamp;

    if (isPercentage) {
      const { stdout: duration } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
      );
      const totalDuration = parseFloat(duration.trim());
      if (isNaN(totalDuration) || totalDuration <= 0) {
        throw new Error("Could not determine video duration");
      }
      extractTime = (timestamp / 100) * totalDuration;
    }

    await execAsync(
      `ffmpeg -ss ${extractTime} -i "${inputPath}" -vframes 1 -q:v 2 -y "${outputPath}"`
    );

    const frameBuffer = await fs.readFile(outputPath);
    const base64 = frameBuffer.toString("base64");

    return {
      success: true,
      result: `data:image/jpeg;base64,${base64}`,
      timestamp: extractTime,
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
