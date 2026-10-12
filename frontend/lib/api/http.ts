import { z } from "zod";
import {
  analysisSchema,
  artifactSchema,
  blueprintSchema,
  documentSchema,
  projectSchema,
  requirementSchema,
  type GenesisApi,
} from "@/types/genesis";
import { createTransport, validateFile } from "./client";
export function createHttpApi(baseUrl: string): GenesisApi {
  const request = createTransport(baseUrl);
  const path = (project_id: string) =>
    `/projects/${encodeURIComponent(project_id)}`;
  const json = (method: string, body: unknown) => ({
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return {
    getProjects: (signal) =>
      request("/projects", z.array(projectSchema), { signal }),
    getProject: (id, signal) => request(path(id), projectSchema, { signal }),
    createProject: (input) =>
      request("/projects", projectSchema, json("POST", input)),
    updateProject: (id, input) =>
      request(path(id), projectSchema, json("PUT", input)),
    deleteProject: async (id) => {
      await request(path(id), z.unknown(), { method: "DELETE" });
    },
    uploadDocument: (id, file) => {
      validateFile(file);
      const body = new FormData();
      body.append("file", file);
      return request(`${path(id)}/documents`, documentSchema, {
        method: "POST",
        body,
      });
    },
    submitRequirements: (id, requirements) =>
      request(
        `${path(id)}/requirements`,
        z.array(requirementSchema),
        json("POST", { requirements }),
      ),
    startAnalysis: (id) =>
      request(`${path(id)}/analyze`, analysisSchema, { method: "POST" }),
    getAnalysisStatus: (id, signal) =>
      request(`${path(id)}/analysis`, analysisSchema, { signal }),
    getBlueprint: (id, signal) =>
      request(`${path(id)}/blueprint`, blueprintSchema, { signal }),
    getEstimation: (id, signal) =>
      request(`${path(id)}/estimation`, artifactSchema, { signal }),
    getQuotation: (id, signal) =>
      request(`${path(id)}/quotation`, artifactSchema, { signal }),
    getTraceability: (id, signal) =>
      request(`${path(id)}/traceability`, z.array(artifactSchema), { signal }),
  };
}
