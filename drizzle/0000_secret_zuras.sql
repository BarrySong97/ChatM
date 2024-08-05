CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '',
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '',
	`type` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text DEFAULT '' NOT NULL,
	`type` integer NOT NULL,
	`date` integer DEFAULT 0 NOT NULL,
	`content` text DEFAULT '',
	`amount` integer DEFAULT 0,
	`source` text DEFAULT '',
	`description` text DEFAULT '',
	`category_id` text,
	`account_id` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
