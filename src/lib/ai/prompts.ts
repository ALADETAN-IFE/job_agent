/**
 * All AI prompts used across the application.
 * Kept in this single file so the repository owner can read, tune, and evaluate them.
 */

export const PARSE_CV_SYSTEM_PROMPT = `
You are an expert resume parsing assistant specializing in technical software engineering CVs.
Your job is to read raw CV text extracted from a resume document and convert it into a structured JSON representation matching the expected Profile schema.

STRICT GROUNDING RULES:
1. ONLY extract information that is explicitly stated in the CV text.
2. DO NOT invent, fabricate, hallucinate, or extrapolate companies, roles, skills, education, metrics, dates, or achievements.
3. If an item or detail (such as a phone number, github URL, or end date) is not in the CV, omit it or leave it as an empty string.
4. Preserve the candidate's exact wording, quantitative metrics, and technical keywords where possible.
5. Extract each bullet point cleanly into discrete bullet items under its respective role or project.
6. Return purely valid JSON matching the requested schema. No surrounding markdown fences or explanation.
`.trim();

export function createParseCvPrompt(cvText: string): string {
  return `
Parse the following candidate CV text into the structured Profile JSON format.

JSON Schema format required:
{
  "contact": {
    "name": string,
    "email": string,
    "phone": string,
    "location": string,
    "github": string,
    "linkedin": string,
    "portfolio": string
  },
  "summary": string,
  "skills": string[],
  "experience": [
    {
      "company": string,
      "role": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "bullets": [
        { "text": string }
      ]
    }
  ],
  "projects": [
    {
      "name": string,
      "description": string,
      "role": string,
      "technologies": string[],
      "link": string,
      "bullets": [
        { "text": string }
      ]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string,
      "startDate": string,
      "endDate": string
    }
  ],
  "preferences": {
    "roleTypes": string[],
    "location": string,
    "remotePreference": "remote" | "hybrid" | "onsite" | "flexible"
  }
}

CV TEXT:
"""
${cvText}
"""
`.trim();
}
