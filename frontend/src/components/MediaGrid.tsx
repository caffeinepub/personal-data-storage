import React, { useCallback, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Play, FileText } from 'lucide-react';
import { ExternalBlob } from '../backend';
import type { FileMetadata } from '../backend';
import { formatBytes, formatTimestamp } from '../utils/fileHelpers';

interface MediaGridProps {
  files: FileMetadata[];
  isLoading: boolean;
  selectedIds: Set<string>;
  isSelectMode: boolean;
  onThumbnailClick: (file: FileMetadata, index: number) => void;
  onLongPress: (id: string) => void;
  onToggleSelect: (id: string) => void;
  searchQuery: string;
}

function groupByDate(files: FileMetadata[]): { label: string; files: FileMetadata[] }[] {
  const groups: Map<string, FileMetadata[]> = new Map();

  for (const file of files) {
    const ms = Number(file.uploadedAt / BigInt(1_000_000));
    const date = new Date(ms);
    const now = new Date();

    let label: string;
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      label = 'Today';
    } else if (diffDays === 1) {
      label = 'Yesterday';
    } else if (diffDays < 7) {
      label = date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(file);
  }

  return Array.from(groups.entries()).map(([label, files]) => ({ label, files }));
}

function MediaThumbnail({
  file,
  index,
  isSelected,
  isSelectMode,
  onClick,
  onLongPress,
}: {
  file: FileMetadata;
  index: number;
  isSelected: boolean;
  isSelectMode: boolean;
  onClick: () => void;
  onLongPress: () => void;
}) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');

  // Get direct URL from ExternalBlob
  const getMediaUrl = () => {
    try {
      const blob = ExternalBlob.fromURL(file.id);
      return blob.getDirectURL();
    } catch {
      return null;
    }
  };

  const mediaUrl = getMediaUrl();

  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress();
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      className={`media-thumb rounded-lg overflow-hidden bg-secondary aspect-square ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Media content */}
      {isImage && mediaUrl ? (
        <img
          src={mediaUrl}
          alt={file.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : isVideo && mediaUrl ? (
        <div className="relative w-full h-full">
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
          <FileText className="w-8 h-8 text-muted-foreground" />
          <span className="text-xs text-muted-foreground text-center truncate w-full">
            {file.name}
          </span>
          <span className="text-xs text-muted-foreground/70">{formatBytes(file.size)}</span>
        </div>
      )}

      {/* Checkmark overlay */}
      {(isSelectMode || isSelected) && (
        <div className="absolute top-2 left-2">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
              isSelected
                ? 'bg-primary border-primary'
                : 'bg-black/30 border-white/80'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>
      )}

      {/* Video duration badge */}
      {isVideo && (
        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          VIDEO
        </div>
      )}
    </div>
  );
}

export function MediaGrid({
  files,
  isLoading,
  selectedIds,
  isSelectMode,
  onThumbnailClick,
  onLongPress,
  onToggleSelect,
  searchQuery,
}: MediaGridProps) {
  const groups = groupByDate(files);

  if (isLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
          {Array.from({ length: 18 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
          <img
            src="/assets/generated/media-placeholder.dim_400x300.png"
            alt="No media"
            className="w-16 h-16 object-contain opacity-50"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const p = (e.target as HTMLImageElement).parentElement;
              if (p) p.innerHTML = '<span class="text-4xl">📷</span>';
            }}
          />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {searchQuery ? 'No results found' : 'No photos yet'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {searchQuery
            ? `No photos match "${searchQuery}"`
            : 'Upload your first photo or video using the + button below'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {groups.map(({ label, files: groupFiles }) => (
        <div key={label} className="mb-2">
          {/* Date header */}
          <div className="px-4 py-3 sticky top-[112px] bg-background/95 backdrop-blur-sm z-[5]">
            <h2 className="text-sm font-medium text-foreground">{label}</h2>
          </div>

          {/* Grid */}
          <div className="px-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5">
            {groupFiles.map((file) => {
              const globalIndex = files.indexOf(file);
              return (
                <MediaThumbnail
                  key={file.id}
                  file={file}
                  index={globalIndex}
                  isSelected={selectedIds.has(file.id)}
                  isSelectMode={isSelectMode}
                  onClick={() => onThumbnailClick(file, globalIndex)}
                  onLongPress={() => onLongPress(file.id)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
