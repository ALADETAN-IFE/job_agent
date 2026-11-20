import { describe, it, expect, vi } from "vitest";
import { GeminiAiPipeline, GenAiClientLike } from "./index";

describe("Gemini Privacy Rule: store: false enforcement", () => {
  it("fails if any Gemini call omits store: false or sets store: true", async () => {
    let capturedParams: Record<string, unknown> | null = null;

    const mockClient: GenAiClientLike = {
      interactions: {
        create: vi.fn().mockImplementation(async (params) => {
          capturedParams = params;
          return {
            output_text: JSON.stringify({
              contact: { name: "Test Candidate", email: "test@example.com" },
              summary: "A developer",
              skills: ["TypeScript"],
              experience: [],
              projects: [],
              education: [],
              preferences: { roleTypes: [], location: "" },
            }),
          };
        }),
      },
    };

    const pipeline = new GeminiAiPipeline(mockClient, "gemini-3.5-flash");
    await pipeline.parseCv("Sample CV raw text from candidate");

    expect(capturedParams).toBeDefined();
    expect(capturedParams).not.toBeNull();
    // Non-negotiable security requirement
    const params = capturedParams as unknown as Record<string, unknown>;
    expect(params["store"]).toBe(false);
  });
});
