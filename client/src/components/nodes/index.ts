// Export all node components
export { InputNode } from './InputNode';
export { OutputNode } from './OutputNode';
export { TextNode } from './TextNode';
export { UploadImageNode } from './UploadImageNode';
export { UploadVideoNode } from './UploadVideoNode';
export { LLMNode } from './LLMNode';
export { CropImageNode } from './CropImageNode';
export { ExtractFrameNode } from './ExtractFrameNode';

// Export node data types
export type { TextNodeData } from './TextNode';
export type { UploadImageNodeData } from './UploadImageNode';
export type { UploadVideoNodeData } from './UploadVideoNode';
export type { LLMNodeData } from './LLMNode';
export type { CropImageNodeData } from './CropImageNode';
export type { ExtractFrameNodeData } from './ExtractFrameNode';

// Node type registry for React Flow
import { TextNode } from './TextNode';
import { UploadImageNode } from './UploadImageNode';
import { UploadVideoNode } from './UploadVideoNode';
import { LLMNode } from './LLMNode';
import { CropImageNode } from './CropImageNode';
import { ExtractFrameNode } from './ExtractFrameNode';

export const nodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
};

// Node definitions for sidebar
export const nodeDefinitions = [
  {
    type: 'textNode',
    label: 'Text Node',
    icon: '📝',
    description: 'Output text data',
    defaultData: {
      label: 'Text',
      text: '',
      status: 'idle' as const,
    },
  },
  {
    type: 'uploadImageNode',
    label: 'Upload Image',
    icon: '🖼️',
    description: 'Upload an image file',
    defaultData: {
      label: 'Upload Image',
      status: 'idle' as const,
    },
  },
  {
    type: 'uploadVideoNode',
    label: 'Upload Video',
    icon: '🎥',
    description: 'Upload a video file',
    defaultData: {
      label: 'Upload Video',
      status: 'idle' as const,
    },
  },
  {
    type: 'llmNode',
    label: 'Run Any LLM',
    icon: '✨',
    description: 'Execute Google Gemini',
    defaultData: {
      label: 'Run LLM',
      model: 'gemini-1.5-flash',
      userMessage: '',
      status: 'idle' as const,
    },
  },
  {
    type: 'cropImageNode',
    label: 'Crop Image',
    icon: '✂️',
    description: 'Crop image with FFmpeg',
    defaultData: {
      label: 'Crop Image',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      status: 'idle' as const,
    },
  },
  {
    type: 'extractFrameNode',
    label: 'Extract Frame',
    icon: '🎞️',
    description: 'Extract frame from video',
    defaultData: {
      label: 'Extract Frame',
      timestamp: 0,
      isPercentage: false,
      status: 'idle' as const,
    },
  },
];
