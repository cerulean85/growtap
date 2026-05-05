CREATE TABLE "routine_task_completion" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"routineId" text NOT NULL,
	"taskId" text NOT NULL,
	"dayKey" text NOT NULL,
	"completed" boolean DEFAULT true NOT NULL,
	"memo" text,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_task" (
	"id" text PRIMARY KEY NOT NULL,
	"routineId" text NOT NULL,
	"title" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"archivedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "routine" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"archivedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "routine_task_completion" ADD CONSTRAINT "routine_task_completion_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_task_completion" ADD CONSTRAINT "routine_task_completion_routineId_routine_id_fk" FOREIGN KEY ("routineId") REFERENCES "public"."routine"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_task_completion" ADD CONSTRAINT "routine_task_completion_taskId_routine_task_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."routine_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_task" ADD CONSTRAINT "routine_task_routineId_routine_id_fk" FOREIGN KEY ("routineId") REFERENCES "public"."routine"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine" ADD CONSTRAINT "routine_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "routine_task_completion_day_task_idx" ON "routine_task_completion" USING btree ("taskId","dayKey");