"use client";

import { ContactInfo } from "@/lib/profile/schema";

interface ContactEditorProps {
  value: ContactInfo;
  onChange: (updated: ContactInfo) => void;
  errors?: Partial<Record<keyof ContactInfo, string>>;
}

export default function ContactEditor({
  value,
  onChange,
  errors = {},
}: ContactEditorProps) {
  const field = (
    label: string,
    key: keyof ContactInfo,
    type = "text",
    placeholder = "",
    required = false
  ) => {
    const error = errors[key];
    return (
      <div>
        <label
          className="block text-sm font-medium mb-1"
          htmlFor={`contact-${key}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={`contact-${key}`}
          type={type}
          required={required}
          value={value[key] ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          className={`w-full border rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 ${
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
          }`}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Full Name", "name", "text", "Jane Doe", true)}
        {field("Email", "email", "email", "jane@example.com", true)}
        {field("Phone", "phone", "tel", "+234 802 000 0000")}
        {field("Location", "location", "text", "Lagos, Nigeria")}
        {field("GitHub", "github", "url", "https://github.com/username")}
        {field("LinkedIn", "linkedin", "url", "https://linkedin.com/in/username")}
        {field("Portfolio", "portfolio", "url", "https://yoursite.com")}
      </div>
    </section>
  );
}
