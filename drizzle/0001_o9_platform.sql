CREATE TABLE `cron_runs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`job` varchar(64) NOT NULL,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`finished_at` datetime,
	`ok` boolean NOT NULL DEFAULT false,
	`note` text,
	CONSTRAINT `cron_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`user_id` bigint unsigned NOT NULL,
	`lesson_id` bigint unsigned NOT NULL,
	`completed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lesson_progress_user_id_lesson_id_pk` PRIMARY KEY(`user_id`,`lesson_id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`module_id` bigint unsigned NOT NULL,
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	`min_tier` enum('entry','insider') NOT NULL DEFAULT 'entry',
	`drip_days` int NOT NULL DEFAULT 0,
	`content_path` varchar(512),
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`),
	CONSTRAINT `lessons_module_slug_uq` UNIQUE(`module_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta'),
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`sort` int NOT NULL DEFAULT 0,
	`min_tier` enum('entry','insider') NOT NULL DEFAULT 'entry',
	`drip_days` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `modules_site_slug_uq` UNIQUE(`site`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `provider_customers` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`provider` enum('stripe','lemonsqueezy') NOT NULL,
	`provider_customer_id` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `provider_customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `provider_customers_uq` UNIQUE(`provider`,`provider_customer_id`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta'),
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`file_key` varchar(512) NOT NULL,
	`min_tier` enum('entry','insider') NOT NULL DEFAULT 'entry',
	`sort` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resources_id` PRIMARY KEY(`id`),
	CONSTRAINT `resources_site_slug_uq` UNIQUE(`site`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta') NOT NULL DEFAULT 'guide',
	`product_id` bigint unsigned,
	`user_id` bigint unsigned NOT NULL,
	`provider` enum('stripe','lemonsqueezy') NOT NULL DEFAULT 'lemonsqueezy',
	`provider_subscription_id` varchar(128) NOT NULL,
	`status` enum('active','past_due','cancelled','expired','paused') NOT NULL DEFAULT 'active',
	`current_period_end` datetime,
	`cancelled_at` datetime,
	`ends_at` datetime,
	`raw` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_provider_uq` UNIQUE(`provider`,`provider_subscription_id`)
);
--> statement-breakpoint
CREATE TABLE `updates_posts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta'),
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`min_tier` enum('entry','insider') NOT NULL DEFAULT 'entry',
	`published_at` datetime,
	`content_path` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `updates_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `updates_posts_site_slug_uq` UNIQUE(`site`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`provider` enum('stripe','lemonsqueezy') NOT NULL,
	`provider_event_id` varchar(191) NOT NULL,
	`type` varchar(120) NOT NULL,
	`payload` json,
	`received_at` timestamp NOT NULL DEFAULT (now()),
	`processed_at` datetime,
	`error` text,
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhook_events_provider_event_uq` UNIQUE(`provider`,`provider_event_id`)
);
--> statement-breakpoint
--
-- HAND-WRITTEN (plan §5.4.3). drizzle-kit generated `DROP TABLE orders` plus a
-- fresh `CREATE TABLE purchases`, which would delete every paid order. These
-- rows are money. The table is RENAMED and its columns CHANGED in place, so
-- ids, foreign keys and history all survive.
--
RENAME TABLE `orders` TO `purchases`;--> statement-breakpoint
ALTER TABLE `purchases` DROP INDEX `orders_stripe_session_uq`;--> statement-breakpoint
ALTER TABLE `purchases` DROP INDEX `orders_email_idx`;--> statement-breakpoint
ALTER TABLE `purchases` DROP INDEX `orders_status_idx`;--> statement-breakpoint
ALTER TABLE `purchases` CHANGE COLUMN `stripe_session_id` `provider_checkout_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `purchases` CHANGE COLUMN `stripe_payment_intent` `provider_order_id` varchar(255);--> statement-breakpoint
ALTER TABLE `purchases` ADD `user_id` bigint unsigned AFTER `product_id`;--> statement-breakpoint
ALTER TABLE `purchases` ADD `provider` enum('stripe','lemonsqueezy') NOT NULL DEFAULT 'stripe' AFTER `name`;--> statement-breakpoint
ALTER TABLE `purchases` ADD `raw` json AFTER `utm`;--> statement-breakpoint
-- Every pre-O9 row came through Stripe Checkout, and the new column's default
-- says so, so no backfill is needed.
ALTER TABLE `purchases` MODIFY COLUMN `site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta') NOT NULL DEFAULT 'guide';--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_checkout_uq` UNIQUE(`provider_checkout_id`);--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_provider_order_uq` UNIQUE(`provider`,`provider_order_id`);--> statement-breakpoint
DROP INDEX `download_tokens_order_idx` ON `download_tokens`;--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta') NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` MODIFY COLUMN `site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password_hash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','editor','member') NOT NULL DEFAULT 'member';--> statement-breakpoint
-- HAND-WRITTEN: a rename, not an add+drop — the token rows point at real orders.
ALTER TABLE `download_tokens` CHANGE COLUMN `order_id` `purchase_id` bigint unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `attribution` json;--> statement-breakpoint
ALTER TABLE `leads` ADD `dedupe_key` varchar(64);--> statement-breakpoint
ALTER TABLE `products` ADD `site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta') DEFAULT 'guide' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `tier` enum('entry','insider') DEFAULT 'entry' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `kind` enum('one_time','subscription') DEFAULT 'one_time' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `provider` enum('stripe','lemonsqueezy') DEFAULT 'stripe' NOT NULL;--> statement-breakpoint
-- HAND-WRITTEN: a rename, so a live Stripe price id is not thrown away.
ALTER TABLE `products` CHANGE COLUMN `stripe_price_id` `provider_price_id` varchar(128);--> statement-breakpoint
--
-- HAND-WRITTEN: O2 sold one product under the slug `paraguay-residency-guide`.
-- O9 renames it `guide-entry` (plan §12.2). This is an UPDATE, not a delete and
-- re-insert, because `purchases.product_id` points at this exact row. The
-- WHERE guard makes it a no-op on a database that already has `guide-entry`,
-- so the migration stays safe to re-run.
--
UPDATE `products` SET `slug` = 'guide-entry'
  WHERE `slug` = 'paraguay-residency-guide'
    AND NOT EXISTS (SELECT 1 FROM (SELECT `slug` FROM `products`) p WHERE p.`slug` = 'guide-entry');--> statement-breakpoint
ALTER TABLE `products` ADD `interval` enum('month','year');--> statement-breakpoint
ALTER TABLE `users` ADD `tier` enum('none','entry','insider') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `tier_expires_at` datetime;--> statement-breakpoint
ALTER TABLE `users` ADD `home_site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta');--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_at` datetime;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_dedupe_key_uq` UNIQUE(`dedupe_key`);--> statement-breakpoint
CREATE INDEX `cron_runs_job_started_idx` ON `cron_runs` (`job`,`started_at`);--> statement-breakpoint
CREATE INDEX `lessons_module_idx` ON `lessons` (`module_id`);--> statement-breakpoint
CREATE INDEX `provider_customers_user_idx` ON `provider_customers` (`user_id`);--> statement-breakpoint
CREATE INDEX `purchases_email_idx` ON `purchases` (`email`);--> statement-breakpoint
CREATE INDEX `purchases_status_idx` ON `purchases` (`status`);--> statement-breakpoint
CREATE INDEX `purchases_user_idx` ON `purchases` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `webhook_events_type_idx` ON `webhook_events` (`type`);--> statement-breakpoint
CREATE INDEX `download_tokens_purchase_idx` ON `download_tokens` (`purchase_id`);--> statement-breakpoint
CREATE INDEX `products_site_idx` ON `products` (`site`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_tier_idx` ON `users` (`tier`);
