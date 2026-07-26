import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { users, enrollments } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "palafozanderson@gmail.com";

export const authOptions: NextAuthOptions = {
  providers: process.env.GOOGLE_CLIENT_ID
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : [],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        // Check if user exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!existingUser) {
          // Create new user with appropriate role
          const isAdminUser = user.email === ADMIN_EMAIL;
          const userRole = isAdminUser ? "admin" : "user";

          const newUser = await db
            .insert(users)
            .values({
              openId: account?.providerAccountId || "",
              name: user.name || "User",
              email: user.email,
              loginMethod: "google",
              role: userRole,
            })
            .returning();

          // If new user is not admin, enroll them in all available courses with 0% progress
          if (!isAdminUser && newUser.length > 0) {
            const allCourses = await db.query.courses.findMany();

            for (const course of allCourses) {
              // Create enrollment with 0% progress
              await db.insert(enrollments).values({
                userId: newUser[0].id,
                courseId: course.id,
                progress: 0,
                currentModule: 0,
                status: "active",
              });
            }
          }
        } else if (existingUser.email === ADMIN_EMAIL && existingUser.role !== "admin") {
          // Ensure admin email always has admin role
          await db
            .update(users)
            .set({ role: "admin" })
            .where(eq(users.email, ADMIN_EMAIL));
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return true;
      }
    },

    async session({ session, token }) {
      // Antes, este callback fazia sua PROPRIA consulta ao banco,
      // ignorando o que o callback jwt() (acima) ja tinha resolvido.
      // Isso significava duas consultas redundantes por checagem de
      // sessao, e -- mais grave -- a rede de seguranca do ADMIN_EMAIL
      // em jwt() nao tinha efeito nenhum aqui, entao app/admin/layout.tsx
      // (que usa getServerSession, e portanto passa por este callback)
      // continuava bloqueando o admin mesmo com o middleware corrigido.
      // Agora so herdamos o que o token ja resolveu, com uma unica
      // fonte de verdade.
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string;
        }
        if (token.role) {
          session.user.role = token.role as "user" | "professor" | "admin";
        }
      }

      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      if (account) {
        token.provider = account.provider;
      }

      // CRITICO: o middleware (middleware.ts) protege /admin lendo
      // token.role diretamente via getToken(), sem passar pelo
      // callback session() abaixo. Sem isso aqui, token.role nunca
      // era preenchido e NINGUEM conseguia acessar /admin, incluindo
      // o proprio admin.
      if (token.email) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, token.email as string),
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id.toString();
          }
        } catch (error) {
          console.error("Error resolving user role in jwt callback:", error);
        }

        // Rede de seguranca: a conta definida em ADMIN_EMAIL nunca pode
        // ficar de fora do painel /admin so porque a consulta acima
        // falhou (banco fora do ar, credencial errada, etc). Isso nao
        // resolve um banco quebrado, mas garante que o admin sempre
        // consiga pelo menos entrar no painel para investigar.
        if (token.email === ADMIN_EMAIL) {
          token.role = "admin";
        }
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
    maxAge: 30 * 24 * 60 * 60,
  },
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut() {
      console.log("User signed out");
    },
  },
  debug: process.env.NODE_ENV === "development",
};
