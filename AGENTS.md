# AGENTS.md
 
Instructions for AI coding agents working in this repository.
Read this whole file before making changes.
 
## 1. Project
 
A **personal** job-application assistant for one user (the repo owner, a Lagos-based full-stack developer). It is not a multi-user product.
 
Flow: upload CV -> structured profile -> paste a job description -> match analysis -> tailored CV + cover letter -> human review -> DOCX export.
 
**Current scope: Phase 0 and Phase 1 only.**
 
- Phase 0: app foundations, CV upload and parsing, editable profile.
- Phase 1: job description input, match analysis, CV tailoring, cover letter, review screen, DOCX export.
 
**Out of scope. Do not build, scaffold, or stub these:** job discovery or scraping, paste-a-link fetching, the application tracker, the Chrome extension, auto-apply or form filling, email parsing, multi-user auth, billing. If a task seems to need one of these, stop and ask.
 
## 2. Ownership and workflow
 
You (the agent) write the code, including the AI pipeline. The owner reviews it. To make review easy:
 
- For any task larger than a single file, write a short plan first and **wait for approval** before writing code.
- Keep all prompts in one file, `src/lib/ai/prompts.ts`, so the owner can read and tune them.
- Keep the AI pipeline behind one interface (section 6) so the rest of the app never calls Gemini directly.
- Maintain `docs/AI-PIPELINE.md`: a plain-English explanation of how parsing, analysis, tailoring, and cover letter generation work, and how grounding is enforced. Update it whenever the pipeline changes.
- If a requirement is ambiguous, ask one specific question instead of guessing.
- Stay in scope. Do not refactor unrelated code.
- Commit in small, focused steps with clear messages (`feat:`, `fix:`, `test:`, `chore:`).
- Do not claim something works unless you ran the checks in section 4 and they passed. State what you ran and the result.
- When finished with a task, summarize: what changed, what was tested, and anything you could not verify.
 
## 3. Tech stack
 
- **Package manager: pnpm.** Use `pnpm` for everything. Never use npm or yarn or create other lockfiles.
- Next.js (App Router) with TypeScript in `strict` mode, `src/` directory, import alias `@/*`
- Tailwind CSS for styling
- MongoDB Atlas via `mongoose`
- `zod` for validating all external input and all model output
- `mammoth` to read uploaded DOCX files
- `docx` to generate DOCX exports
- `@google/genai` (latest) for Gemini
- `vitest` for tests
 
These dependencies are **already installed**. Do not install, upgrade, or remove dependencies without asking. If a small utility seems needed, write it yourself or ask first.
 
**Gemini:** use the Gemini **Interactions API**, which Google recommends for new projects. Before writing any Gemini call, read the current docs at https://ai.google.dev/gemini-api/docs/interactions-overview and follow the installed SDK's actual types. Do not guess method names or parameters. The default model is read from the `GEMINI_MODEL` env variable (suggested default: `gemini-3.5-flash`).
 
## 4. Commands
 
Make sure these exist in `package.json` and pass before you say a task is done:
 
```bash
pnpm dev          # local dev server
pnpm build        # production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
```
 
Run `pnpm typecheck && pnpm lint && pnpm test` after every meaningful change. Fix failures before moving on. Never disable a rule or skip a test to make a check pass.
 
## 5. Security and privacy rules (non-negotiable)
 
The CV contains personal data.
 
- Secrets (`GEMINI_API_KEY`, `MONGODB_URI`) live only in `.env.local`. Never hardcode them, log them, commit them, or expose them to client code. Only `NEXT_PUBLIC_` variables may reach the browser, and no secret may use that prefix.
- Keep `.env*` in `.gitignore`. Provide `.env.example` with placeholder values only. Never ask the owner to paste a real key into chat or code.
- Never log CV text, profile content, job descriptions, or generated output. Log IDs and error types only.
- All Gemini calls are server-side only and **must set `store: false`** so request content is not retained. Add a test that fails if any Gemini call omits it.
- Validate every API request body with zod. Return generic error messages to the client.
- File uploads: accept `.docx` only, limit size to 5 MB, and reject anything else.
- The app is single-user and runs locally. If any route could be deployed publicly, protect it with a simple password check from an env variable.
 
## 6. AI pipeline
 
Implement the pipeline in `src/lib/ai/` and expose it through one module, `src/lib/ai/index.ts`, exporting `ai: AiPipeline`. UI and API code import only from there.
 
```ts
export type JobInput = { title: string; company: string; description: string };
 
export type JobAnalysis = {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  keywords: string[];
  matchScore: number; // 0-100
  matched: string[];  // skills/keywords found in the profile
  gaps: string[];     // skills/keywords NOT in the profile (never hidden)
};
 
export type TailoredBullet = {
  text: string;
  sourceId: string; // id of the profile bullet this came from
};
 
export type TailoredCv = {
  summary: string;
  skills: string[]; // subset of profile skills only
  experience: { sourceId: string; bullets: TailoredBullet[] }[];
  projects: { sourceId: string; bullets: TailoredBullet[] }[];
};
 
export type CoverLetter = { body: string };
 
export interface AiPipeline {
  parseCv(cvText: string): Promise<Profile>;
  analyzeJob(profile: Profile, job: JobInput): Promise<JobAnalysis>;
  tailorCv(profile: Profile, job: JobInput, analysis: JobAnalysis): Promise<TailoredCv>;
  writeCoverLetter(profile: Profile, job: JobInput, analysis: JobAnalysis, toneSample?: string): Promise<CoverLetter>;
}
```
 
`Profile` is a zod schema and inferred type in `src/lib/profile/schema.ts`. It covers contact details, summary, experience, projects, skills, education, and preferences (role types, location). Every experience bullet and project has a stable `id` generated once and never regenerated on edit.
 
