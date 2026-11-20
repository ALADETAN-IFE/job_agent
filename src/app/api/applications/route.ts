import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { ApplicationModel } from "@/lib/db/models/application";
import { createLogger } from "@/lib/logger";

const log = createLogger("api:applications");
const OWNER_ID = "default";

export async function GET() {
  try {
    await connectToDatabase();
    // Return recent applications: id, job.title, job.company, createdAt
    const apps = await ApplicationModel.find(
      { ownerId: OWNER_ID },
      { _id: 1, job: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    log.info("applications list retrieved", { count: apps.length });

    const formatted = apps.map((app) => ({
      id: String(app._id),
      title: app.job?.title || "Untitled Role",
      company: app.job?.company || "Unknown Company",
      date: app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (err: unknown) {
    const errorType = err instanceof Error ? err.name : "UnknownError";
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    log.error("applications GET failed", { errorType, errorMessage });
    return NextResponse.json(
      { error: "Failed to retrieve applications." },
      { status: 500 }
    );
  }
}
