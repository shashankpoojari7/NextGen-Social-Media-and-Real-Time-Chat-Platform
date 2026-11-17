"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/services/axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AxiosError } from "axios";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormSchema = z.infer<typeof passwordSchema>;

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 pr-11 text-[15px] outline-none transition-colors placeholder:text-zinc-400 focus:border-[#97bfb4] focus:ring-2 focus:ring-[#97bfb4]/30 dark:border-zinc-800 dark:bg-[#111] dark:placeholder:text-zinc-600";

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={inputClass} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

export default function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<PasswordFormSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: PasswordFormSchema) => {
    setIsSubmitting(true);

    try {
      const payload = {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      const res = await axiosInstance.patch(
        "/api/user/settings/change-password",
        payload
      );

      if (res.data.success) {
        toast.success("Password changed successfully!");
        form.reset();
      } else {
        toast.error(res.data.message || "Password update failed.");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{message?: string}>;
      toast.error(
        axiosError?.response?.data?.message || "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 text-black dark:bg-[#0a0a0a] dark:text-white md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-2 rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Change password</h1>
        </div>
        <p className="mb-8 ml-9 text-sm text-zinc-500 dark:text-zinc-400">
          Use at least 8 characters with upper and lower case letters, a number and a symbol.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Current password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} placeholder="Enter current password" />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">New password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} placeholder="Enter new password" />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} placeholder="Re-enter new password" />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <button
                type="submit"
                disabled={!form.formState.isValid || isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#97bfb4] px-6 py-2.5 text-[15px] font-semibold text-zinc-900 transition-colors hover:bg-[#86aea3] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}