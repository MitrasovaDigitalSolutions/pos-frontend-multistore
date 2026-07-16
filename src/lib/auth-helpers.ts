import { signOut as nextAuthSignOut } from "next-auth/react";
import { apiClient } from "@/shared/api/axios";
import { useActiveStoreStore } from "@/stores/active-store-store";

/**
 * Custom signOut helper that logs the user out from the backend API
 * before clearing the NextAuth session.
 */
export async function signOut(options?: Parameters<typeof nextAuthSignOut>[0]) {
  try {
    // Clear the active store in local storage / Zustand
    useActiveStoreStore.getState().setActiveStore(null);
    await apiClient.post("/v1/auth/logout");
  } catch (error) {
    console.error("Gagal memanggil API logout backend:", error);
  }
  return nextAuthSignOut(options);
}
