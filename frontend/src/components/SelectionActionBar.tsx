import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Share2, Copy, Trash2 } from 'lucide-react';
import { ExternalBlob } from '../backend';
import type { FileMetadata } from '../backend';
import { useDeleteFile } from '../hooks/useQueries';
import { toast } from 'sonner';

interface SelectionActionBarProps {
  selectedFiles: FileMetadata[];
  onClearSelection: () => void;
  onDeleteSuccess: () => void;
}

export function SelectionActionBar({
  selectedFiles,
  onClearSelection,
  onDeleteSuccess,
}: SelectionActionBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteFile();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      for (const file of selectedFiles) {
        try {
          const blob = ExternalBlob.fromURL(file.id);
          const bytes = await blob.getBytes();
          const blobObj = new Blob([bytes], { type: file.mimeType });
          const url = URL.createObjectURL(blobObj);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
          // Small delay between downloads
          await new Promise((r) => setTimeout(r, 300));
        } catch {
          toast.error(`Failed to download "${file.name}"`);
        }
      }
      toast.success(`${selectedFiles.length} file(s) downloaded`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const links = selectedFiles.map((f) => {
      try {
        return ExternalBlob.fromURL(f.id).getDirectURL();
      } catch {
        return f.id;
      }
    });
    try {
      await navigator.clipboard.writeText(links.join('\n'));
      toast.success(`${selectedFiles.length} link(s) copied to clipboard`);
    } catch {
      toast.error('Failed to copy links');
    }
  };

  const handleCopy = async () => {
    const names = selectedFiles.map((f) => f.name).join('\n');
    try {
      await navigator.clipboard.writeText(names);
      toast.success(`${selectedFiles.length} file name(s) copied`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async () => {
    try {
      for (const file of selectedFiles) {
        await deleteFile(file.id);
      }
      toast.success(`${selectedFiles.length} file(s) deleted`);
      onDeleteSuccess();
    } catch {
      toast.error('Failed to delete some files');
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-slide-up">
        <div className="flex items-center gap-1 bg-card border border-border rounded-2xl px-3 py-2 shadow-action-bar">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl hover:bg-secondary"
          >
            {isDownloading ? (
              <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-primary" />
            )}
            <span className="text-xs text-muted-foreground">Download</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl hover:bg-secondary"
          >
            <Share2 className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Share</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl hover:bg-secondary"
          >
            <Copy className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Copy</span>
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl hover:bg-destructive/10"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
            <span className="text-xs text-destructive">Delete</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedFiles.length} item(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedFiles.length} selected file(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
