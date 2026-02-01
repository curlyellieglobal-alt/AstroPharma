ALTER TABLE `notifications` MODIFY COLUMN `type` enum('order','low_stock','system','custom','message','user') NOT NULL;--> statement-breakpoint
ALTER TABLE `notificationPreferences` ADD `pushNotifications` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `notificationPreferences` ADD `telegramNotifications` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `entityType` varchar(50);--> statement-breakpoint
ALTER TABLE `notifications` ADD `entityId` int;