"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, CircleCheck, CircleX, ChevronLeft } from "lucide-react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useDebounceValue } from "usehooks-ts";
import { toast } from "sonner";
import { axiosInstance } from "@/services/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-zinc-400 focus:border-[#97bfb4] focus:ring-2 focus:ring-[#97bfb4]/30 dark:border-zinc-800 dark:bg-[#111] dark:placeholder:text-zinc-600";

export default function UpdateProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useUserSettings();
  const queryClient = useQueryClient();
  const { update } = useSession();

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    bio: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const [debouncedUsername, setDebouncedUsername] = useDebounceValue("", 600);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isUsernameUnique, setIsUsernameUnique] = useState(true);

  useEffect(() => {
    if (!data) return;

    setFormData({
      username: data.username || "",
      fullname: data.fullname || "",
      bio: data.bio || "",
    });

    setProfileImage(data.profile_image || null);
    setDebouncedUsername(data.username);
  }, [data, setDebouncedUsername]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername) return;

      if (debouncedUsername === data?.username) {
        setUsernameMessage("");
        setIsUsernameUnique(true);
        return;
      }

      setIsCheckingUsername(true);

      try {
        const res = await fetch(`/api/user/check-unique-username/${debouncedUsername}`);
        const json = await res.json();

        setUsernameMessage(json.message);
        setIsUsernameUnique(json.success);
      } catch (error) {
        setUsernameMessage("Error checking username");
        setIsUsernameUnique(false);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsername();
  }, [debouncedUsername, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIsChanged(true);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "username") {
      setDebouncedUsername(value);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsChanged(true);

    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!isChanged) return;

    if (!isUsernameUnique) {
      toast.error("Choose a different username");
      return;
    }

    setIsSaving(true);

    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("fullname", formData.fullname);
      form.append("bio", formData.bio);
      if (imageFile) form.append("image", imageFile);

      const result = await axiosInstance.post("/api/user/update-profile", form);

      if (result.data.success) {
        await update();

        queryClient.invalidateQueries({ queryKey: ["user-settings"] });
        toast.success("Profile updated!");

        setIsChanged(false);
      } else {
        toast.error(result.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen animate-pulse p-10" />;
  }

  return (
    <div className="min-h-screen bg-white p-4 text-black dark:bg-[#0a0a0a] dark:text-white md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            aria-label="Go back"
            className="-ml-2 rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Edit profile</h1>
        </div>

        {/* Avatar row */}
        <div className="mb-8 flex items-center gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profileImage || "/no-profile.jpg"}
            alt="Profile"
            className="h-16 w-16 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-800 sm:h-20 sm:w-20"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">
              {formData.username || "username"}
            </p>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {formData.fullname}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-lg border border-zinc-300 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Change photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`${inputClass} pr-10`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingUsername ? (
                  <Loader2 className="animate-spin text-zinc-400" size={18} />
                ) : usernameMessage ? (
                  isUsernameUnique ? (
                    <CircleCheck className="text-green-500" size={18} />
                  ) : (
                    <CircleX className="text-red-500" size={18} />
                  )
                ) : null}
              </span>
            </div>
            {usernameMessage && (
              <p
                className={`mt-1.5 text-sm ${
                  isUsernameUnique ? "text-green-600" : "text-red-500"
                }`}
              >
                {usernameMessage}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="fullname" className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell people a little about yourself"
              className={`${inputClass} h-28 resize-none`}
            />
          </div>

          <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <button
              onClick={handleSubmit}
              disabled={!isChanged || isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#97bfb4] px-6 py-2.5 text-[15px] font-semibold text-zinc-900 transition-colors hover:bg-[#86aea3] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}