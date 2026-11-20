"use client";

import { useState } from "react";

interface SkillEditorProps {
  value: string[];
  onChange: (updated: string[]) => void;
}

export default function SkillEditor({ value, onChange }: SkillEditorProps) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeSkill = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-3">Skills</h3>

      <div className="flex flex-wrap gap-2 mb-3">
        {value.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-2.5 py-1 rounded-full"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(i)}
              className="cursor-pointer ml-0.5 hover:text-red-500 focus:outline-none"
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-sm text-gray-400">No skills added yet.</span>
        )}
      </div>

      <div className="flex gap-2">
        <label htmlFor="add-skill" className="sr-only">
          Add a skill
        </label>
        <input
          id="add-skill"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Type a skill and press Enter"
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={addSkill}
          className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          Add
        </button>
      </div>
    </section>
  );
}
