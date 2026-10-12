"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { ProjectInput } from "@/types/genesis";
export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: async ({ signal }) => (await getApi()).getProjects(signal),
    refetchInterval: (query) =>
      query.state.data?.some((p) =>
        ["PROCESSING", "ANALYZING"].includes(p.status),
      )
        ? 3000
        : false,
  });
export const useProject = (id: string) =>
  useQuery({
    queryKey: ["project", id],
    queryFn: async ({ signal }) => (await getApi()).getProject(id, signal),
    refetchInterval: (query) =>
      !query.state.error &&
      (["PROCESSING", "ANALYZING"].includes(query.state.data?.status ?? "") ||
        query.state.data?.documents?.some((doc) =>
          ["VALIDATING", "PROCESSING"].includes(doc.status),
        ))
        ? 2000
        : false,
  });
export const useAnalysis = (id: string) =>
  useQuery({
    queryKey: ["analysis", id],
    queryFn: async ({ signal }) =>
      (await getApi()).getAnalysisStatus(id, signal),
    refetchInterval: (query) =>
      !query.state.error &&
      ["PROCESSING", "ANALYZING"].includes(query.state.data?.status ?? "")
        ? 2000
        : false,
  });
export const useBlueprint = (id: string) =>
  useQuery({
    queryKey: ["blueprint", id],
    queryFn: async ({ signal }) => {
      try {
        return await (await getApi()).getBlueprint(id, signal);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
export function useProjectActions(id?: string) {
  const cache = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ["projects"] }),
      cache.invalidateQueries({ queryKey: ["project", id] }),
      cache.invalidateQueries({ queryKey: ["analysis", id] }),
      cache.invalidateQueries({ queryKey: ["blueprint", id] }),
    ]);
  };
  const create = useMutation({
    mutationFn: async (input: ProjectInput) =>
      (await getApi()).createProject(input),
    onSuccess: () => cache.invalidateQueries({ queryKey: ["projects"] }),
  });
  const update = useMutation({
    mutationFn: async (input: ProjectInput) =>
      (await getApi()).updateProject(id!, input),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: async (project_id: string) =>
      (await getApi()).deleteProject(project_id),
    onSuccess: refresh,
  });
  const upload = useMutation({
    mutationFn: async ({
      project_id,
      file,
    }: {
      project_id: string;
      file: File;
    }) => (await getApi()).uploadDocument(project_id, file),
    onSuccess: async (document) => {
      cache.setQueryData(["last-upload", document.project_id], document);
      await refresh();
    },
  });
  const start = useMutation({
    mutationFn: async () => (await getApi()).startAnalysis(id!),
    onSuccess: refresh,
  });
  return { create, update, remove, upload, start };
}
