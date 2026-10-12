import { blueprintSchema } from './types/genesis';
import { sampleBlueprint } from './lib/api/mocks/fixtures';
import fs from 'fs';

const id = 'proj_demo';
const baseBlueprint = sampleBlueprint(id);
const ollamaData = JSON.parse(fs.readFileSync('ollama-output.json', 'utf8'));

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

const parsed = blueprintSchema.safeParse(baseBlueprint);
if (!parsed.success) {
  console.log(JSON.stringify(parsed.error.format(), null, 2));
} else {
  console.log('Success!');
}
