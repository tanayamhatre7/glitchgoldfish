import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { project } = await req.json();

    const prompt = `You are an expert software architect.
I need a complete project blueprint for the following project:
Name: ${project.project_name}
Description: ${project.project_description}

Respond ONLY in valid JSON. Do not use markdown blocks. Your JSON must strictly follow this exact structure (this is an example for a food delivery app, but rewrite all the content and arrays to perfectly fit the new project above):

{
  "scope": {
    "in_scope": ["string"], "out_of_scope": ["string"], "assumptions": ["string"], "constraints": ["string"]
  },
  "requirements": [
    { "requirement_id": "FR-001", "type": "FUNCTIONAL", "description": "string", "priority": "CRITICAL", "status": "IDENTIFIED" }
  ],
  "user_roles": [
    { "role_id": "ROLE-001", "name": "string", "description": "string" }
  ],
  "features": [
    { "feature_id": "FEAT-001", "name": "string", "description": "string", "priority": "CRITICAL", "requirement_ids": [] }
  ],
  "user_stories": [
    { "user_story_id": "US-001", "description": "string", "role_id": "ROLE-001", "feature_id": "FEAT-001", "requirement_ids": [] }
  ],
  "architecture": {
    "architecture_id": "ARCH-001", "style": "string", "reasoning": "string",
    "components": [ { "component_id": "COMP-001", "name": "string", "responsibility": "string" } ],
    "relationships": ["string"], "data_flow": ["string"]
  },
  "technology_stack": {
    "technology_stack_id": "TECH-001",
    "frontend": [ { "technology": "string", "reason": "string" } ],
    "backend": [ { "technology": "string", "reason": "string" } ],
    "database": [ { "technology": "string", "reason": "string" } ],
    "infrastructure": [ { "technology": "string", "reason": "string" } ]
  },
  "database_design": {
    "database_design_id": "DB-001", "database_type": "string",
    "entities": [ { "entity_id": "ENT-001", "name": "string", "fields": ["string"] } ],
    "relationships": ["string"]
  },
  "roadmap": {
    "phases": [
      { "name": "string", "duration": "string", "description": "string", "milestones": ["string"] }
    ]
  },
  "api_design": [
    { "api_design_id": "API-001", "method": "string", "endpoint": "string", "description": "string", "authentication": "string", "request": {}, "response": {} }
  ]
}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in .env.local");
    }

    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-flash-latest"];
    let geminiRes;
    let errorText = "";

    for (const model of modelsToTry) {
      console.log(`Calling Gemini Cloud API with model: ${model}...`);
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (geminiRes.ok) {
        break; // Success! Exit the loop.
      } else {
        errorText = await geminiRes.text().catch(() => "");
        console.warn(`Model ${model} failed with status ${geminiRes.status}: ${errorText}`);
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      throw new Error(`All Gemini models failed. Last error status ${geminiRes?.status}: ${errorText}`);
    }

    const data = await geminiRes.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textOutput) {
      throw new Error("Invalid response format from Gemini");
    }

    console.log("Gemini response:", textOutput);
    
    const parsed = JSON.parse(textOutput);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Cloud API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

