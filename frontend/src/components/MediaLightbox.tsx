import React, { useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Info,
  ZoomIn,
} from 'lucide-react';
import { ExternalBlob } from '../backend';
import type { FileMetadata } from '../backend';
import { formatBytes, formatTimestamp } from '../utils/fileHelpers';
import { toast } from 'sonner';

interface MediaLightboxProps {
  files: FileMetadata[];
  initialIndex: number;
  onClose: () => void;
}

export function MediaLightbox({ files, initialIndex, onClose }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const currentFile = files[currentIndex];
  const isImage = currentFile?.mimeType.startsWith('image/');
  const isVideo = currentFile?.mimeType.startsWith('video/');

  const getMediaUrl = (file: FileMetadata) => {
    try {
      const blob = ExternalBlob.fromURL(file.id);
      return blob.getDirectURL();
    } catch {
      return null;
    }
  };

  const mediaUrl = currentFile ? getMediaUrl(currentFile) : null;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, files.length - 1));
  }, [files.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev]);

  const handleDownload = async () => {
    if (!currentFile || !mediaUrl) return;
    setIsDownloading(true);
    try {
      const blob = ExternalBlob.fromURL(currentFile.id);
      const bytes = await blob.getBytes();
      const blobObj = new Blob([bytes], { type: currentFile.mimeType });
      const url = URL.createObjectURL(blobObj);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFile.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!currentFile) return;
    const url = getMediaUrl(currentFile) || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (!currentFile) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10 rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>

        <span className="text-white/70 text-sm">
          {currentIndex + 1} / {files.length}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading}
            className="text-white hover:bg-white/10 rounded-full"
          >
            {isDownloading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInfo((v) => !v)}
            className={`text-white hover:bg-white/10 rounded-full ${showInfo ? 'bg-white/10' : ''}`}
          >
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Media area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-12">
        {/* Prev button */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            className="absolute left-2 text-white hover:bg-white/10 rounded-full w-10 h-10 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {/* Media */}
        <div className="max-w-full max-h-full flex items-center justify-center">
          {isImage && mediaUrl ? (
            <img
              src={mediaUrl}
              alt={currentFile.name}
              className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-lightbox"
            />
          ) : isVideo && mediaUrl ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-[calc(100vh-200px)] rounded-lg shadow-lightbox"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-white/70">
              <ZoomIn className="w-16 h-16" />
              <p className="text-lg">{currentFile.name}</p>
              <p className="text-sm">{formatBytes(currentFile.size)}</p>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="mt-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>

        {/* Next button */}
        {currentIndex < files.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            className="absolute right-2 text-white hover:bg-white/10 rounded-full w-10 h-10 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="flex-shrink-0 bg-black/80 border-t border-white/10 px-6 py-4 animate-slide-up">
          <div className="max-w-lg mx-auto space-y-2">
            <h3 className="text-white font-medium truncate">{currentFile.name}</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div className="text-white/50">Size</div>
              <div className="text-white/80">{formatBytes(currentFile.size)}</div>
              <div className="text-white/50">Type</div>
              <div className="text-white/80">{currentFile.mimeType}</div>
              <div className="text-white/50">Uploaded</div>
              <div className="text-white/80">{formatTimestamp(currentFile.uploadedAt)}</div>
              <div className="text-white/50">ID</div>
              <div className="text-white/80 font-mono text-xs truncate">{currentFile.id}</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom filename */}
      {!showInfo && (
        <div className="flex-shrink-0 px-4 py-3 text-center">
          <p className="text-white/60 text-sm truncate">{currentFile.name}</p>
        </div>
      )}
    </div>
  );
}
