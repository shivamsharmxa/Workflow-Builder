import type { Node, Edge } from 'reactflow';

// Pre-built sample workflow demonstrating ALL 6 node types and features
// This workflow shows a complete AI content generation pipeline
export const sampleWorkflow: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    // Row 1: Text input → LLM processing
    {
      id: 'text-1',
      type: 'textNode',
      position: { x: 50, y: 100 },
      data: {
        label: 'Scene Description',
        text: 'A cyberpunk city at night with neon lights and flying cars',
        status: 'idle',
      },
    },
    {
      id: 'llm-1',
      type: 'llmNode',
      position: { x: 400, y: 80 },
      data: {
        label: 'Enhance Description',
        model: 'gemini-1.5-flash',
        systemPrompt: 'You are an expert at creating vivid, detailed visual descriptions for AI image generation.',
        userMessage: 'Enhance this scene description with more visual details: {input}',
        status: 'idle',
      },
    },
    
    // Row 2: Image upload → Crop
    {
      id: 'image-1',
      type: 'uploadImageNode',
      position: { x: 50, y: 300 },
      data: {
        label: 'Reference Photo',
        status: 'idle',
      },
    },
    {
      id: 'crop-1',
      type: 'cropImageNode',
      position: { x: 400, y: 300 },
      data: {
        label: 'Crop to Focus Area',
        x: 25,
        y: 25,
        width: 50,
        height: 50,
        status: 'idle',
      },
    },
    
    // Row 3: Video upload → Extract frame → Process with LLM
    {
      id: 'video-1',
      type: 'uploadVideoNode',
      position: { x: 50, y: 500 },
      data: {
        label: 'Sample Footage',
        status: 'idle',
      },
    },
    {
      id: 'extract-1',
      type: 'extractFrameNode',
      position: { x: 400, y: 500 },
      data: {
        label: 'Key Frame at 50%',
        timestamp: 50,
        isPercentage: true,
        status: 'idle',
      },
    },
    {
      id: 'llm-2',
      type: 'llmNode',
      position: { x: 750, y: 400 },
      data: {
        label: 'Analyze Images',
        model: 'gemini-1.5-flash',
        systemPrompt: 'Analyze the provided images and describe what you see in detail.',
        userMessage: 'Describe these images and their visual elements',
        status: 'idle',
      },
    },
  ],
  edges: [
    // Text → LLM
    {
      id: 'e-text-llm',
      source: 'text-1',
      target: 'llm-1',
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#A855F7', strokeWidth: 2 },
    },
    
    // Image pipeline
    {
      id: 'e-image-crop',
      source: 'image-1',
      target: 'crop-1',
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#A855F7', strokeWidth: 2 },
    },
    {
      id: 'e-crop-llm',
      source: 'crop-1',
      target: 'llm-2',
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#A855F7', strokeWidth: 2 },
    },
    
    // Video pipeline
    {
      id: 'e-video-extract',
      source: 'video-1',
      target: 'extract-1',
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#A855F7', strokeWidth: 2 },
    },
    {
      id: 'e-extract-llm',
      source: 'extract-1',
      target: 'llm-2',
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#A855F7', strokeWidth: 2 },
    },
  ],
};

// Function to initialize sample workflow if store is empty
export function shouldLoadSample(nodes: Node[]): boolean {
  return nodes.length === 0;
}
