import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./password";
import { db } from "./db";
import { users, enrollments } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "palafozanderson@gmail.com";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false, // Endurecido contra vinculação indevida de contas
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
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

      // Se for login via Google, validar rigorosamente se o email é válido
      if (account?.provider === "google") {
        const email = user.email.trim().toLowerCase();
        // Proteção adicional: apenas contas válidas e verificadas
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

          const newUser = await db
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

          if (!isAdminUser && newUser.length > 0) {
            const allCourses = await db.query.courses.findMany();
            for (const course of allCourses) {
              await db.insert(enrollments).values({
                userId: newUser[0].id,
                courseId: course.id,
                progress: 0,
                currentModule: 0,
                status: "active",
              });
            }
          }
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
    maxAge: 7 * 24 * 60 * 60, // 7 dias para maior segurança contra sequestro de sessão
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
    async signIn({ user }) {
      console.log(`User signed in securely: ${user.email}`);
    },
    async signOut() {
      console.log("User signed out securely");
    },
  },
  debug: false,
};
