"use client";

import { ProjectItem, ExperienceBullet, generateStableId } from "@/lib/profile/schema";

interface ProjectEditorProps {
  value: ProjectItem[];
  onChange: (updated: ProjectItem[]) => void;
}

export default function ProjectEditor({ value, onChange }: ProjectEditorProps) {
  const addItem = () => {
    onChange([
      ...value,
      {
        id: generateStableId(),
        name: "",
        description: "",
        role: "",
        technologies: [],
        link: "",
        bullets: [],
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, patch: Partial<ProjectItem>) => {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addBullet = (itemIndex: number) => {
    const item = value[itemIndex];
    updateItem(itemIndex, {
      bullets: [...item.bullets, { id: generateStableId(), text: "" }],
    });
  };

  const updateBullet = (itemIndex: number, bulletIndex: number, text: string) => {
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
        <h3 className="text-lg font-semibold">Projects</h3>
        <button
          type="button"
          onClick={addItem}
          className="cursor-pointer text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Add Project
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-gray-400">No projects yet.</p>
      )}

      <div className="space-y-6">
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
                aria-label={`Remove project ${idx + 1}`}
              >
                Remove
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 mb-3">
              <div>
                <label htmlFor={`proj-name-${idx}`} className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  id={`proj-name-${idx}`}
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(idx, { name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`proj-role-${idx}`} className="block text-sm font-medium mb-1">
                  Role
                </label>
                <input
                  id={`proj-role-${idx}`}
                  type="text"
                  value={item.role}
                  onChange={(e) => updateItem(idx, { role: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`proj-desc-${idx}`} className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id={`proj-desc-${idx}`}
                  rows={2}
                  value={item.description}
                  onChange={(e) => updateItem(idx, { description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>
              <div>
                <label htmlFor={`proj-tech-${idx}`} className="block text-sm font-medium mb-1">
                  Technologies (comma-separated)
                </label>
                <input
                  id={`proj-tech-${idx}`}
                  type="text"
                  value={item.technologies.join(", ")}
                  onChange={(e) =>
                    updateItem(idx, {
                      technologies: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`proj-link-${idx}`} className="block text-sm font-medium mb-1">
                  Link
                </label>
                <input
                  id={`proj-link-${idx}`}
                  type="url"
                  value={item.link}
                  onChange={(e) => updateItem(idx, { link: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    <label htmlFor={`proj-${idx}-bullet-${bi}`} className="sr-only">
                      Bullet {bi + 1}
                    </label>
                    <input
                      id={`proj-${idx}-bullet-${bi}`}
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
