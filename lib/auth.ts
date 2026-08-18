import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./password";
import { db } from "./db";
import { eventLogs, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "palafozanderson@gmail.com";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false,
      authorization: {
        params: {
          // Login básico não solicita escopos do Google Workspace.
          // Calendar/Classroom devem ser autorizados em fluxos explícitos para não bloquear o acesso da conta.
          prompt: "select_account",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    })] : []),
    CredentialsProvider({
      name: "E-mail e senha",
      credentials: { email: { label: "E-mail", type: "email" }, password: { label: "Senha", type: "password" } },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;
        const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!existingUser || existingUser.deletedAt || !verifyPassword(password, existingUser.passwordHash)) return null;
        return { id: String(existingUser.id), email: existingUser.email || email, name: existingUser.name || email, image: existingUser.avatarUrl || undefined };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider === "google") {
        const email = user.email.trim().toLowerCase();
        if (!email) return false;
      }

      try {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!existingUser) {
          const isAdminUser = user.email === ADMIN_EMAIL;
          const userRole = isAdminUser ? "admin" : "user";
          const initialApprovalStatus = isAdminUser ? "approved" : "pending";

          // Nova conta criada sem nenhuma matrícula ou progresso automático (vazia por padrão)
          await db
            .insert(users)
            .values({
              openId: account?.providerAccountId || "",
              name: user.name || "User",
              email: user.email,
              loginMethod: "google",
              role: userRole,
              approvalStatus: initialApprovalStatus,
              avatarUrl: user.image || null,
            })
            .returning();
        } else {
          if (existingUser.email === ADMIN_EMAIL) {
            if (existingUser.role !== "admin" || existingUser.approvalStatus !== "approved" || existingUser.deletedAt !== null) {
              await db
                .update(users)
                .set({ role: "admin", approvalStatus: "approved", deletedAt: null })
                .where(eq(users.email, ADMIN_EMAIL));
            }
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true;
      }
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.role) {
          session.user.role = token.role as "user" | "professor" | "admin";
        }
        if (token.approvalStatus) {
          session.user.approvalStatus = token.approvalStatus as "pending" | "approved" | "rejected";
        }
        if (token.avatarUrl) {
          session.user.avatarUrl = token.avatarUrl as string;
          session.user.image = token.avatarUrl as string;
        } else if (token.picture) {
          session.user.image = token.picture as string;
        }
      }

      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.picture = user.image || token.picture || null;
      }

      if (account) {
        token.provider = account.provider;
        if (account.provider === "google") {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
          token.scope = account.scope;
        }
      }

      if (token.email) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, token.email as string),
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.approvalStatus = dbUser.approvalStatus;
            token.deletedAt = dbUser.deletedAt?.toISOString() ?? null;
            token.id = dbUser.id.toString();
            token.avatarUrl = dbUser.avatarUrl;
            token.picture = dbUser.avatarUrl || token.picture || null;
          }
        } catch (error) {
          console.error("Error resolving user role in jwt callback:", error);
        }

        if (token.email === ADMIN_EMAIL) {
          token.role = "admin";
          token.approvalStatus = "approved";
        }
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 12 * 60 * 60,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
    maxAge: 7 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log(`User signed in securely: ${user.email}`);
      if (!user.email) return;
      try {
        const dbUser = await db.query.users.findFirst({ where: eq(users.email, user.email) });
        if (!dbUser) return;
        const signedInAt = new Date();
        await Promise.all([
          db.update(users).set({ lastSignedIn: signedInAt, updatedAt: signedInAt }).where(eq(users.id, dbUser.id)),
          db.insert(eventLogs).values({
            userId: dbUser.id,
            userEmail: dbUser.email,
            eventType: "login",
            details: JSON.stringify({ provider: account?.provider || "unknown" }),
          }),
        ]);
      } catch (error) {
        console.error("Unable to persist login audit event:", error);
      }
    },
    async signOut() {
      console.log("User signed out securely");
    },
  },
  debug: false,
};
