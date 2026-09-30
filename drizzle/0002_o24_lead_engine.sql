CREATE TABLE `lead_deliveries` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`lead_id` bigint unsigned NOT NULL,
	`channel` enum('crm','notify','autoreply') NOT NULL,
	`status` enum('pending','sent','failed','dead','skipped') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`next_attempt_at` datetime,
	`last_attempt_at` datetime,
	`delivered_at` datetime,
	`last_error` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lead_deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `lead_deliveries_lead_channel_uq` UNIQUE(`lead_id`,`channel`)
);
--> statement-breakpoint
CREATE TABLE `site_events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`site` enum('residency','investorpass','guide','frontier','residenciaes','residenciapt','flytta') NOT NULL,
	`type` varchar(40) NOT NULL,
	`path` varchar(512),
	`placement` varchar(40),
	`slug` varchar(191),
	`variant` varchar(120),
	`source` varchar(120),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leads` MODIFY COLUMN `kind` enum('consultation','investor_inquiry','contact','quiz','whatsapp') NOT NULL;--> statement-breakpoint
CREATE INDEX `lead_deliveries_due_idx` ON `lead_deliveries` (`status`,`next_attempt_at`);--> statement-breakpoint
CREATE INDEX `lead_deliveries_delivered_idx` ON `lead_deliveries` (`delivered_at`);--> statement-breakpoint
CREATE INDEX `site_events_type_created_idx` ON `site_events` (`type`,`created_at`);--> statement-breakpoint
CREATE INDEX `site_events_site_idx` ON `site_events` (`site`);