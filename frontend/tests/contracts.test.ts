import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { createTransport, ApiError, validateFile } from "../lib/api/client";
import { createMockApi } from "../lib/api/mocks";
import { createHttpApi } from "../lib/api/http";
import {
  blueprintSchema,
  analysisSchema,
  projectSchema,
} from "../types/genesis";
import { sampleBlueprint } from "../lib/api/mocks/fixtures";

test("sample blueprint preserves wire IDs and all traceability references resolve", () => {
  const data = blueprintSchema.parse(sampleBlueprint("proj_test"));
  const references: Record<string, Set<unknown>> = {
    requirement_id: new Set(data.requirements?.map((r) => r.requirement_id)),
    feature_id: new Set(data.features?.map((r) => r.feature_id)),
    user_story_id: new Set(data.user_stories?.map((r) => r.user_story_id)),
    api_design_id: new Set(data.api_design?.map((r) => r.api_design_id)),
    task_id: new Set(data.development_breakdown?.map((r) => r.task_id)),
  };
  for (const row of data.traceability ?? [])
    for (const [key, ids] of Object.entries(references))
      assert.ok(ids.has(row[key]), `${key}: ${row[key]}`);
  assert.equal(data.requirements?.[0].project_id, "proj_test");
});
test("analysis progress is optional and invalid statuses or progress are rejected", () => {
  assert.deepEqual(
    analysisSchema.parse({ project_id: "proj_1", status: "ANALYZING" }),
    { project_id: "proj_1", status: "ANALYZING" },
  );
  assert.equal(
    analysisSchema.safeParse({ project_id: "proj_1", status: "done" }).success,
    false,
  );
  assert.equal(
    analysisSchema.safeParse({
      project_id: "proj_1",
      status: "ANALYZING",
      progress: 101,
    }).success,
    false,
  );
});
test("mock workflow persists project, upload metadata, analysis and blueprint across adapters", async () => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
  };
  const api = createMockApi(storage, 0);
  const project = await api.createProject({
    project_name: "Client project",
    project_description: "A scheduling application.",
  });
  assert.equal(project.status, "CREATED");
  assert.match(project.project_id, /^proj_/);
  const file = new File(["requirements"], "scope.TXT", { type: "text/plain" });
  const document = await api.uploadDocument(project.project_id, file);
  assert.equal(document.status, "UPLOADED");
  assert.equal(document.file_type, "txt");
  assert.equal(
    (await api.getProject(project.project_id)).documents?.[0].status,
    "UPLOADED",
  );
  await assert.rejects(
    api.getBlueprint(project.project_id),
    (error) => error instanceof ApiError && error.status === 404,
  );
  const analysis = await api.startAnalysis(project.project_id);
  assert.equal(analysis.status, "PROCESSING");
  assert.equal(analysis.progress, undefined);
  await assert.rejects(
    api.startAnalysis(project.project_id),
    /already running/,
  );
  const saved = JSON.parse(memory.get("genesis-demo-v1")!);
  saved.started[project.project_id] = Date.now() - 11000;
  memory.set("genesis-demo-v1", JSON.stringify(saved));
  const restored = createMockApi(storage, 0);
  assert.equal(
    (await restored.getAnalysisStatus(project.project_id)).status,
    "COMPLETED",
  );
  assert.equal(
    (await restored.getProject(project.project_id)).documents?.[0].status,
    "PROCESSED",
  );
  const blueprint = await restored.getBlueprint(project.project_id);
  assert.equal(blueprint.project_id, project.project_id);
  assert.equal(blueprint.requirements?.[0].document_id, document.document_id);
  await restored.deleteProject(project.project_id);
  await assert.rejects(restored.getProject(project.project_id), /not found/);
});
test("file validation rejects unsupported and empty files without changing saved projects", async () => {
  assert.throws(
    () => validateFile(new File(["x"], "file.exe")),
    /PDF, DOCX or TXT/,
  );
  assert.throws(() => validateFile(new File([], "empty.pdf")), /empty/);
  const api = createMockApi(undefined, 0);
  const before = await api.getProjects();
  await assert.rejects(
    api.createProject({
      project_name: " ",
      project_description: "description",
    }),
    /unexpected response/,
  );
  assert.equal((await api.getProjects()).length, before.length);
});
test("transport validates response shape and never exposes backend stack traces", async () => {
  const invalid = createTransport(
    "http://api.test",
    async () => new Response(JSON.stringify({ id: "wrong" })),
  );
  await assert.rejects(
    invalid("/projects/1", projectSchema),
    /unexpected response/,
  );
  const failed = createTransport(
    "http://api.test",
    async () =>
      new Response("Traceback secret database credentials", { status: 500 }),
  );
  await assert.rejects(
    failed("/projects", z.unknown()),
    (error) =>
      error instanceof ApiError &&
      error.status === 500 &&
      !error.message.includes("secret"),
  );
  const malformed = createTransport(
    "http://api.test",
    async () => new Response("not json"),
  );
  await assert.rejects(malformed("/projects", z.unknown()), /invalid response/);
});
test("transport aborts timeout and preserves caller cancellation", async () => {
  const fetcher: typeof fetch = async (_url, init) =>
    new Promise((_resolve, reject) => {
      if (init?.signal?.aborted) reject(init.signal.reason);
      else
        init?.signal?.addEventListener("abort", () =>
          reject(init.signal?.reason),
        );
    });
  await assert.rejects(
    createTransport("http://api.test", fetcher, 10)("/projects", z.unknown()),
    /timed out/,
  );
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(
    createTransport("http://api.test", fetcher)("/projects", z.unknown(), {
      signal: abort.signal,
    }),
    (error) => error instanceof DOMException && error.name === "AbortError",
  );
});
test("HTTP adapter uses encoded agreed endpoints and native multipart boundaries", async () => {
  const previous = globalThis.fetch;
  const calls: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(
      JSON.stringify({
        document_id: "doc_1",
        project_id: "project/a",
        filename: "scope.txt",
        file_type: "txt",
        status: "UPLOADED",
      }),
    );
  };
  try {
    const api = createHttpApi("http://api.test/");
    const file = new File(["scope"], "scope.txt");
    await api.uploadDocument("project/a", file);
    assert.equal(
      calls[0].url,
      "http://api.test/projects/project%2Fa/documents",
    );
    assert.equal(calls[0].init?.method, "POST");
    assert.ok(calls[0].init?.body instanceof FormData);
    assert.equal(calls[0].init?.headers, undefined);
    assert.equal(
      (calls[0].init?.body as FormData).get("file") instanceof File,
      true,
    );
  } finally {
    globalThis.fetch = previous;
  }
});
