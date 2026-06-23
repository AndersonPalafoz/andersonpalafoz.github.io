import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getCourses, getMaterials, getArticles, getArticleBySlug, getUserEnrollments, enrollUserInCourse, getUserCertificates, getCourseActivities } from "./db";
import { z } from "zod";
import { serialize } from "cookie";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // Serializa um cookie expirado para invalidar a sessão
      const expired = serialize(COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        sameSite: "none",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
      });

      // Em ambientes Express ctx.res.clearCookie existia; aqui garantimos compatibilidade Next/Express
      if (typeof ctx.res?.setHeader === "function") {
        ctx.res.setHeader("Set-Cookie", expired);
      } else if (typeof ctx.res?.clearCookie === "function") {
        ctx.res.clearCookie(COOKIE_NAME, { path: "/", httpOnly: true });
      }

      return {
        success: true,
      } as const;
    }),
  }),

  courses: router({
    list: publicProcedure.query(() => getCourses()),
    enrollments: protectedProcedure.query(({ ctx }) => getUserEnrollments(ctx.user.id)),
    enroll: protectedProcedure.input(z.object({ courseId: z.number() })).mutation(({ ctx, input }) => enrollUserInCourse(ctx.user.id, input.courseId)),
  }),

  materials: router({
    list: publicProcedure.query(() => getMaterials()),
  }),

  articles: router({
    list: publicProcedure.query(() => getArticles()),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => getArticleBySlug(input.slug)),
  }),

  certificates: router({
    list: protectedProcedure.query(({ ctx }) => getUserCertificates(ctx.user.id)),
  }),

  activities: router({
    byCourse: publicProcedure.input(z.object({ courseId: z.number() })).query(({ input }) => getCourseActivities(input.courseId)),
  }),
});

export type AppRouter = typeof appRouter;
