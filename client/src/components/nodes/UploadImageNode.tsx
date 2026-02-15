import { memo, useState, useEffect, useRef } from "react";
import { NodeProps } from "reactflow";
import { NodeWrapper } from "./NodeWrapper";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { createImageUploader } from "@/lib/transloadit";

export interface UploadImageNodeData {
  label: string;
  imageUrl?: string;
  status?: "idle" | "running" | "success" | "error";
}

export const UploadImageNode = memo(({ id, data, selected }: NodeProps<UploadImageNodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [uploading, setUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const uppyRef = useRef<any>(null);

  useEffect(() => {
    // Check if Transloadit is configured
    const hasTransloaditKey = import.meta.env.VITE_TRANSLOADIT_KEY && 
                              import.meta.env.VITE_TRANSLOADIT_KEY !== 'your_transloadit_key_here';
    
    if (!hasTransloaditKey) {
      console.warn('Transloadit not configured, falling back to base64');
      return;
    }

    // Initialize Uppy with Transloadit
    const uppy = createImageUploader();
    uppyRef.current = uppy;

    uppy.on('complete', (result) => {
      if (result.successful && result.successful.length > 0) {
        // Get the uploaded file URL from Transloadit result
        const assembly = result.transloadit?.[0];
        const uploads = assembly?.results;
        
        // Get the final stored file URL
        const fileUrl = uploads?.store?.[0]?.ssl_url || uploads?.optimize?.[0]?.ssl_url;
        
        if (fileUrl) {
          updateNodeData(id, { imageUrl: fileUrl, status: 'success' });
          setShowUploader(false);
        }
      }
      setUploading(false);
    });

    uppy.on('upload', () => {
      setUploading(true);
    });

    uppy.on('error', (error) => {
      console.error('Transloadit upload error:', error);
      updateNodeData(id, { status: 'error' });
      setUploading(false);
    });

    return () => {
      uppy.close();
    };
  }, [id, updateNodeData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload: jpg, jpeg, png, webp, or gif');
      return;
    }

    setUploading(true);
    updateNodeData(id, { status: 'running' });

    try {
      // Use base64 encoding for immediate preview (works without external services)
      const reader = new FileReader();
      reader.onloadend = () => {
        updateNodeData(id, { 
          imageUrl: reader.result as string, 
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
        <label htmlFor={`upload-${id}`} className="cursor-pointer">
          <div className="border-2 border-dashed border-[#333] rounded-lg p-4 hover:border-[#C084FC] transition-colors text-center">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt="Uploaded"
                className="w-full h-32 object-cover rounded"
              />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-400">Click to upload image</p>
                <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP, GIF</p>
              </>
            )}
          </div>
          <input
            id={`upload-${id}`}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {uploading && (
          <div className="text-xs text-center text-[#C084FC]">Uploading...</div>
        )}

        {data.imageUrl && (
          <div className="flex items-center gap-2 text-xs text-green-500">
            <ImageIcon className="w-3 h-3" />
            <span>Image ready</span>
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

UploadImageNode.displayName = "UploadImageNode";
