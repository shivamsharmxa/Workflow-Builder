CREATE TABLE "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"edges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"credits" integer DEFAULT 149 NOT NULL,
	"runs" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