Rules:
 
- Request structured (JSON) output from Gemini and validate every response with zod. On validation failure, retry once, then return a clear error. Never pass unvalidated model output to the UI.
- Provide a mock implementation of `AiPipeline` returning realistic fixture data, used in tests and when `USE_AI_MOCKS=true`.
- Tests must never call the real Gemini API.
 
## 7. Grounding rules (the most important product rule)
 
The tailoring feature must never invent facts about the user.
 
- The stored **profile is the only source of truth**.
- A tailored CV may reorder, select, and reword the user's real bullets. It may not add skills, tools, employers, titles, dates, metrics, or achievements that are not in the profile.
- Every tailored bullet carries a `sourceId` that must match an existing profile item. Server code must **reject** a tailored result containing an unknown `sourceId` and surface an error to the UI.
- `skills` in a tailored CV must be a subset of the profile's skills.
- The cover letter may only reference experience and projects present in the profile.
- Gaps (job requirements missing from the profile) are shown to the user on the review screen, never silently dropped or papered over.
- The user reviews and approves everything before export. Nothing is exported automatically.
- Write tests for these rules using the mock pipeline: unknown `sourceId`, a skill not in the profile, and a missing gap must each be caught.
 
## 8. ATS-safe DOCX export
 
The exported CV must pass applicant tracking systems:
 
- Single column. No tables, text boxes, images, icons, headers/footers carrying content, or multi-column layouts.
- Standard headings: Summary, Skills, Experience, Projects, Education.
- Plain font (Calibri or Arial), consistent date format like `Jan 2025 - Present`.
- Real text only, with hyperlinks written as visible URLs (e.g. `github.com/username`), since the CV may be printed.
- A4 by default, selectable in one constant.
- Target 2 pages. Do not shrink fonts below 10 pt to force a fit.
 
Provide a unit test that generates a DOCX from fixture data and asserts there are no tables or drawings in the document XML.
 
## 9. UI requirements (Phase 0 and 1)
 
### Layout shell
 
Use a dashboard layout shared by all pages (one root layout component):
 
- **Desktop (md breakpoint and up):** a left sidebar with navigation, and the page content on the right.
  - The sidebar is **collapsible** (full labels <-> icons only). Remember the choice in `localStorage`.
  - The review screen (`/apply/[id]`) must be usable at full width: collapse the sidebar automatically there, or make it easy to collapse, because that page shows two columns side by side.
- **Mobile (below md):** **no sidebar. Use a fixed bottom navigation bar** with the same items.
  - Each item shows an icon and a text label, with a touch target of at least 44x44 px.
  - Pad the bar with `env(safe-area-inset-bottom)` and add bottom padding to page content so nothing hides behind it.
  - Do not use a hamburger menu or drawer.
- **Nav items (Phase 0 and 1 only):** Dashboard, Profile, New application. Do not add items for features that are out of scope.
- Navigation is a `<nav>` landmark with an accessible label. Mark the current page with `aria-current="page"` and a visible active style. Everything must be keyboard-usable.
 
### Pages (App Router)
 
1. `/` : dashboard. Shows a "new application" action, profile status (uploaded or not), and a short list of the most recent saved applications (title, company, date, link to `/apply/[id]`). This is a plain list of saved applications, **not a tracker**: no status fields, reminders, or follow-ups.
2. `/profile` : upload a CV (DOCX); shows the parsed profile in an editable form (contact, summary, experience, projects, skills, education, preferences). Save to the database.
3. `/apply/new` : form for job title, company, and pasted job description, plus an optional cover-letter tone sample.
4. `/apply/[id]` : the review screen:
   - Match score, matched skills, and **gaps** (visually prominent).
   - Original CV content vs tailored CV content, with each tailored bullet showing which source item it came from. On desktop show them **side by side**. On mobile **stack them** or switch with tabs (Original / Tailored), never two cramped columns.
   - Editable tailored text and cover letter.
   - Approve button, then "Download CV (.docx)" and "Download cover letter (.docx)".
 
### General
 
Keep the UI simple, responsive, and accessible (labels on all inputs, keyboard-usable, sufficient contrast, visible focus states). Handle loading, empty, and error states for every async action. Test layouts at roughly 375 px wide (phone) and 1280 px wide (desktop).
 
## 10. Code style and structure
 
- TypeScript strict; no `any` (use `unknown` and narrow). No non-null assertions without a comment explaining why.
- Prefer small, pure functions and named exports.
- Co-locate tests next to code as `*.test.ts`. Fixtures go in `fixtures/`: a sample profile and 3 sample job descriptions (frontend, backend, and a Nigerian role). Use clearly fake data. Never commit real personal data.
- Suggested layout:
 
```
src/
  app/               # pages and API routes
  components/        # UI components
  lib/
    ai/              # pipeline, prompts.ts, mocks
    profile/         # schema.ts
    db/              # connection + Mongoose models
    export/          # DOCX generation
docs/
  AI-PIPELINE.md
fixtures/
```
 
- Comments explain why, not what. No commented-out code left behind.
 
## 11. Build order
 
scaffold check -> DB connection + models -> profile schema -> upload and parse flow -> profile editor -> job input -> analysis -> tailoring + cover letter -> review screen -> DOCX export -> tests and docs.
 
## 12. Definition of done
 
**Phase 0 is done when:** the owner uploads a DOCX CV, sees a correct editable profile, edits it, saves it, and reloads it from the database.
 
**Phase 1 is done when:** the owner pastes a real job description and gets a match analysis with gaps, a tailored CV and cover letter that pass the grounding checks, edits them on the review screen, approves, and downloads ATS-safe DOCX files. All checks in section 4 pass.
 