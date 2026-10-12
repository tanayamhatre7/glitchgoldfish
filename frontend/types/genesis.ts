import { z } from "zod";

export const projectStatusSchema = z.enum([
  "CREATED",
  "PROCESSING",
  "ANALYZING",
  "COMPLETED",
  "FAILED",
]);
export const documentSchema = z.object({
  document_id: z.string(),
  project_id: z.string(),
  filename: z.string(),
  file_type: z.enum(["pdf", "docx", "txt"]),
  status: z.enum([
    "UPLOADED",
    "VALIDATING",
    "PROCESSING",
    "PROCESSED",
    "FAILED",
  ]),
  file_size: z.number().optional(),
  error_message: z.string().optional(),
});
export const projectInputSchema = z.object({
  project_name: z.string().trim().min(1, "Enter a project name."),
  project_description: z.string().trim().min(1, "Describe the client problem."),
});
export const projectSchema = projectInputSchema.extend({
  project_id: z.string(),
  status: projectStatusSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  documents: z.array(documentSchema).optional(),
});
export const analysisSchema = z.object({
  project_id: z.string(),
  status: projectStatusSchema,
  progress: z.number().min(0).max(100).optional(),
  error_message: z.string().optional(),
  documents: z.array(documentSchema).optional(),
});
export const requirementSchema = z.object({
  requirement_id: z.string(),
  project_id: z.string(),
  document_id: z.string().optional(),
  type: z.enum(["FUNCTIONAL", "NON_FUNCTIONAL", "BUSINESS", "CONSTRAINT"]),
  description: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  source_reference: z
    .object({ page: z.number().optional(), section: z.string().optional() })
    .optional(),
  status: z.string(),
});
// Nested artifact contracts are pending team agreement. Preserve their wire keys.
export const artifactSchema = z.record(z.string(), z.json());
export const blueprintSchema = z.object({
  blueprint_id: z.string(),
  project_id: z.string(),
  scope: artifactSchema.nullish(),
  requirements: z.array(requirementSchema).nullish(),
  user_roles: z.array(artifactSchema).nullish(),
  features: z.array(artifactSchema).nullish(),
  user_stories: z.array(artifactSchema).nullish(),
  architecture: artifactSchema.nullish(),
  technology_stack: artifactSchema.nullish(),
  database_design: artifactSchema.nullish(),
  api_design: z.array(artifactSchema).nullish(),
  security: artifactSchema.nullish(),
  development_breakdown: z.array(artifactSchema).nullish(),
  effort_estimation: artifactSchema.nullish(),
  timeline: artifactSchema.nullish(),
  cost_estimation: artifactSchema.nullish(),
  quotation: artifactSchema.nullish(),
  roadmap: artifactSchema.nullish(),
  traceability: z.array(artifactSchema).nullish(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
  version: z.number().int().positive(),
});
export type Project = z.infer<typeof projectSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ProjectDocument = z.infer<typeof documentSchema>;
export type Analysis = z.infer<typeof analysisSchema>;
export type Requirement = z.infer<typeof requirementSchema>;
export type Blueprint = z.infer<typeof blueprintSchema>;
export type Artifact = z.infer<typeof artifactSchema>;
export type JsonValue = z.infer<ReturnType<typeof z.json>>;
export interface GenesisApi {
  getProjects(signal?: AbortSignal): Promise<Project[]>;
  getProject(project_id: string, signal?: AbortSignal): Promise<Project>;
  createProject(input: ProjectInput): Promise<Project>;
  updateProject(project_id: string, input: ProjectInput): Promise<Project>;
  deleteProject(project_id: string): Promise<void>;
  uploadDocument(project_id: string, file: File): Promise<ProjectDocument>;
  submitRequirements(
    project_id: string,
    requirements: Requirement[],
  ): Promise<Requirement[]>;
  startAnalysis(project_id: string): Promise<Analysis>;
  getAnalysisStatus(
    project_id: string,
    signal?: AbortSignal,
  ): Promise<Analysis>;
  getBlueprint(project_id: string, signal?: AbortSignal): Promise<Blueprint>;
  getEstimation(project_id: string, signal?: AbortSignal): Promise<Artifact>;
  getQuotation(project_id: string, signal?: AbortSignal): Promise<Artifact>;
  getTraceability(
    project_id: string,
    signal?: AbortSignal,
  ): Promise<Artifact[]>;
}
