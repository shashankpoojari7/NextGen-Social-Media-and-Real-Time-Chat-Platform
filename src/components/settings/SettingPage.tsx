"use client";

import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Lock,
  User,
  ChevronRight,
  ChevronLeft,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosInstance } from "@/services/axios";
import { useThemeStore } from "@/store/useThemeStore";

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#97bfb4]" : "bg-zinc-300 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
        {title}
      </h2>
      <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-[#0f0f0f]">
        {children}
      </div>
    </section>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="flex min-w-0 items-center gap-4">
        <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
        <div className="min-w-0">
          <p className="text-[15px] font-medium">{label}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function LinkRow({
  icon,
  label,
  description,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
        <div className="min-w-0">
          <p className="text-[15px] font-medium">{label}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
    </Link>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const darkMode = theme === "dark";
  const [isPrivate, setIsPrivate] = useState(
    () => session?.user?.isPrivate ?? false
  );

  const togglePrivateAccount = async () => {
    const previousValue = isPrivate;
    const newValue = !previousValue;

    setIsPrivate(newValue);

    try {
      await axiosInstance.patch("/api/user/settings/privacy", { isPrivate: newValue });
      await update({});
    } catch (err) {
      console.error("Privacy update failed:", err);
      setIsPrivate(previousValue);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white p-4 text-black dark:bg-[#0a0a0a] dark:text-white md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-2">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-2 rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 md:hidden"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        </div>

        <Section title="Appearance">
          <ToggleRow
            icon={darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            label="Dark mode"
            description={darkMode ? "Using the dark theme" : "Using the light theme"}
            checked={darkMode}
            onChange={toggleTheme}
          />
        </Section>

        <Section title="Privacy">
          <ToggleRow
            icon={<Shield className="h-5 w-5" />}
            label="Private account"
            description={
              isPrivate
                ? "Only approved followers can view your posts"
                : "Your posts are visible to everyone"
            }
            checked={isPrivate}
            onChange={togglePrivateAccount}
          />
        </Section>

        <Section title="Account">
          <LinkRow
            icon={<User className="h-5 w-5" />}
            label="Edit profile"
            description="Username, name, bio and photo"
            href="/settings/update-profile"
          />
          <LinkRow
            icon={<Lock className="h-5 w-5" />}
            label="Change password"
            description="Update your account password"
            href="/settings/change-password"
          />
        </Section>
      </div>
    </div>
  );
}