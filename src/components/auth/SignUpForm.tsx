"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signUpSchema } from "@/schemas/signUpSchemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CircleCheck, CircleX, Eye, EyeOff, Loader2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/lib/ApiResponse";
import { useRouter } from "next/navigation";
import { useDebounceValue } from "usehooks-ts";
import Link from "next/link";
import { toast } from "sonner";
import AuthLayout, { inputClass, primaryButtonClass } from "./AuthLayout";

type SignUpFormData = z.infer<typeof signUpSchema>;

const labelClass = "text-zinc-700 dark:text-zinc-300";

export default function SignUpForm() {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [debouncedValue, setValue] = useDebounceValue("", 500);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [uniqueUsername, setUniqueUsername] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState(false);
  const [togglePassword, setTogglePassword] = useState(false);

  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      identifier: "",
      password: "",
      username: "",
      fullname: "",
      dob: "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "username") {
        setValue(value.username || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setValue]);

  useEffect(() => {
    async function checkUsernameUnique(val: string) {
      if (debouncedValue) {
        setIsCheckingUsername(true);
        try {
          const response = await fetch(
            `/api/user/check-unique-username/${debouncedValue}`
          );
          const data = await response.json();

          if (response.ok && data.success) {
            setUserMessage(data.message);
            setUniqueUsername(true);
          } else {
            setUserMessage(data.message || "Username is not valid or taken.");
            setUniqueUsername(false);
          }
        } catch (error) {
          console.error("Error during username check:", error);
          setUserMessage("Error checking username");
          setUniqueUsername(false);
        } finally {
          setIsCheckingUsername(false);
        }
      } else if (!debouncedValue) {
        setUserMessage("");
        setUniqueUsername(false);
      }
    }
    checkUsernameUnique(debouncedValue);
  }, [debouncedValue]);

  async function onSubmit(data: SignUpFormData) {
    if (!uniqueUsername) {
      toast.error("Please choose a valid username");
      return;
    }

    setIsFormSubmitting(true);

    try {
      const response = await axios.post<ApiResponse>("/api/auth/sign-up", data);

      if (response.data.success) {
        toast.success(response?.data?.message || "User registered Successfully");
        router.push("/sign-in");
      } else {
        toast.error(response?.data?.message || "Registration failed.");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "An unknown error occurred during sign-up.";
      toast.error(errorMessage);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  return (
    <AuthLayout variant="signup">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Join NextGen ✨
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Create your account and start sharing with friends.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* EMAIL */}
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    className={inputClass}
                    disabled={isFormSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PASSWORD */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={togglePassword ? "text" : "password"}
                      placeholder="Create a password"
                      className={`${inputClass} pr-12`}
                      disabled={isFormSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setTogglePassword(!togglePassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
                    aria-label={togglePassword ? "Hide password" : "Show password"}
                  >
                    {togglePassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* USERNAME */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Username</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="pick a unique username"
                      className={`${inputClass} pr-12`}
                      {...field}
                      onFocus={() => setUsernameMsg(true)}
                      onBlur={() => setUsernameMsg(false)}
                    />
                  </FormControl>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isCheckingUsername ? (
                      <Loader2 className="animate-spin text-violet-500" size={18} />
                    ) : userMessage ? (
                      uniqueUsername ? (
                        <CircleCheck className="text-green-500" size={18} />
                      ) : (
                        <CircleX className="text-red-500" size={18} />
                      )
                    ) : null}
                  </div>
                </div>
                {userMessage && usernameMsg && (
                  <p className={`mt-1 text-sm ${uniqueUsername ? "text-green-500" : "text-red-500"}`}>
                    {userMessage}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* FULL NAME + DOB side by side on larger screens */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Date of birth</FormLabel>
                  <FormControl>
                    <Input type="date" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className={`${primaryButtonClass} mt-2`}
            disabled={isFormSubmitting || isCheckingUsername || !uniqueUsername}
          >
            {isFormSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Create account"
            )}
          </Button>

          <p className="pt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
              Log in
            </Link>
          </p>
        </form>
      </Form>
    </AuthLayout>
  );
}