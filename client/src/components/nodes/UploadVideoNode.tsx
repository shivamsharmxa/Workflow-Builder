import { memo, useState, useEffect, useRef } from "react";
import { NodeProps } from "reactflow";
import { NodeWrapper } from "./NodeWrapper";
import { Upload, Video } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { createVideoUploader } from "@/lib/transloadit";

export interface UploadVideoNodeData {
  label: string;
  videoUrl?: string;
  status?: "idle" | "running" | "success" | "error";
}

export const UploadVideoNode = memo(({ id, data, selected }: NodeProps<UploadVideoNodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [uploading, setUploading] = useState(false);
  const uppyRef = useRef<any>(null);

  useEffect(() => {
    const hasTransloaditKey = import.meta.env.VITE_TRANSLOADIT_KEY && 
                              import.meta.env.VITE_TRANSLOADIT_KEY !== 'your_transloadit_key_here';
    
    if (!hasTransloaditKey) return;

    const uppy = createVideoUploader();
    uppyRef.current = uppy;

    uppy.on('complete', (result) => {
      if (result.successful && result.successful.length > 0) {
        const assembly = result.transloadit?.[0];
        const uploads = assembly?.results;
        const fileUrl = uploads?.store?.[0]?.ssl_url || uploads?.encode?.[0]?.ssl_url;
        
        if (fileUrl) {
          updateNodeData(id, { videoUrl: fileUrl, status: 'success' });
        }
      }
      setUploading(false);
    });

    uppy.on('upload', () => setUploading(true));
    uppy.on('error', () => {
      updateNodeData(id, { status: 'error' });
      setUploading(false);
    });

    return () => uppy.close();
  }, [id, updateNodeData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload: mp4, mov, webm, or m4v');
      return;
    }

    setUploading(true);

    try {
      // Use base64 encoding for immediate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        updateNodeData(id, { 
          videoUrl: reader.result as string, 
          status: 'success' 
        });
        setUploading(false);
      };
      reader.onerror = () => {
        updateNodeData(id, { status: 'error' });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      updateNodeData(id, { status: 'error' });
      setUploading(false);
    }
  };

  return (
    <NodeWrapper
      label={data.label}
      selected={selected}
    >
      <div className="space-y-3">
        <label htmlFor={`upload-video-${id}`} className="cursor-pointer">
          <div className="border-2 border-dashed border-[#333] rounded-lg p-4 hover:border-[#C084FC] transition-colors text-center">
            {data.videoUrl ? (
              <video
                src={data.videoUrl}
                controls
                className="w-full h-32 object-cover rounded"
              />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-400">Click to upload video</p>
                <p className="text-xs text-gray-600 mt-1">MP4, MOV, WEBM, M4V</p>
              </>
            )}
          </div>
          <input
            id={`upload-video-${id}`}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {uploading && (
          <div className="text-xs text-center text-[#C084FC]">Uploading...</div>
        )}

        {data.videoUrl && (
          <div className="flex items-center gap-2 text-xs text-green-500">
            <Video className="w-3 h-3" />
            <span>Video ready</span>
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

UploadVideoNode.displayName = "UploadVideoNode";
