import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/db/connection", () => ({
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

const mockFind = vi.fn();

vi.mock("@/lib/db/models/application", () => ({
  ApplicationModel: {
    find: (...args: unknown[]) => mockFind(...args),
  },
}));

describe("GET /api/applications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a list of applications formatted for dashboard", async () => {
    const mockApps = [
      {
        _id: "app-123",
        job: { title: "Frontend Engineer", company: "Acme Corp" },
        createdAt: new Date("2026-11-20T10:00:00Z"),
      },
    ];

    mockFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockApps),
        }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      id: "app-123",
      title: "Frontend Engineer",
      company: "Acme Corp",
      date: "2026-11-20T10:00:00.000Z",
    });
  });

  it("handles empty applications list gracefully", async () => {
    mockFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });
});
