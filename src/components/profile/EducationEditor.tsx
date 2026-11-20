"use client";

import { EducationItem, generateStableId } from "@/lib/profile/schema";

interface EducationEditorProps {
  value: EducationItem[];
  onChange: (updated: EducationItem[]) => void;
}

export default function EducationEditor({ value, onChange }: EducationEditorProps) {
  const addItem = () => {
    onChange([
      ...value,
      {
        id: generateStableId(),
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, patch: Partial<EducationItem>) => {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Education</h3>
        <button
          type="button"
          onClick={addItem}
          className="cursor-pointer text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Add Education
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-gray-400">No education entries yet.</p>
      )}

      <div className="space-y-4">
        {value.map((item, idx) => (
          <div
            key={item.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">#{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="cursor-pointer text-xs text-red-500 hover:text-red-700 focus:outline-none"
                aria-label={`Remove education ${idx + 1}`}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`edu-inst-${idx}`} className="block text-sm font-medium mb-1">
                  Institution
                </label>
                <input
                  id={`edu-inst-${idx}`}
                  type="text"
                  value={item.institution}
                  onChange={(e) => updateItem(idx, { institution: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`edu-deg-${idx}`} className="block text-sm font-medium mb-1">
                  Degree
                </label>
                <input
                  id={`edu-deg-${idx}`}
                  type="text"
                  value={item.degree}
                  onChange={(e) => updateItem(idx, { degree: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`edu-field-${idx}`} className="block text-sm font-medium mb-1">
                  Field
                </label>
                <input
                  id={`edu-field-${idx}`}
                  type="text"
                  value={item.field}
                  onChange={(e) => updateItem(idx, { field: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor={`edu-start-${idx}`} className="block text-sm font-medium mb-1">
                    Start
                  </label>
                  <input
                    id={`edu-start-${idx}`}
                    type="text"
                    value={item.startDate}
                    placeholder="2014"
                    onChange={(e) => updateItem(idx, { startDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor={`edu-end-${idx}`} className="block text-sm font-medium mb-1">
                    End
                  </label>
                  <input
                    id={`edu-end-${idx}`}
                    type="text"
                    value={item.endDate}
                    placeholder="2018"
                    onChange={(e) => updateItem(idx, { endDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
