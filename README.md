# Job Application Assistant

A personal, privacy-focused job-application assistant built for software engineers. 

The application streamlines your job application workflow while keeping you 100% in control:
1. **Upload CV** (`.docx`) &rarr; Automatically parses into a structured, editable candidate profile.
2. **Review & Edit Profile** &rarr; Verify contact info, summary, experience bullets, projects, skills, education, and job preferences.
3. **Analyze Job Descriptions** (Phase 1) &rarr; Matches your profile against job descriptions, identifying key strengths and highlighting skill gaps.
4. **Tailored Applications & ATS-Safe Export** (Phase 1) &rarr; Generates tailored bullets and cover letters grounded strictly in your verified profile, exported as clean ATS-compliant Word documents.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router) + TypeScript (`strict` mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) via [Mongoose](https://mongoosejs.com/)
- **Validation**: [Zod](https://zod.dev/) for runtime input and model output verification
- **Document Processing**: [Mammoth](https://github.com/mwilliamson/mammoth.js) (DOCX text extraction) & [docx](https://docx.js.org/) (ATS-safe DOCX generation)
- **AI & LLM**: Google Gemini via `@google/genai` (**Gemini Interactions API**)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## Prerequisites

- **Node.js**: v20 or higher (v24 recommended)
- **pnpm**: v9 or v11 (`npm install -g pnpm`)
- **MongoDB**: A running MongoDB instance or MongoDB Atlas cluster connection string
- **Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/) (optional if running in mock mode)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd job_agent
```

### 2. Install Dependencies

Always use `pnpm`:

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials:

```ini
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Model name (default: gemini-3.5-flash)
GEMINI_MODEL=gemini-3.5-flash

# MongoDB connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/job_agent?retryWrites=true&w=majority

# Set to true to run completely offline with mock AI data (no API key required)
USE_AI_MOCKS=false
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use

### Phase 0: Profile Setup & CV Parsing

1. **Navigate to Profile**: Click **"Your Profile"** on the dashboard or go directly to `/profile`.
2. **Upload Your CV**:
   - Drag and drop or browse to select your `.docx` resume (maximum 5 MB).
   - The server extracts the text using `mammoth` and calls the Gemini Interactions API to extract structured fields into standard JSON format.
3. **Review & Edit**:
   - **Contact Information**: Name, email, phone, location, GitHub, LinkedIn, portfolio.
   - **Professional Summary**: Editable summary text.
   - **Skills**: Add or remove individual skill tags.
   - **Work Experience**: Add/remove roles, adjust dates, and add/remove individual bullet points. Every bullet is assigned a permanent, stable ID.
   - **Projects**: Manage project details, technologies, live links, and bullet points.
   - **Education**: Add institutions, degrees, fields of study, and years.
   - **Job Preferences**: Set target roles, location preferences, and remote style (remote, hybrid, on-site, flexible).
4. **Save Profile**: Click **"Save Profile"** at the top or bottom of the page. Your data is persisted to MongoDB and reloaded automatically on subsequent visits.

---

## Project Structure

```
job_agent/
├── docs/
│   └── AI-PIPELINE.md        # Technical explanation of AI pipeline & grounding rules
├── fixtures/
│   └── profile.json          # Sample developer profile fixture for testing/offline use
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── profile/
│   │   │       ├── route.ts          # GET/PUT candidate profile in MongoDB
│   │   │       └── upload/route.ts   # POST DOCX file upload & mammoth parser
│   │   ├── profile/page.tsx          # Profile editor and CV upload UI
│   │   ├── layout.tsx                # App root layout
│   │   └── page.tsx                  # Dashboard overview
│   ├── components/
│   │   └── profile/                  # Modular profile editor components
│   └── lib/
│       ├── ai/
│       │   ├── index.ts              # AiPipeline interface & Gemini Interactions caller
│       │   ├── mock.ts               # Offline mock implementation
│       │   └── prompts.ts            # Centralized LLM prompts
│       ├── db/
│       │   ├── connection.ts         # Cached Mongoose connection manager
│       │   └── models/profile.ts     # Mongoose Profile schema and model
│       └── profile/
│           └── schema.ts             # Zod validation schemas & stable ID generator
├── AGENTS.md                         # Product specs, grounding rules & coding standards
└── package.json
```

---

## Development & Testing Commands

Before submitting code, ensure all quality checks pass:

```bash
pnpm typecheck   # Typecheck TypeScript without emitting JS (tsc --noEmit)
pnpm lint        # Run ESLint across the codebase
pnpm test        # Run unit test suite using Vitest
pnpm build       # Create an optimized production build
```

---

## Security & Grounding Principles

1. **Non-Negotiable Privacy (`store: false`)**:
   All Gemini API calls strictly pass `store: false` to ensure personal CV data is not retained by external model providers.
2. **Profile is the Single Source of Truth**:
   The AI assistant is strictly grounded in your verified profile. In Phase 1, tailored bullets will strictly reference verified `sourceId` attributes; invented achievements, unlisted skills, or phantom employers are automatically rejected.
3. **No Unvalidated Output**:
   All model responses pass through Zod schema validation with automatic single-turn retry before being returned to the UI.
4. **Secrets Management**:
   API keys and database credentials live solely in `.env.local` and are never logged or exposed to the client.

---

## License

Private repository for personal use.
