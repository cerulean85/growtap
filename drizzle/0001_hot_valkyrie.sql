CREATE TABLE "goal" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"color" text DEFAULT 'zinc' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"archivedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "tap" (
	"id" text PRIMARY KEY NOT NULL,
	"goalId" text NOT NULL,
	"userId" text NOT NULL,
	"tappedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "goal" ADD CONSTRAINT "goal_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tap" ADD CONSTRAINT "tap_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tap" ADD CONSTRAINT "tap_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;