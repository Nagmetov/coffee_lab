"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
  emailVerified: boolean;
  loyaltyPoints: number;
  loyaltyTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  createdAt: string;
};

async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const response = await apiFetch("/api/auth/me");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Не удалось получить профиль");
  const data = await response.json();
  return data.user;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
  });
}

export function useInvalidateCurrentUser() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["current-user"] });
}
