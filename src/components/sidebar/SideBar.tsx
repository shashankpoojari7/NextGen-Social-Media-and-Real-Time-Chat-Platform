"use client";

import {
  Bell,
  HomeIcon,
  Loader2,
  LogOut,
  MessageCircle,
  PlusCircle,
  Search,
  Settings,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/useNotificationStore";
import NotificationRightDrawer from "../notification/NotificationDrawer";
import { useDrawerStore } from "@/store/useDrawerStore";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function SideBar() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const notificationCount = useNotificationStore((s) => s.notificationCount);
  const messageCount = useNotificationStore((s) => s.messageCount);

  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { isNotificationDrawerOpen, toggle } = useDrawerStore();

  const collapsed = isNotificationDrawerOpen;
  const labelClass = collapsed ? "hidden" : "hidden lg:block";
  const rowAlign = collapsed ? "justify-center" : "justify-center lg:justify-start";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "/feed" : pathname.startsWith(href);

  const itemClass = (active = false) =>
    `flex w-full cursor-pointer items-center rounded-lg px-3 py-3 transition-colors duration-150 ${
      active
        ? "bg-zinc-100 font-bold text-black dark:bg-zinc-900 dark:text-white"
        : "font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
    }`;

  const iconClass = (active = false) =>
    `h-6 w-6 shrink-0 ${active ? "stroke-[2.5]" : ""}`;

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/sign-in" });
      toast.success("You have been logged out.");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
        setIsFormSubmitting(false);
        queryClient.invalidateQueries({ queryKey: ["user-profile-posts"] });
        queryClient.invalidateQueries({ queryKey: ["public-posts"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{message?: string}>;
      setIsFormSubmitting(false);
      toast.error(
        axiosError.response?.data?.message || "Upload failed"
      );
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/search", label: "Search", icon: Search },
    { href: "/connect", label: "Connect", icon: UserPlus },
  ];

  const profileActive = isActive("/profile");

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 z-50 hidden h-screen md:block
          border-r border-zinc-200 bg-white px-3 py-2 text-black
          dark:border-zinc-900 dark:bg-[#0a0a0a] dark:text-white
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-20 lg:w-60"}
        `}
      >
        <div className="flex h-full w-full flex-col justify-between">
          {/* TOP */}
          <div className="flex flex-col">
            <Link
              href="/feed"
              className={`flex h-24 w-full items-center ${
                collapsed ? "justify-center" : "justify-center lg:justify-start lg:pl-3"
              }`}
            >
              <h2
                className={`curly-heading text-2xl font-bold text-black dark:text-white ${labelClass}`}
              >
                NextGen
              </h2>
              <Image
                src="/nextgen.png"
                alt="nextgen"
                width={40}
                height={40}
                className={collapsed ? "block" : "block lg:hidden"}
              />
            </Link>

            <div className="flex flex-col space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href} className={itemClass(active)}>
                    <div className={`flex w-full items-center gap-4 ${rowAlign}`}>
                      <Icon className={iconClass(active)} />
                      <span className={`text-[16px] ${labelClass}`}>{label}</span>
                    </div>
                  </Link>
                );
              })}

              <Link href="/messages" className={itemClass(isActive("/messages"))}>
                <div className={`flex w-full items-center gap-4 ${rowAlign}`}>
                  <div className="relative">
                    <MessageCircle className={iconClass(isActive("/messages"))} />
                    <Badge count={messageCount} />
                  </div>
                  <span className={`text-[16px] ${labelClass}`}>Messages</span>
                </div>
              </Link>

              <div className={itemClass(isNotificationDrawerOpen)} onClick={toggle}>
                <div className={`flex w-full items-center gap-4 ${rowAlign}`}>
                  <div className="relative">
                    <Bell className={iconClass(isNotificationDrawerOpen)} />
                    <Badge count={notificationCount} />
                  </div>
                  <span className={`text-[16px] ${labelClass}`}>Notifications</span>
                </div>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <div className={itemClass(false)}>
                    <div className={`flex w-full items-center gap-4 ${rowAlign}`}>
                      <PlusCircle className={iconClass(false)} />
                      <span className={`text-[16px] ${labelClass}`}>Add post</span>
                    </div>
                  </div>
                </DialogTrigger>

                <DialogContent
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  className="rounded-xl border border-gray-200 bg-white text-black shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-white sm:max-w-[600px]"
                >
                  <DialogHeader>
                    <DialogTitle className="text-center text-lg font-semibold">
                      Create a New Post
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-600">
                      {preview ? (
                        <>
                          <Image
                            src={preview}
                            alt="Preview"
                            width={500}
                            height={250}
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
                            id="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="file"
                            className="flex cursor-pointer flex-col items-center text-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            <PlusCircle className="mb-2 h-10 w-10 text-gray-400 dark:text-gray-500" />
                            <span>Click to upload image</span>
                          </label>
                        </>
                      )}
                    </div>

                    <div>
                      <label htmlFor="caption" className="mb-1 block text-sm font-medium">
                        Caption
                      </label>
                      <textarea
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-[#97bfb4] dark:border-gray-600"
                        placeholder="Write a caption..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="mb-1 block text-sm font-medium">
                        Location
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-[#97bfb4] dark:border-gray-600"
                        placeholder="e.g. Bangalore"
                      />
                    </div>

                    <DialogFooter className="mt-3 flex w-full items-center space-x-2">
                      <DialogClose asChild>
                        <Button variant="outline" className="px-9 py-4">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        className="flex w-20 items-center justify-center bg-[#97bfb4] py-5 text-white hover:bg-[#86aea3] dark:text-black"
                        disabled={isFormSubmitting}
                      >
                        {isFormSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Post"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Link
                href={`/profile/${session?.user?.username}`}
                className={itemClass(profileActive)}
              >
                <div className={`flex w-full items-center gap-4 ${rowAlign}`}>
                  <Image
                    src={session?.user?.image || "/no-profile.jpg"}
                    alt="profile"
                    width={24}
                    height={24}
                    className={`h-6 w-6 shrink-0 rounded-full object-cover ${
                      profileActive
                        ? "ring-2 ring-black dark:ring-white"
                        : "border border-zinc-300 dark:border-zinc-700"
                    }`}
                  />
                  <span className={`text-[16px] ${labelClass}`}>Profile</span>
                </div>
              </Link>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="mb-3 flex flex-col space-y-1">
            <Link href="/settings" className={itemClass(isActive("/settings"))}>
              <div className={`flex w-full items-center gap-4 ${rowAlign}`}>
                <Settings className={iconClass(isActive("/settings"))} />
                <span className={`text-[16px] ${labelClass}`}>Settings</span>
              </div>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="flex w-full cursor-pointer items-center rounded-lg px-3 py-3 font-medium text-[#b94c4c] transition-colors duration-150 hover:bg-[#fdecec] dark:text-[#ff7b7b] dark:hover:bg-[#2b1f1f]">
                  <div className={`flex w-full items-center gap-4 ${rowAlign}`}>
                    <LogOut className="h-6 w-6 shrink-0" />
                    <span className={`text-[16px] ${labelClass}`}>Logout</span>
                  </div>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-lg border border-gray-300 bg-white text-black shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-semibold text-red-600">
                    Confirm Logout
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to log out? You&apos;ll need to sign in again to access
                    your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-neutral-800">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="rounded-md bg-[#bf4a4a] px-4 py-2 font-medium text-white hover:bg-[#a13c3c]"
                  >
                    Yes, Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </nav>

      {isNotificationDrawerOpen && <NotificationRightDrawer />}
    </>
  );
}

export default SideBar;