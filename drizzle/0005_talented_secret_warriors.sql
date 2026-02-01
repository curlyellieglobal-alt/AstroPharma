ALTER TABLE `chatConversations` MODIFY COLUMN `customerPhone` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `customerPhone` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `paymentMethod` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `paymentProvider` enum('stripe','fawry','payoneer','cod','instapay','vodafone_cash') NOT NULL;