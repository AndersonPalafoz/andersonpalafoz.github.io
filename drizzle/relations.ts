import { relations } from "drizzle-orm";
import {
  users,
  courses,
  enrollments,
  activities,
  userActivityProgress,
  speakingAttempts,
  certificates,
  progress,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  certificates: many(certificates),
  activityProgress: many(userActivityProgress),
  speakingAttempts: many(speakingAttempts),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
  activities: many(activities),
  certificates: many(certificates),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  course: one(courses, {
    fields: [activities.courseId],
    references: [courses.id],
  }),
  progress: many(userActivityProgress),
  speakingAttempts: many(speakingAttempts),
}));

export const userActivityProgressRelations = relations(
  userActivityProgress,
  ({ one }) => ({
    user: one(users, {
      fields: [userActivityProgress.userId],
      references: [users.id],
    }),
    activity: one(activities, {
      fields: [userActivityProgress.activityId],
      references: [activities.id],
    }),
  })
);

export const speakingAttemptsRelations = relations(speakingAttempts, ({ one }) => ({
  user: one(users, {
    fields: [speakingAttempts.userId],
    references: [users.id],
  }),
  activity: one(activities, {
    fields: [speakingAttempts.activityId],
    references: [activities.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [progress.courseId],
    references: [courses.id],
  }),
}));
