import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id?: string;
      role?: "user" | "professor" | "admin" | "super_admin";
      approvalStatus?: "pending" | "approved" | "rejected";
      deletedAt?: string | null;
      image?: string | null;
      avatarUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: "user" | "professor" | "admin" | "super_admin";
    image?: string | null;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: string;
    role?: "user" | "professor" | "admin" | "super_admin";
    approvalStatus?: "pending" | "approved" | "rejected";
    deletedAt?: string | null;
    picture?: string | null;
    avatarUrl?: string | null;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    scope?: string;
  }
}
