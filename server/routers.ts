import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getCourses, getMaterials, getArticles, getArticleBySlug, getUserEnrollments, enrollUserInCourse, getUserCertificates, getCourseActivities } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
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
