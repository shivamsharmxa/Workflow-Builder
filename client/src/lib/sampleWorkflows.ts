/**
 * Pre-built Sample Workflows
 * Assignment Requirement: Deployed app must have pre-built sample workflow showing all features
 */

import { Node, Edge } from "reactflow";

export const sampleWorkflow1: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    {
      id: "text-1",
      type: "text",
      position: { x: 100, y: 100 },
      data: {
        label: "Text Input",
        text: "Create a cinematic video of a futuristic city at night with neon lights",
      },
    },
    {
      id: "llm-1",
      type: "llm",
      position: { x: 450, y: 100 },
      data: {
        label: "Enhance Prompt",
        model: "gemini-1.5-flash",
        systemPrompt: "You are a video generation prompt expert. Enhance the user's prompt to be more detailed and cinematic.",
        userMessage: "",
      },
    },
    {
      id: "upload-image-1",
      type: "uploadImage",
      position: { x: 100, y: 300 },
      data: {
        label: "Reference Image",
      },
    },
    {
      id: "crop-1",
      type: "cropImage",
      position: { x: 450, y: 300 },
      data: {
        label: "Crop to 16:9",
        x: 0,
        y: 10,
        width: 100,
        height: 56,
      },
    },
    {
      id: "upload-video-1",
      type: "uploadVideo",
      position: { x: 100, y: 500 },
      data: {
        label: "Source Video",
      },
    },
    {
      id: "extract-1",
      type: "extractFrame",
      position: { x: 450, y: 500 },
      data: {
        label: "Extract Frame",
        timestamp: 50,
        isPercentage: true,
      },
    },
  ],
  edges: [
    {
      id: "e-text-llm",
      source: "text-1",
      target: "llm-1",
      animated: true,
      style: { stroke: "#C084FC", strokeWidth: 2 },
    },
    {
      id: "e-image-crop",
      source: "upload-image-1",
      target: "crop-1",
      animated: true,
      style: { stroke: "#C084FC", strokeWidth: 2 },
    },
    {
      id: "e-video-extract",
      source: "upload-video-1",
      target: "extract-1",
      animated: true,
      style: { stroke: "#C084FC", strokeWidth: 2 },
    },
  ],
};

// Comprehensive sample showing all 6 node types
export const comprehensiveSample: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    // Text node
    {
      id: "node-1",
      type: "text",
      position: { x: 50, y: 150 },
      data: {
        label: "Video Prompt",
        text: "A cyberpunk city at night with neon rain and flying cars",
      },
    },
    // Upload Image
    {
      id: "node-2",
      type: "uploadImage",
      position: { x: 50, y: 350 },
      data: {
        label: "Style Reference",
      },
    },
    // LLM Node
    {
      id: "node-3",
      type: "llm",
      position: { x: 400, y: 200 },
      data: {
        label: "Gemini Pro",
        model: "gemini-1.5-pro",
        systemPrompt: "Enhance this prompt for video generation",
      },
    },
    // Crop Image
    {
      id: "node-4",
      type: "cropImage",
      position: { x: 400, y: 400 },
      data: {
        label: "Crop 16:9",
        x: 0,
        y: 12,
        width: 100,
        height: 56,
      },
    },
    // Upload Video
    {
      id: "node-5",
      type: "uploadVideo",
      position: { x: 750, y: 150 },
      data: {
        label: "Source Video",
      },
    },
    // Extract Frame
    {
      id: "node-6",
      type: "extractFrame",
      position: { x: 750, y: 400 },
      data: {
        label: "Extract @ 50%",
        timestamp: 50,
        isPercentage: true,
      },
    },
  ],
  edges: [
    { id: "e1", source: "node-1", target: "node-3", animated: true },
    { id: "e2", source: "node-2", target: "node-4", animated: true },
    { id: "e3", source: "node-5", target: "node-6", animated: true },
  ],
};
