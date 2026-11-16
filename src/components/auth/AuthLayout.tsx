import Link from "next/link";
import {
  Bell,
  Heart,
  MessageCircle,
  Radio,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { ReactNode } from "react";
import Image from "next/image";

const HERO_IMAGE = "hero.png";
const POST_IMAGE = "post.png";

export const inputClass =
  "h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500";

export const primaryButtonClass =
  "h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/40 disabled:opacity-60";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-1.5">
      <Image
        src="/nextgen.png"
        alt="nextgen"
        width={45}
        height={45}
      />
      <span
        className={`text-2xl font-bold tracking-tight ${
          light ? "text-white" : "text-zinc-900 dark:text-white"
        }`}
      >
        NextGen
      </span>
    </Link>
  );
}

function Showcase({ variant }: { variant: "signin" | "signup" }) {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
      {/* background image + colour wash */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-linear-to-br from-violet-700/70 via-fuchsia-700/40 to-cyan-600/40" />
      <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative z-10">
        <Logo light />
      </div>

      <div className="relative z-10 mx-auto h-[400px] w-full max-w-md">
        <div className="absolute left-0 top-0 w-64 rotate-[-4deg] rounded-2xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-amber-400 to-pink-500" />
            <div className="text-sm font-semibold">aarav.dev</div>
          </div>
          <div
            className="h-40 rounded-xl bg-linear-to-br from-cyan-400/60 to-violet-500/60 bg-cover bg-center"
            style={{ backgroundImage: `url(${POST_IMAGE})` }}
          />
          <div className="mt-3 flex items-center gap-3 text-sm text-white/90">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 fill-pink-500 text-pink-500" /> 2.4k
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> 128
            </span>
            <Send className="ml-auto h-4 w-4" />
          </div>
        </div>

        {/* chat card */}
        <div className="absolute right-0 top-24 w-60 rotate-3 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-linear-to-br from-emerald-400 to-cyan-500" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-zinc-900 bg-emerald-400" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Riya</div>
              <div className="text-[11px] text-emerald-300">Online now</div>
            </div>
          </div>
          <div className="mb-2 w-fit rounded-2xl rounded-bl-sm bg-white/15 px-3 py-2 text-sm">
            Did you see my new post? 👀
          </div>
          <div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-linear-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-sm">
            Loved it! Sending you a reel
          </div>
          <div className="mt-2 flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-white/15 px-3 py-2.5">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </div>
        </div>

        {/* notification pill */}
        <div className="absolute bottom-6 left-10 flex items-center gap-3 rounded-full border border-white/15 bg-white/10 py-2 pl-2 pr-5 shadow-2xl backdrop-blur-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-orange-400">
            <Bell className="h-4 w-4" />
          </span>
          <div className="text-sm leading-tight">
            <span className="font-semibold">Kabir</span> started following you
          </div>
        </div>
      </div>

      {/* bottom: headline + feature chips */}
      <div className="relative z-10 space-y-5">
        <h2 className="text-4xl font-bold leading-tight tracking-tight">
          {variant === "signin" ? (
            <>
              Your people are{" "}
              <span className="bg-linear-to-r from-pink-400 to-cyan-300 bg-clip-text text-transparent">
                waiting.
              </span>
            </>
          ) : (
            <>
              Share it. Chat about it.{" "}
              <span className="bg-linear-to-r from-pink-400 to-cyan-300 bg-clip-text text-transparent">
                Live it.
              </span>
            </>
          )}
        </h2>
        <p className="max-w-md text-white/70">
          Post moments, follow friends and talk in real time, all in one place.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: Radio, label: "Real-time chat" },
            { icon: Heart, label: "Likes & comments" },
            { icon: Bell, label: "Instant notifications" },
            { icon: Sparkles, label: "Infinite feed" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs backdrop-blur"
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function AuthLayout({
  variant,
  children,
}: {
  variant: "signin" | "signup";
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-white dark:bg-zinc-950 lg:grid-cols-2">
      <Showcase variant={variant} />

      <main className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          {/* logo only on mobile, since the panel is hidden */}
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}