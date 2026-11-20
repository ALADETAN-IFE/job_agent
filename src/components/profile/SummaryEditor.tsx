"use client";

interface SummaryEditorProps {
  value: string;
  onChange: (updated: string) => void;
}

export default function SummaryEditor({ value, onChange }: SummaryEditorProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-3">Professional Summary</h3>
      <label htmlFor="summary" className="sr-only">
        Professional Summary
      </label>
      <textarea
        id="summary"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a brief professional summary…"
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
      />
    </section>
  );
}
