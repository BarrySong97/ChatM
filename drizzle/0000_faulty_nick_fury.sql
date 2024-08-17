CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`name` text,
	`color` text,
	`initial_balance` text,
	`icon` text
);
--> statement-breakpoint
CREATE TABLE `expense` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`name` text,
	`color` text,
	`icon` text
);
--> statement-breakpoint
CREATE TABLE `income` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`name` text,
	`color` text,
	`icon` text
);
--> statement-breakpoint
CREATE TABLE `liability` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer,
	`name` text,
	`color` text,
	`initial_balance` text,
	`icon` text
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`created_at` integer,
	`updated_at` integer,
	`transaction_date` integer,
	`color` text,
	`type` text,
	`source` text,
	`source_account_id` text,
	`remark` text,
	`destination_account_id` text,
	`test` text,
	`test1` text,
	`tags` text,
	`amount` text
);
