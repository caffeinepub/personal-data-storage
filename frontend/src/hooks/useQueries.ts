import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { FileMetadata, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';

// ─── File Queries ────────────────────────────────────────────────────────────

export function useListFiles() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<FileMetadata[]>({
    queryKey: ['files', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.listUserFiles(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetUserQuota() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['quota', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return BigInt(0);
      const principal = identity.getPrincipal();
      return actor.getPerUserQuota(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSaveFileReference() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      blob,
      name,
      size,
      mimeType,
    }: {
      id: string;
      blob: ExternalBlob;
      name: string;
      size: bigint;
      mimeType: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveFileReference(id, blob, name, size, mimeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', identity?.getPrincipal().toString()] });
      queryClient.invalidateQueries({ queryKey: ['quota', identity?.getPrincipal().toString()] });
    },
  });
}

export function useDeleteFile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeFileReference(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', identity?.getPrincipal().toString()] });
      queryClient.invalidateQueries({ queryKey: ['quota', identity?.getPrincipal().toString()] });
    },
  });
}

// ─── User Profile Queries ─────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', identity?.getPrincipal().toString()] });
    },
  });
}

export type { FileMetadata, UserProfile };
