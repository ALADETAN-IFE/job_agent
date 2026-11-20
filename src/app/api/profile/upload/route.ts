import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { ai } from "@/lib/ai";
import { createLogger } from "@/lib/logger";

const log = createLogger("api:upload");

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const startMs = Date.now();
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      log.warn("rejected: no file in request");
      return NextResponse.json(
        { error: "No file uploaded. Please upload a .docx file." },
        { status: 400 }
      );
    }

    const fileName = file.name || "";
    const fileSizeKB = Math.round(file.size / 1024);
    const mimeType = file.type || "(empty)";
    const isDocxExtension = fileName.toLowerCase().endsWith(".docx");
    const isDocxMime =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/docx" ||
      file.type === "application/octet-stream" ||
      !file.type; // Some browsers omit MIME type for docx

    log.info("file received", { fileName, fileSizeKB, mimeType });

    if (!isDocxExtension && !isDocxMime) {
      log.warn("rejected: invalid file type", { fileName, mimeType });
      return NextResponse.json(
        { error: "Invalid file type. Only .docx files are accepted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      log.warn("rejected: file too large", { fileSizeKB, limitKB: MAX_FILE_SIZE_BYTES / 1024 });
      return NextResponse.json(
        { error: "File size exceeds the 5 MB limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    log.info("extracting text with mammoth");
    const extractionResult = await mammoth.extractRawText({ buffer });
    const rawCvText = extractionResult.value;
    const textLength = rawCvText?.trim().length ?? 0;

    if (!rawCvText || textLength === 0) {
      log.warn("rejected: no text extracted from document", { fileName });
      return NextResponse.json(
        { error: "Unable to extract readable text from the uploaded document." },
        { status: 422 }
      );
    }

    log.info("text extracted, sending to AI", { textLength });
    const profile = await ai.parseCv(rawCvText);

    const durationMs = Date.now() - startMs;
    log.info("upload complete", {
      durationMs,
      experienceCount: profile.experience.length,
      projectCount: profile.projects.length,
      skillCount: profile.skills.length,
      educationCount: profile.education.length,
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (err: unknown) {
    const durationMs = Date.now() - startMs;
    const errorType = err instanceof Error ? err.name : "UnknownError";
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    log.error("CV upload processing failed", { errorType, errorMessage, durationMs });

    return NextResponse.json(
      { error: "An error occurred while processing the uploaded CV." },
      { status: 500 }
    );
  }
}
