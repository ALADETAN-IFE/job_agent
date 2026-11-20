"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setHasProfile(data !== null && data?.contact?.name))
      .catch(() => setHasProfile(false));
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Job Application Assistant</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Upload your CV, build your profile, and generate tailored applications.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Profile card */}
        <Link
          href="/profile"
          className="cursor-pointer block border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <h2 className="text-lg font-semibold mb-1">Your Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Upload a CV or edit your profile details.
          </p>
          {hasProfile === null ? (
            <span className="text-xs text-gray-400">Loading…</span>
          ) : hasProfile ? (
            <span className="inline-block text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
              Profile saved
            </span>
          ) : (
            <span className="inline-block text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
              No profile yet
            </span>
          )}
        </Link>

        {/* New Application card */}
        <Link
          href="/apply/new"
          className="cursor-pointer block border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <h2 className="text-lg font-semibold mb-1">New Application</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Paste a job description to get a tailored CV and cover letter.
          </p>
          <span className="inline-block text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
            Phase 1
          </span>
        </Link>
      </div>
    </main>
  );
}
