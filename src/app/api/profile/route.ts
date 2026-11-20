import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { ProfileModel } from "@/lib/db/models/profile";
import { SaveProfileSchema } from "@/lib/profile/schema";
import { createLogger } from "@/lib/logger";

const log = createLogger("api:profile");

const OWNER_ID = "default";

export async function GET() {
  try {
    await connectToDatabase();
    const doc = await ProfileModel.findOne({ ownerId: OWNER_ID }).lean();

    if (!doc) {
      log.info("GET: no profile found");
      return NextResponse.json(null, { status: 200 });
    }

    log.info("GET: profile loaded");
    return NextResponse.json(doc, { status: 200 });
  } catch (err: unknown) {
    const errorType = err instanceof Error ? err.name : "UnknownError";
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    log.error("profile GET failed", { errorType, errorMessage });
    return NextResponse.json(
      { error: "Failed to retrieve profile." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    const parseResult = SaveProfileSchema.safeParse(body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map((i) => ({
        path: i.path.join("."),
        code: i.code,
        message: i.message,
      }));
      log.warn("PUT: validation failed", { issueCount: issues.length, issues });

      const errorMsg =
        parseResult.error.issues.map((i) => i.message).join(". ") ||
        "Invalid profile data.";
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await ProfileModel.findOneAndUpdate(
      { ownerId: OWNER_ID },
      { ...parseResult.data, ownerId: OWNER_ID },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    log.info("PUT: profile saved", {
      experienceCount: parseResult.data.experience.length,
      projectCount: parseResult.data.projects.length,
      skillCount: parseResult.data.skills.length,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    const errorType = err instanceof Error ? err.name : "UnknownError";
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    log.error("profile PUT failed", { errorType, errorMessage });
    return NextResponse.json(
      { error: "Failed to save profile." },
      { status: 500 }
    );
  }
}
