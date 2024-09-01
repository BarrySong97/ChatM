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
	`content` text,
	`created_at` integer,
	`updated_at` integer,
	`transaction_date` integer,
	`type` text,
	`source` text,
	`source_account_id` text,
	`remark` text,
	`destination_account_id` text,
	`amount` integer
);
--> statement-breakpoint
CREATE TABLE `transaction_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
