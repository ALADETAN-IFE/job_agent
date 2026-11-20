"use client";

import { ExperienceItem, ExperienceBullet, generateStableId } from "@/lib/profile/schema";

interface ExperienceEditorProps {
  value: ExperienceItem[];
  onChange: (updated: ExperienceItem[]) => void;
}

export default function ExperienceEditor({
  value,
  onChange,
}: ExperienceEditorProps) {
  const addItem = () => {
    onChange([
      ...value,
      {
        id: generateStableId(),
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "Present",
        current: false,
        bullets: [],
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, patch: Partial<ExperienceItem>) => {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addBullet = (itemIndex: number) => {
    const item = value[itemIndex];
    updateItem(itemIndex, {
      bullets: [...item.bullets, { id: generateStableId(), text: "" }],
    });
  };

  const updateBullet = (
    itemIndex: number,
    bulletIndex: number,
    text: string
  ) => {
    const item = value[itemIndex];
    const updated: ExperienceBullet[] = item.bullets.map((b, bi) =>
      bi === bulletIndex ? { ...b, text } : b
    );
    updateItem(itemIndex, { bullets: updated });
  };

  const removeBullet = (itemIndex: number, bulletIndex: number) => {
    const item = value[itemIndex];
    updateItem(itemIndex, {
      bullets: item.bullets.filter((_, bi) => bi !== bulletIndex),
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        <button
          type="button"
          onClick={addItem}
          className="cursor-pointer text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Add Experience
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-gray-400">No experience entries yet.</p>
      )}

      <div className="space-y-6">
        {value.map((item, idx) => (
          <div
            key={item.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="cursor-pointer text-xs text-red-500 hover:text-red-700 focus:outline-none"
                aria-label={`Remove experience ${idx + 1}`}
              >
                Remove
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mb-3">
              <div>
                <label htmlFor={`exp-company-${idx}`} className="block text-sm font-medium mb-1">
                  Company
                </label>
                <input
                  id={`exp-company-${idx}`}
                  type="text"
                  value={item.company}
                  onChange={(e) => updateItem(idx, { company: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`exp-role-${idx}`} className="block text-sm font-medium mb-1">
                  Role
                </label>
                <input
                  id={`exp-role-${idx}`}
                  type="text"
                  value={item.role}
                  onChange={(e) => updateItem(idx, { role: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`exp-loc-${idx}`} className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  id={`exp-loc-${idx}`}
                  type="text"
                  value={item.location}
                  onChange={(e) => updateItem(idx, { location: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor={`exp-start-${idx}`} className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    id={`exp-start-${idx}`}
                    type="text"
                    value={item.startDate}
                    placeholder="Jan 2022"
                    onChange={(e) => updateItem(idx, { startDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor={`exp-end-${idx}`} className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    id={`exp-end-${idx}`}
                    type="text"
                    value={item.endDate}
                    placeholder="Present"
                    onChange={(e) => updateItem(idx, { endDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bullets */}
            <div className="ml-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Bullet Points</span>
                <button
                  type="button"
                  onClick={() => addBullet(idx)}
                  className="cursor-pointer text-xs text-blue-600 hover:text-blue-700 focus:outline-none"
                >
                  + Add Bullet
                </button>
              </div>
              {item.bullets.length === 0 && (
                <p className="text-xs text-gray-400">No bullets yet.</p>
              )}
              <div className="space-y-2">
                {item.bullets.map((bullet, bi) => (
                  <div key={bullet.id} className="flex gap-2">
                    <span className="text-gray-400 mt-2">•</span>
                    <label htmlFor={`exp-${idx}-bullet-${bi}`} className="sr-only">
                      Bullet {bi + 1}
                    </label>
                    <input
                      id={`exp-${idx}-bullet-${bi}`}
                      type="text"
                      value={bullet.text}
                      onChange={(e) => updateBullet(idx, bi, e.target.value)}
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(idx, bi)}
                      className="cursor-pointer text-xs text-red-500 hover:text-red-700 self-center focus:outline-none"
                      aria-label={`Remove bullet ${bi + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
