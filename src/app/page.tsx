"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface RecentApplication {
  id: string;
  title: string;
  company: string;
  date: string;
}

export default function DashboardPage() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [applications, setApplications] = useState<RecentApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(true);

  useEffect(() => {
    // Check profile status
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setHasProfile(Boolean(data && data?.contact?.name)))
      .catch(() => setHasProfile(false));

    // Fetch recent applications
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setApplications(data);
        }
      })
      .catch(() => setApplications([]))
      .finally(() => setLoadingApps(false));
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Tailor applications and manage your professional profile.
        </p>
      </div>

      {/* Top Cards: Action & Profile Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* New Application Action Card */}
        <div className="p-6 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              New Application
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Paste a job description to analyze matches, tailor your CV, and generate a cover letter.
            </p>
          </div>
          <div className="mt-5">
            <Link
              href="/apply/new"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors cursor-pointer"
            >
              Start New Application
            </Link>
          </div>
        </div>

        {/* Profile Status Card */}
        <div className="p-6 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Profile Status
              </h2>
              {hasProfile === null ? (
                <span className="text-xs text-gray-400">Checking…</span>
              ) : hasProfile ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300">
                  Profile Uploaded
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  No Profile Uploaded
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {hasProfile
                ? "Your source profile is saved and ready for tailoring."
                : "Upload your DOCX CV to parse your experience, projects, and skills."}
            </p>
          </div>
          <div className="mt-5">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            >
              {hasProfile ? "View & Edit Profile" : "Upload CV Now"}
            </Link>
          </div>
        </div>
      </div>

      {/* Saved Applications Section (plain list, not a tracker) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Recent Applications
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your saved tailored applications.
          </p>
        </div>

        {loadingApps ? (
          <div className="p-6 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-gray-500 dark:text-gray-400">
            Loading recent applications…
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-gray-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              No saved applications yet
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start by pasting a job description to generate a tailored CV and cover letter.
            </p>
            <div className="mt-4">
              <Link
                href="/apply/new"
                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create your first application &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/apply/${app.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors focus:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-neutral-800/60"
              >
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {app.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {app.company}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center justify-between sm:justify-end gap-3 text-xs text-gray-400 shrink-0">
                  <time dateTime={app.date}>{formatDate(app.date)}</time>
                  <span
                    className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
                    aria-hidden="true"
                  >
                    &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
