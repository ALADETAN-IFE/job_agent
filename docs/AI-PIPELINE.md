# AI Pipeline & Grounding Architecture

This document explains how the AI pipeline in `src/lib/ai` processes documents, interfaces with Gemini, and strictly enforces grounding rules to guarantee zero hallucinated facts.

---

## 1. Overview & Single Interface

All AI interactions are encapsulated behind a single TypeScript interface in `src/lib/ai/index.ts`:

```typescript
export interface AiPipeline {
  parseCv(cvText: string): Promise<Profile>;
  analyzeJob(profile: Profile, job: JobInput): Promise<JobAnalysis>;
  tailorCv(profile: Profile, job: JobInput, analysis: JobAnalysis): Promise<TailoredCv>;
  writeCoverLetter(profile: Profile, job: JobInput, analysis: JobAnalysis, toneSample?: string): Promise<CoverLetter>;
}
```

UI components and API route handlers **never** import or call Gemini directly. They call `ai.*` methods on the exported `ai: AiPipeline` instance.

---

## 2. Phase 0: CV Parsing Pipeline

### Step 1: File Validation & Extraction
1. The user uploads a CV file via `/profile`.
2. The server endpoint `/api/profile/upload`:
   - Enforces `.docx` format only (rejects `.pdf`, `.txt`, etc.).
   - Enforces strict 5 MB file size limit.
3. Raw text is extracted from the DOCX binary using `mammoth.extractRawText({ buffer })`.

### Step 2: Gemini Interactions API Call
1. Text is passed to `ai.parseCv(cvText)`.
2. System instructions (`PARSE_CV_SYSTEM_PROMPT`) and user prompts (`createParseCvPrompt`) are defined in `src/lib/ai/prompts.ts`.
3. The call uses the **Gemini Interactions API** (`ai.interactions.create`):
   - **`store: false`** is non-negotiably set on all calls so personal CV data is not retained by Google servers.
   - Structured JSON is requested using `response_format: { mime_type: "application/json" }`.
   - The default model is loaded from `process.env.GEMINI_MODEL || "gemini-3.5-flash"`.

### Step 3: Validation & Automatic Retry
1. The model output is validated against the Zod `ProfileSchema`.
2. If schema validation fails, the pipeline automatically retries once with an explicit correction prompt.
3. On repeated failure, a clear error is thrown. Unvalidated or malformed model responses are never returned to the UI.

### Step 4: Stable ID Assignment
1. The validated profile is passed through `ensureStableIds()`.
2. Every experience entry, experience bullet point, project entry, and project bullet point is assigned a unique UUID.
3. Once assigned, these IDs are preserved across edits and stored in MongoDB.

---

## 3. Strict Grounding Rules

Grounding is the core product rule: the tailored application must **never invent facts**.

1. **Profile as Single Source of Truth**:
   The stored profile document in MongoDB is the only factual source of truth for all downstream operations.
2. **Stable Bullet Provenance (`sourceId`)**:
   In Phase 1, every tailored bullet will carry a `sourceId` pointing to an existing profile bullet ID. Any bullet without a matching `sourceId` is automatically rejected by the server.
3. **Skill Subset**:
   Tailored skills will only be a subset of the profile's verified skills.
4. **Honest Gaps**:
   Any required skills from a job description not present in the candidate's profile are surfaced explicitly as `gaps` on the review screen. Gaps are never concealed or fabricated.
5. **Human Approval**:
   Nothing is exported automatically. The user reviews, edits, and approves all tailored content before DOCX generation.

---

## 4. Testing & Offline Mock Pipeline

- Unit tests (`*.test.ts`) never make network calls to Gemini.
- When running in tests or when `process.env.USE_AI_MOCKS === "true"`, `MockAiPipeline` (`src/lib/ai/mock.ts`) returns realistic fixture data from `fixtures/profile.json`.
- A dedicated test (`src/lib/ai/gemini-store-flag.test.ts`) asserts that any Gemini interaction call strictly includes `store: false`.
