CREATE TABLE "lessonProgress" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"lessonId" serial NOT NULL,
	"completed" integer DEFAULT 0,
	"watchedDuration" integer DEFAULT 0,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"moduleId" serial NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"videoUrl" varchar(500),
	"duration" integer,
	"order" integer NOT NULL,
	"content" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" serial NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
