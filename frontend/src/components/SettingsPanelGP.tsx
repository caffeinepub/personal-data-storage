import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { LogOut, HardDrive, User, Info } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { formatBytes } from '../utils/fileHelpers';
import type { FileMetadata } from '../backend';

const QUOTA_BYTES = 1_000_000_000_000_000; // 1000 TB

interface SettingsPanelGPProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: FileMetadata[];
}

export function SettingsPanelGP({ open, onOpenChange, files }: SettingsPanelGPProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const usedBytes = files.reduce((sum, f) => sum + Number(f.size), 0);
  const usedPercent = (usedBytes / QUOTA_BYTES) * 100;

  const getBarColor = () => {
    if (usedPercent > 80) return 'bg-destructive';
    if (usedPercent > 50) return 'bg-gp-yellow';
    return 'bg-gp-green';
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onOpenChange(false);
  };

  const principalStr = identity?.getPrincipal().toString() ?? '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-foreground font-google text-xl">Settings</SheetTitle>
        </SheetHeader>

        {/* Profile */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xl font-medium">
              {userProfile?.name?.slice(0, 1).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">{userProfile?.name ?? 'User'}</p>
            <p className="text-xs text-muted-foreground truncate font-mono">
              {principalStr.slice(0, 24)}...
            </p>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Storage Usage */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Storage</h3>
          </div>

          <div className="bg-secondary rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="font-medium text-foreground">{formatBytes(usedBytes)}</span>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{usedPercent < 0.01 && usedBytes > 0 ? '<0.01' : usedPercent.toFixed(4)}% used</span>
              <span>1,000 TB total</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Free</span>
              <span className="font-medium text-foreground">
                {formatBytes(Math.max(0, QUOTA_BYTES - usedBytes))}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Files</span>
              <span className="font-medium text-foreground">{files.length}</span>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* About */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">About</h3>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Platform: Internet Computer</p>
            <p>Storage: 1000 TB per user</p>
            <p>Auth: Internet Identity</p>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Sign out */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive font-medium gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </SheetContent>
    </Sheet>
  );
}
