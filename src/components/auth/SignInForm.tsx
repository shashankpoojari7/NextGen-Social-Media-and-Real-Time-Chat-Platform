"use client";

import { MailOpen, Github, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AuthLayout, { inputClass, primaryButtonClass } from "./AuthLayout";

const PasswordInput = ({ name }: { name: string }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        id={name}
        name={name}
        required
        placeholder="••••••••"
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
  </svg>
);

export function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const router = useRouter();

  const anyLoading = isLoadingCredentials || isLoadingGoogle || isLoadingGithub;

  // --- LOGIC UNCHANGED ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingCredentials(true);
    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      console.log(res);
      toast.error(res.error);
    } else {
      toast.success("Logged in successfully.");
      router.replace("/");
    }
    setIsLoadingCredentials(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleGithubLogin = async () => {
    setIsLoadingGithub(true);
    await signIn("github", { callbackUrl: "/" });
  };
  // --- END LOGIC ---

  return (
    <AuthLayout variant="signin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Welcome back 👋
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Log in to catch up with your feed and chats.
        </p>
      </div>

      {/* Social first, like most modern apps */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="h-11 rounded-xl border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          disabled={anyLoading}
        >
          {isLoadingGoogle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Google
        </Button>
        <Button
          onClick={handleGithubLogin}
          variant="outline"
          className="h-11 rounded-xl border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
          disabled={anyLoading}
        >
          {isLoadingGithub ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
          GitHub
        </Button>
      </div>

      <div className="my-6 flex items-center">
        <div className="grow border-t border-zinc-200 dark:border-zinc-800" />
        <span className="mx-3 text-xs uppercase tracking-wider text-zinc-400">or with email</span>
        <div className="grow border-t border-zinc-200 dark:border-zinc-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="credentials-email" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Mobile number, email or username
          </label>
          <input
            type="text"
            id="credentials-email"
            name="email"
            required
            placeholder="you@example.com"
            className={inputClass}
            disabled={isLoadingCredentials}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <PasswordInput name="password" />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}

        <Button type="submit" className={primaryButtonClass} disabled={anyLoading}>
          {isLoadingCredentials ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MailOpen className="mr-2 h-4 w-4" />
          )}
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        New to NextGen?{" "}
        <Link href="/sign-up" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}