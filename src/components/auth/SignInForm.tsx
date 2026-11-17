"use client";

import { MailOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AuthLayout, { inputClass, primaryButtonClass } from "./AuthLayout";
import { GoogleIcon, GithubIcon } from "./SocialIcons";

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
      router.replace("/feed");
    }
    setIsLoadingCredentials(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/feed" });
  };

  const handleGithubLogin = async () => {
    setIsLoadingGithub(true);
    await signIn("github", { callbackUrl: "/feed" });
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
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="h-12 w-full justify-center gap-3 rounded-xl border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
          disabled={anyLoading}
        >
          {isLoadingGoogle ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </Button>

        <Button
          onClick={handleGithubLogin}
          variant="outline"
          className="h-12 w-full justify-center gap-3 rounded-xl border-zinc-200 bg-white text-[15px] font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
          disabled={anyLoading}
        >
          {isLoadingGithub ? <Loader2 className="h-5 w-5 animate-spin" /> : <GithubIcon />}
          Continue with GitHub
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