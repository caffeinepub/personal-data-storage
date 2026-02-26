import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Settings, X, CheckSquare, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

interface TopNavigationBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSettingsOpen: () => void;
  isSelectMode: boolean;
  selectedCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  totalCount: number;
}

export function TopNavigationBar({
  searchQuery,
  onSearchChange,
  onSettingsOpen,
  isSelectMode,
  selectedCount,
  onClearSelection,
  onSelectAll,
  totalCount,
}: TopNavigationBarProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const searchRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const initials = userProfile?.name
    ? userProfile.name.slice(0, 2).toUpperCase()
    : identity?.getPrincipal().toString().slice(0, 2).toUpperCase() ?? 'U';

  if (isSelectMode) {
    return (
      <header className="sticky top-0 z-20 bg-card border-b border-border shadow-xs">
        <div className="h-16 flex items-center px-4 gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
          <span className="text-base font-medium flex-1">
            {selectedCount} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="gap-2 text-primary font-medium"
          >
            <CheckSquare className="w-4 h-4" />
            Select all ({totalCount})
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border shadow-xs">
      <div className="h-16 flex items-center px-4 gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src="/assets/generated/photovault-logo.dim_128x128.png"
              alt="PhotoVault"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const p = (e.target as HTMLImageElement).parentElement;
                if (p) p.innerHTML = '<span class="text-lg">📷</span>';
              }}
            />
          </div>
          <span className="text-lg font-google font-medium text-foreground hidden sm:block">
            PhotoVault
          </span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your photos"
            className="pl-10 pr-10 h-10 rounded-full bg-secondary border-transparent focus:border-primary/40 focus:bg-card transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsOpen}
            className="rounded-full w-9 h-9"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40">
                <Avatar className="w-8 h-8 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{userProfile?.name ?? 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {identity?.getPrincipal().toString().slice(0, 20)}...
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettingsOpen}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
