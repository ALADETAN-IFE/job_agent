import { describe, it, expect, vi } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock the AI pipeline so tests never call Gemini
vi.mock("@/lib/ai", () => ({
  ai: {
    parseCv: vi.fn().mockResolvedValue({
      contact: { name: "Mock Name" },
      summary: "Mock Summary",
      skills: [],
      experience: [],
      projects: [],
      education: [],
      preferences: { roleTypes: [], location: "", remotePreference: "flexible" },
    }),
  },
}));

describe("POST /api/profile/upload", () => {
  it("rejects requests with no file", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost:3000/api/profile/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/No file uploaded/i);
  });

  it("rejects non-docx files (e.g., PDF)", async () => {
    const formData = new FormData();
    const fakePdf = new Blob(["fake pdf content"], { type: "application/pdf" });
    formData.append("file", fakePdf, "resume.pdf");

    const req = new NextRequest("http://localhost:3000/api/profile/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Only .docx files are accepted/i);
  });

  it("rejects files larger than 5 MB", async () => {
    const formData = new FormData();
    // 5MB + 1 byte
    const largeBlob = new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    formData.append("file", largeBlob, "large_resume.docx");

    const req = new NextRequest("http://localhost:3000/api/profile/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/exceeds the 5 MB limit/i);
  });
});
