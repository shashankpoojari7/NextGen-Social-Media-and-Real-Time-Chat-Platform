"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/services/axios";
import Link from "next/link";
import ConnectSkeleton from "@/components/skeletons/ConnectSkeleton";
import Image from "next/image";

export interface ConnectType {
  _id: string;
  username: string;
  profile_image: string;
  fullname: string;
}

const gridClass = "mt-6 grid grid-cols-2 gap-3 px-4 md:grid-cols-3 md:gap-4 md:px-6";

export default function PeopleList() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["discover-users"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/user/connect");
      return res.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
      <div className="mx-auto w-full max-w-5xl pb-10">
        <div className="sticky top-0 z-10 flex items-center border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-zinc-900 dark:bg-[#0a0a0a]/80 md:px-6">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-2 mr-2 rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 md:hidden"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Discover people</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Find people to follow and connect with
            </p>
          </div>
        </div>

        {isLoading && (
          <div className={gridClass}>
            <ConnectSkeleton count={12} />
          </div>
        )}

        {!isLoading && data && data.length > 0 && (
          <div className={gridClass}>
            {data.map((user: ConnectType) => (
              <Link
                key={user._id}
                href={`/profile/${user.username}`}
                className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-4 text-center transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#0f0f0f] dark:hover:border-zinc-700 dark:hover:bg-zinc-900 md:p-5"
              >
                <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-800 md:h-20 md:w-20">
                  <Image
                    fill
                    sizes="80px"
                    src={user.profile_image || "/no-profile.jpg"}
                    alt={`${user.username}'s profile`}
                    className="object-cover"
                  />
                </div>

                <h3 className="w-full truncate text-[15px] font-semibold">{user.username}</h3>
                <p className="mt-0.5 w-full truncate text-sm text-zinc-500 dark:text-zinc-400">
                  {user.fullname}
                </p>

                <span className="mt-4 w-full rounded-lg border border-zinc-300 py-1.5 text-sm font-medium transition-colors dark:border-zinc-700">
                  View profile
                </span>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              <Users className="h-6 w-6" />
            </div>
            <p className="mb-1 text-lg font-semibold">No users found</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Check back later for new people to connect with
            </p>
          </div>
        )}
      </div>
    </div>
  );
}