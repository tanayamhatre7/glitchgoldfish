import { z } from "zod";
import {
  analysisSchema,
  artifactSchema,
  blueprintSchema,
  documentSchema,
  projectInputSchema,
  projectSchema,
  type GenesisApi,
  type Project,
} from "@/types/genesis";
import { ApiError, validate, validateFile } from "../client";
import { sampleBlueprint, sampleProjects } from "./fixtures";
type Store = { projects: Project[]; started: Record<string, number>; blueprints?: Record<string, Blueprint> };
const key = "genesis-demo-v1";
export function createMockApi(
  storage?: Pick<Storage, "getItem" | "setItem">,
  latency = 350,
): GenesisApi {
  let memory: Store = {
    projects: structuredClone(sampleProjects),
    started: {},
  };
  const read = (): Store => {
    const persisted = storage?.getItem(key);
    if (!persisted) return memory;
    try {
      return z
        .object({
          projects: z.array(projectSchema),
          started: z.record(z.string(), z.number()),
          blueprints: z.record(z.string(), blueprintSchema).optional(),
        })
        .parse(JSON.parse(persisted));
    } catch (err) {
      console.warn("Corrupted demo storage detected. Resetting to default state...", err);
      storage?.removeItem(key);
      return memory;
    }
  };
  const save = (store: Store) => {
    memory = store;
    try {
      storage?.setItem(key, JSON.stringify(store));
    } catch {
      throw new ApiError(
        "Browser storage is unavailable. Enable local storage to save demo projects.",
      );
    }
  };
  const pause = async (signal?: AbortSignal) => {
    await new Promise((resolve) => setTimeout(resolve, latency));
    signal?.throwIfAborted();
  };
  const find = (store: Store, id: string) => {
    const project = store.projects.find((p) => p.project_id === id);
    if (!project) throw new ApiError("Project not found.", 404);
    return project;
  };
  const advance = (store: Store, project: Project) => {
    const started = store.started[project.project_id];
    if (
      started &&
      (project.status === "PROCESSING" || project.status === "ANALYZING")
    ) {
      const elapsed = Date.now() - started;
      project.status =
        elapsed > 9000
          ? "COMPLETED"
          : elapsed > 2500
            ? "ANALYZING"
            : "PROCESSING";
      project.documents?.forEach((doc) => {
        doc.status = elapsed > 2500 ? "PROCESSED" : "PROCESSING";
      });
      project.updated_at = new Date().toISOString();
      save(store);
    }
  };
  const api: GenesisApi = {
    async getProjects(signal) {
      await pause(signal);
      const store = read();
      store.projects.forEach((p) => advance(store, p));
      return validate(z.array(projectSchema), store.projects);
    },
    async getProject(id, signal) {
      await pause(signal);
      const store = read();
      const project = find(store, id);
      advance(store, project);
      return validate(projectSchema, project);
    },
    async createProject(input) {
      await pause();
      const parsed = validate(projectInputSchema, input);
      const store = read();
      const timestamp = new Date().toISOString();
      const project: Project = {
        ...parsed,
        project_id: `proj_${crypto.randomUUID()}`,
        status: "CREATED",
        created_at: timestamp,
        updated_at: timestamp,
        documents: [],
      };
      store.projects.unshift(project);
      save(store);
      return validate(projectSchema, project);
    },
    async updateProject(id, input) {
      await pause();
      const store = read();
      const project = find(store, id);
      if (project.status !== "CREATED")
        throw new ApiError("Only draft input can be edited in this demo.", 409);
      Object.assign(project, validate(projectInputSchema, input), {
        updated_at: new Date().toISOString(),
      });
      save(store);
      return validate(projectSchema, project);
    },
    async deleteProject(id) {
      await pause();
      const store = read();
      find(store, id);
      store.projects = store.projects.filter((p) => p.project_id !== id);
      delete store.started[id];
      save(store);
    },
    async uploadDocument(id, file) {
      validateFile(file);
      await pause();
      const store = read();
      const project = find(store, id);
      if (project.status !== "CREATED")
        throw new ApiError(
          "Documents can only be uploaded before analysis in this demo.",
          409,
        );
      const document = validate(documentSchema, {
        document_id: `doc_${crypto.randomUUID()}`,
        project_id: id,
        filename: file.name,
        file_type: file.name.split(".").pop()!.toLowerCase(),
        status: "UPLOADED",
        file_size: file.size,
      });
      project.documents = [...(project.documents ?? []), document];
      project.updated_at = new Date().toISOString();
      save(store);
      return document;
    },
    async submitRequirements() {
      throw new ApiError(
        "Manual requirement submission is pending agreement with Member 1.",
      );
    },
    async startAnalysis(id) {
      await pause();
      const store = read();
      const project = find(store, id);
      if (project.status === "PROCESSING" || project.status === "ANALYZING")
        throw new ApiError("Analysis is already running.", 409);
      
      project.status = "ANALYZING";
      store.started[id] = Date.now();
      save(store);

      // Trigger real LLM analysis via our new API route
      fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project })
      }).then(async res => {
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || "Gemini fetch failed");
        }
        return res.json();
      }).then(ollamaData => {
        const currentStore = read();
        const p = find(currentStore, id);
        
        // Merge Gemini output with sample fixture to guarantee complete valid JSON
        const baseBlueprint = sampleBlueprint(id);
        if (ollamaData.scope) baseBlueprint.scope = ollamaData.scope;
        if (ollamaData.requirements) {
          baseBlueprint.requirements = ollamaData.requirements.map((req: any) => ({
            ...req,
            project_id: id
          }));
        }
        if (ollamaData.user_roles) baseBlueprint.user_roles = ollamaData.user_roles;
        if (ollamaData.features) baseBlueprint.features = ollamaData.features;
        if (ollamaData.user_stories) baseBlueprint.user_stories = ollamaData.user_stories;
        if (ollamaData.architecture) baseBlueprint.architecture = ollamaData.architecture;
        if (ollamaData.technology_stack) baseBlueprint.technology_stack = ollamaData.technology_stack;
        if (ollamaData.database_design) baseBlueprint.database_design = ollamaData.database_design;
        if (ollamaData.api_design) baseBlueprint.api_design = ollamaData.api_design;
        if (ollamaData.roadmap) baseBlueprint.roadmap = ollamaData.roadmap;
        
        currentStore.blueprints = currentStore.blueprints || {};
        currentStore.blueprints[id] = baseBlueprint;
        p.status = "COMPLETED";
        save(currentStore);
      }).catch(err => {
        console.error("LLM Generation Error:", err);
        const currentStore = read();
        const p = find(currentStore, id);
        p.status = "FAILED";
        save(currentStore);
      });

      return validate(analysisSchema, {
        project_id: id,
        status: project.status,
      });
    },
    async getAnalysisStatus(id, signal) {
      const project = await api.getProject(id, signal);
      return validate(analysisSchema, {
        project_id: id,
        status: project.status,
        documents: project.documents,
      });
    },
    async getBlueprint(id, signal) {
      const project = await api.getProject(id, signal);
      if (project.status !== "COMPLETED")
        throw new ApiError("No blueprint has been generated yet.", 404);
        
      const store = read();
      if (store.blueprints && store.blueprints[id]) {
        return validate(blueprintSchema, store.blueprints[id]);
      }

      const blueprint = sampleBlueprint(id);
      blueprint.requirements = blueprint.requirements?.map((requirement) => ({
        ...requirement,
        document_id: project.documents?.[0]?.document_id,
      }));
      return validate(blueprintSchema, blueprint);
    },
    async getEstimation(id, signal) {
      return validate(
        artifactSchema,
        (await api.getBlueprint(id, signal)).effort_estimation,
      );
    },
    async getQuotation(id, signal) {
      return validate(
        artifactSchema,
        (await api.getBlueprint(id, signal)).quotation,
      );
    },
    async getTraceability(id, signal) {
      return validate(
        z.array(artifactSchema),
        (await api.getBlueprint(id, signal)).traceability,
      );
    },
  };
  return api;
}
