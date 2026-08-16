CREATE TABLE "site_content_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"pageKey" varchar(100) NOT NULL,
	"sectionKey" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
