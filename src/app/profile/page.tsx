"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Profile } from "@/lib/profile/schema";
import CvUploader from "@/components/profile/CvUploader";
import ContactEditor from "@/components/profile/ContactEditor";
import SummaryEditor from "@/components/profile/SummaryEditor";
import SkillEditor from "@/components/profile/SkillEditor";
import ExperienceEditor from "@/components/profile/ExperienceEditor";
import ProjectEditor from "@/components/profile/ProjectEditor";
import EducationEditor from "@/components/profile/EducationEditor";
import PreferencesEditor from "@/components/profile/PreferencesEditor";

const emptyProfile: Profile = {
  contact: {
    name: "",
    email: "",
    phone: "",
    location: "",
    github: "",
    linkedin: "",
    portfolio: "",
  },
  summary: "",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  preferences: {
    roleTypes: [],
    location: "",
    remotePreference: "flexible",
  },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; msg: string } | null>(
    null
  );
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  // Load saved profile on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.contact && data.contact.name) {
          setProfile(data as Profile);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handleParsed = useCallback((parsed: Record<string, unknown>) => {
    setFlash(null);
    setProfile(parsed as unknown as Profile);
    setContactErrors({});
    setFlash({ type: "success", msg: "CV parsed! Review the fields below and save." });
  }, []);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    const name = profile.contact.name?.trim() || "";
    const email = profile.contact.email?.trim() || "";

    if (!name) {
      errors.name = "Full name is required.";
    }

    if (!email) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    setContactErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFlash({
        type: "error",
        msg: "Please correct the required fields highlighted in red before saving.",
      });
      return false;
    }

    return true;
  };

  const sanitizeProfile = (raw: Profile): Profile => {
    return {
      ...raw,
      contact: {
        ...raw.contact,
        name: raw.contact.name.trim(),
        email: raw.contact.email.trim(),
      },
      // Remove any completely blank items that user might have added and left untouched
      experience: raw.experience
        .filter((exp) => exp.company.trim() || exp.role.trim())
        .map((exp) => ({
          ...exp,
          company: exp.company.trim(),
          role: exp.role.trim(),
          startDate: exp.startDate.trim() || "Present",
          bullets: exp.bullets.filter((b) => b.text.trim().length > 0),
        })),
      projects: raw.projects
        .filter((proj) => proj.name.trim())
        .map((proj) => ({
          ...proj,
          name: proj.name.trim(),
          bullets: proj.bullets.filter((b) => b.text.trim().length > 0),
        })),
      education: raw.education
        .filter((edu) => edu.institution.trim() || edu.degree.trim())
        .map((edu) => ({
          ...edu,
          institution: edu.institution.trim(),
          degree: edu.degree.trim(),
        })),
    };
  };

  const save = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    setFlash(null);
    try {
      const cleanProfile = sanitizeProfile(profile);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanProfile),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Save failed");
      }

      const saved = await res.json();
      setProfile(emptyProfile);
      setContactErrors({});
      setFlash({ type: "success", msg: "Profile saved successfully!" });
    } catch (err: unknown) {
      setFlash({
        type: "error",
        msg: err instanceof Error ? err.message : "Failed to save profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-gray-500">Loading profile…</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/"
            className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 mb-1 inline-block focus:outline-none"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Your Profile</h1>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="cursor-pointer px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </div>

      {flash && (
        <div
          role="alert"
          className={`mb-6 px-4 py-3 rounded text-sm ${
            flash.type === "success"
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
          }`}
        >
          {flash.msg}
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Upload CV</h2>
        <CvUploader onParsed={handleParsed} />
      </div>

      {/* Editor Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-8"
        noValidate
      >
        <ContactEditor
          value={profile.contact}
          onChange={(contact) => {
            setProfile({ ...profile, contact });
            if (contactErrors.name && contact.name.trim()) {
              setContactErrors((prev) => ({ ...prev, name: "" }));
            }
            if (contactErrors.email && contact.email.trim()) {
              setContactErrors((prev) => ({ ...prev, email: "" }));
            }
          }}
          errors={contactErrors}
        />

        <hr className="border-gray-200 dark:border-gray-700" />

        <SummaryEditor
          value={profile.summary}
          onChange={(summary) => setProfile({ ...profile, summary })}
        />

        <hr className="border-gray-200 dark:border-gray-700" />

        <SkillEditor
          value={profile.skills}
          onChange={(skills) => setProfile({ ...profile, skills })}
        />

        <hr className="border-gray-200 dark:border-gray-700" />

        <ExperienceEditor
          value={profile.experience}
          onChange={(experience) => setProfile({ ...profile, experience })}
        />

        <hr className="border-gray-200 dark:border-gray-700" />

        <ProjectEditor
          value={profile.projects}
          onChange={(projects) => setProfile({ ...profile, projects })}
        />

        <hr className="border-gray-200 dark:border-gray-700" />

        <EducationEditor
          value={profile.education}
          onChange={(education) => setProfile({ ...profile, education })}
        />

        <hr className="border-gray-200 dark:border-gray-700" />

        <PreferencesEditor
          value={profile.preferences}
          onChange={(preferences) => setProfile({ ...profile, preferences })}
        />

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </form>
    </main>
  );
}
