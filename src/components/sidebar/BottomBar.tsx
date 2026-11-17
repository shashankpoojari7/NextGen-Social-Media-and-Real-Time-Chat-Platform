"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MessageCircle,
  PlusCircle,
  Plus,
  Loader2,
  UserPlus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/useNotificationStore";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function BottomBar() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const messageCount = useNotificationStore((s) => s.messageCount);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "/feed" : pathname.startsWith(href);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile || !caption.trim()) {
      toast.error("Please add an image and caption.");
      return;
    }

    setIsFormSubmitting(true);

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("location", location);
    formData.append("image", imageFile);

    try {
      const response = await axios.post("/api/posts/create-post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success(response.data.message);

        setPreview(null);
        setImageFile(null);
        setCaption("");
        setLocation("");
        setOpen(false);

        queryClient.invalidateQueries({ queryKey: ["user-profile-posts"] });
        queryClient.invalidateQueries({ queryKey: ["public-posts"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || "Upload failed"
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };


  const tabClass = (active: boolean) =>
    `relative flex h-12 flex-1 flex-col items-center justify-center gap-1 transition-colors ${
      active
        ? "text-black dark:text-white"
        : "text-zinc-500 hover:text-black dark:text-zinc-500 dark:hover:text-white"
    }`;

  const iconClass = (active: boolean) => `h-6 w-6 ${active ? "stroke-[2.5]" : ""}`;

  const Dot = ({ active }: { active: boolean }) => (
    <span
      className={`h-1 w-1 rounded-full ${
        active ? "bg-black dark:bg-white" : "bg-transparent"
      }`}
    />
  );

  const profileActive = isActive("/profile");

  return (
    <div
      className="fixed bottom-0 left-0 z-50 w-full border-t border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-900 dark:bg-[#0a0a0a]/90 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <nav className="mx-auto flex max-w-md items-center px-2 pt-1.5">
        <Link href="/" aria-label="Home" className={tabClass(isActive("/"))}>
          <HomeIcon className={iconClass(isActive("/"))} />
          <Dot active={isActive("/")} />
        </Link>

        <Link href="/connect" aria-label="Connect" className={tabClass(isActive("/connect"))}>
          <UserPlus className={iconClass(isActive("/connect"))} />
          <Dot active={isActive("/connect")} />
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="Create post"
                className="mb-1 flex h-10 w-12 items-center justify-center rounded-xl bg-[#97bfb4] text-zinc-900 transition-colors hover:bg-[#86aea3] active:scale-95"
              >
                <Plus className="h-6 w-6 stroke-[2.5]" />
              </button>
            </DialogTrigger>

            <DialogContent
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="rounded-xl bg-white text-black dark:bg-neutral-900 dark:text-white"
            >
              <DialogHeader>
                <DialogTitle className="text-center">Create a New Post</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-600">
                  {preview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-[250px] w-full rounded-md object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3"
                        onClick={() => {
                          setPreview(null);
                          setImageFile(null);
                        }}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="mobile-file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="mobile-file"
                        className="flex cursor-pointer flex-col items-center text-gray-500 dark:text-gray-400"
                      >
                        <PlusCircle className="mb-2 h-10 w-10" />
                        <span>Tap to upload image</span>
                      </label>
                    </>
                  )}
                </div>

                <div>
                  <label htmlFor="m-caption" className="mb-1 block text-sm font-medium">
                    Caption
                  </label>
                  <textarea
                    id="m-caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 bg-transparent p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#97bfb4] dark:border-gray-600"
                    placeholder="Write a caption..."
                  />
                </div>

                <div>
                  <label htmlFor="m-location" className="mb-1 block text-sm font-medium">
                    Location
                  </label>
                  <input
                    id="m-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-transparent p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#97bfb4] dark:border-gray-600"
                    placeholder="e.g. Bangalore"
                  />
                </div>

                <DialogFooter className="flex justify-between">
                  <DialogClose asChild>
                    <Button variant="outline" className="px-6">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    type="submit"
                    disabled={isFormSubmitting}
                    className="bg-[#97bfb4] text-white hover:bg-[#86aea3] dark:text-black"
                  >
                    {isFormSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Post"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Link href="/messages" aria-label="Messages" className={tabClass(isActive("/messages"))}>
          <div className="relative">
            <MessageCircle className={iconClass(isActive("/messages"))} />
            <Badge count={messageCount} />
          </div>
          <Dot active={isActive("/messages")} />
        </Link>

        <Link
          href={`/profile/${session?.user?.username}`}
          aria-label="Profile"
          className={tabClass(profileActive)}
        >
          <Image
            src={session?.user?.image || "/no-profile.jpg"}
            alt="Profile"
            width={26}
            height={26}
            className={`h-[26px] w-[26px] rounded-full object-cover ${
              profileActive
                ? "ring-2 ring-black dark:ring-white"
                : "border border-zinc-300 dark:border-zinc-700"
            }`}
          />
          <Dot active={profileActive} />
        </Link>
      </nav>
    </div>
  );
}