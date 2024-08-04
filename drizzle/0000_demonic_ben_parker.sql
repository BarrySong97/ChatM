CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
