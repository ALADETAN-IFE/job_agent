"use client";

import { Preferences } from "@/lib/profile/schema";

interface PreferencesEditorProps {
  value: Preferences;
  onChange: (updated: Preferences) => void;
}

export default function PreferencesEditor({
  value,
  onChange,
}: PreferencesEditorProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold mb-3">Job Preferences</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pref-roles" className="block text-sm font-medium mb-1">
            Desired Role Types (comma-separated)
          </label>
          <input
            id="pref-roles"
            type="text"
            value={value.roleTypes.join(", ")}
            onChange={(e) =>
              onChange({
                ...value,
                roleTypes: e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Senior Full-Stack Engineer, Lead Backend Engineer"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="pref-location" className="block text-sm font-medium mb-1">
            Preferred Location
          </label>
          <input
            id="pref-location"
            type="text"
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            placeholder="Lagos, Nigeria / Remote"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="pref-remote" className="block text-sm font-medium mb-1">
            Remote Preference
          </label>
          <select
            id="pref-remote"
            value={value.remotePreference}
            onChange={(e) =>
              onChange({
                ...value,
                remotePreference: e.target.value as Preferences["remotePreference"],
              })
            }
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="remote" className="bg-black">Remote</option>
            <option value="hybrid" className="bg-black">Hybrid</option>
            <option value="onsite" className="bg-black">On-site</option>
            <option value="flexible" className="bg-black">Flexible</option>
          </select>
        </div>
      </div>
    </section>
  );
}
