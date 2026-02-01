CREATE TABLE `paymentMethods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('stripe','fawry','payoneer','cod','instapay','vodafone_cash') NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`description` text,
	`isVisible` boolean NOT NULL DEFAULT true,
	`displayOrder` int DEFAULT 0,
	`icon` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentMethods_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentMethods_provider_unique` UNIQUE(`provider`)
);
