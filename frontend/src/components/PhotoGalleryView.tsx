import React, { useState, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TopNavigationBar } from './TopNavigationBar';
import { SectionNavigation, SectionType } from './SectionNavigation';
import { MediaGrid } from './MediaGrid';
import { MediaLightbox } from './MediaLightbox';
import { SelectionActionBar } from './SelectionActionBar';
import { MediaUploadButton } from './MediaUploadButton';
import { SettingsPanelGP } from './SettingsPanelGP';
import { useListFiles } from '../hooks/useQueries';
import type { FileMetadata } from '../backend';

export function PhotoGalleryView() {
  const [activeSection, setActiveSection] = useState<SectionType>('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  const { data: files = [], isLoading, refetch } = useListFiles();

  // Filter by search
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Only show media (images/videos) in gallery
  const mediaFiles = filteredFiles.filter(
    (f) => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')
  );

  const allFiles = filteredFiles;

  const displayFiles = activeSection === 'gallery' ? mediaFiles : allFiles;

  const handleThumbnailClick = useCallback(
    (file: FileMetadata, index: number) => {
      if (isSelectMode) {
        toggleSelect(file.id);
      } else {
        setLightboxIndex(index);
      }
    },
    [isSelectMode]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) setIsSelectMode(false);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const enterSelectMode = useCallback((id: string) => {
    setIsSelectMode(true);
    setSelectedIds(new Set([id]));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectMode(false);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(displayFiles.map((f) => f.id)));
  }, [displayFiles]);

  const handleDeleteSuccess = useCallback(() => {
    clearSelection();
    refetch();
  }, [clearSelection, refetch]);

  const selectedFiles = displayFiles.filter((f) => selectedIds.has(f.id));

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Navigation */}
        <TopNavigationBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSettingsOpen={() => setSettingsOpen(true)}
          isSelectMode={isSelectMode}
          selectedCount={selectedIds.size}
          onClearSelection={clearSelection}
          onSelectAll={selectAll}
          totalCount={displayFiles.length}
        />

        {/* Section Navigation */}
        <SectionNavigation
          activeSection={activeSection}
          onSectionChange={(s) => {
            setActiveSection(s);
            clearSelection();
          }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <MediaGrid
            files={displayFiles}
            isLoading={isLoading}
            selectedIds={selectedIds}
            isSelectMode={isSelectMode}
            onThumbnailClick={handleThumbnailClick}
            onLongPress={enterSelectMode}
            onToggleSelect={toggleSelect}
            searchQuery={searchQuery}
          />
        </main>

        {/* Upload FAB */}
        {!isSelectMode && (
          <div className="fixed bottom-6 right-6 z-30">
            <MediaUploadButton onUploadComplete={() => refetch()} />
          </div>
        )}

        {/* Selection Action Bar */}
        {isSelectMode && selectedIds.size > 0 && (
          <SelectionActionBar
            selectedFiles={selectedFiles}
            onClearSelection={clearSelection}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <MediaLightbox
            files={displayFiles}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}

        {/* Settings Panel */}
        <SettingsPanelGP open={settingsOpen} onOpenChange={setSettingsOpen} files={files} />

        {/* Footer */}
        <footer className="border-t border-border py-3 px-6 bg-card">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>Built with</span>
            <span className="text-gp-red">♥</span>
            <span>using</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'photovault')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
            <span className="ml-2">© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
