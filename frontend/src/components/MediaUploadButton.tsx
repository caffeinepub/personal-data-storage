import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { useSaveFileReference } from '../hooks/useQueries';
import { toast } from 'sonner';

interface MediaUploadButtonProps {
  onUploadComplete?: () => void;
}

export function MediaUploadButton({ onUploadComplete }: MediaUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');

  const { mutateAsync: saveFileReference } = useSaveFileReference();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(file.name);

    try {
      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with progress tracking
      const externalBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      // Generate unique ID
      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;

      // Save to backend
      await saveFileReference({
        id,
        blob: externalBlob,
        name: file.name,
        size: BigInt(file.size),
        mimeType: file.type || 'application/octet-stream',
      });

      toast.success(`"${file.name}" uploaded successfully`);
      onUploadComplete?.();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadingFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,video/*,.heic,.heif"
        multiple={false}
      />

      {isUploading ? (
        <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 shadow-fab min-w-[200px] animate-slide-up">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate mb-1.5">
              {uploadingFileName}
            </p>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-primary mt-1">{uploadProgress}%</p>
          </div>
          <button
            onClick={() => {
              setIsUploading(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-14 h-14 rounded-full shadow-fab bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}
    </>
  );
}
