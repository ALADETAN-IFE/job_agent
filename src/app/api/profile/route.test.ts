import { describe, it, expect, vi } from "vitest";
import { PUT } from "./route";
import { NextRequest } from "next/server";

// Mock database connection and model so test is isolated
vi.mock("@/lib/db/connection", () => ({
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/db/models/profile", () => ({
  ProfileModel: {
    findOneAndUpdate: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue({ ownerId: "default" }),
    }),
  },
}));

describe("PUT /api/profile input validation", () => {
  it("rejects saving a completely blank profile", async () => {
    const blankBody = {
      contact: {
        name: "",
        email: "",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blankBody),
    });

    const res = await PUT(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Full name is required/i);
  });

  it("rejects saving a profile with invalid email", async () => {
    const invalidBody = {
      contact: {
        name: "Test Candidate",
        email: "not-an-email",
      },
    };

    const req = new NextRequest("http://localhost:3000/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidBody),
    });

    const res = await PUT(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/valid email/i);
  });

  it("accepts saving a valid profile", async () => {
    const validBody = {
      contact: {
        name: "Test Candidate",
        email: "candidate@example.com",
      },
      summary: "A software engineer",
      skills: ["TypeScript"],
      experience: [],
      projects: [],
      education: [],
    };

    const req = new NextRequest("http://localhost:3000/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);
  });
});
