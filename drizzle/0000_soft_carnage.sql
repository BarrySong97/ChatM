CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`name` text,
	`color` text,
	`icon` text,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `expense` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`name` text,
	`color` text,
	`icon` text,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `income` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`name` text,
	`color` text,
	`icon` text,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `liability` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`name` text,
	`color` text,
	`icon` text,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `transaction` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`created_at` integer,
	`updated_at` integer,
	`color` text,
	`type` text,
	`source` text,
	`source_account_id` text,
	`destination_account_id` text,
	`amount` integer
);
