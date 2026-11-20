"use client";

import { useCallback, useRef, useState } from "react";

interface CvUploaderProps {
  onParsed: (profile: Record<string, unknown>) => void;
}

export default function CvUploader({ onParsed }: CvUploaderProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setErrorMsg("");

      if (!file.name.toLowerCase().endsWith(".docx")) {
        setStatus("error");
        setErrorMsg("Only .docx files are accepted.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setStatus("error");
        setErrorMsg("File must be 5 MB or smaller.");
        return;
      }

      setStatus("uploading");

      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/profile/upload", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Upload failed");
        }

        const profile = await res.json();
        setStatus("idle");
        onParsed(profile);
      } catch (err: unknown) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [onParsed]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload CV"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        onChange={handleChange}
        className="hidden"
        aria-label="Choose .docx file"
      />

      {status === "uploading" ? (
        <p className="text-blue-600 dark:text-blue-400 font-medium">
          Parsing CV…
        </p>
      ) : (
        <>
          <p className="font-medium mb-1">
            Drop a <code>.docx</code> CV here or click to browse
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Max 5 MB
          </p>
        </>
      )}

      {status === "error" && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
